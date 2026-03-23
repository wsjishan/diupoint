'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addFavorite,
  fetchFavorites,
  removeFavorite,
} from '@/lib/api/favorites';
import type { ApiFavorite } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';

interface ToggleFavoriteResult {
  ok: boolean;
  requiresAuth?: boolean;
  errorMessage?: string;
}

interface FavoritesContextValue {
  favorites: ApiFavorite[];
  isLoading: boolean;
  isFavorited: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<ToggleFavoriteResult>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [favorites, setFavorites] = useState<ApiFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optimisticFavoriteState, setOptimisticFavoriteState] = useState<
    Record<string, boolean>
  >({});

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetchFavorites();
      setFavorites(data);
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setFavorites([]);
      setOptimisticFavoriteState({});
      setIsLoading(false);
      return;
    }

    void refreshFavorites();
  }, [isAuthenticated, isAuthLoading, refreshFavorites]);

  const favoritedIds = useMemo(() => {
    return new Set(favorites.map((favorite) => favorite.listingId));
  }, [favorites]);

  const isFavorited = useCallback(
    (listingId: string) => {
      if (listingId in optimisticFavoriteState) {
        return optimisticFavoriteState[listingId];
      }

      return favoritedIds.has(listingId);
    },
    [favoritedIds, optimisticFavoriteState]
  );

  const toggleFavorite = useCallback(
    async (listingId: string): Promise<ToggleFavoriteResult> => {
      if (!isAuthenticated) {
        return {
          ok: false,
          requiresAuth: true,
        };
      }

      const currentlyFavorited = isFavorited(listingId);
      const nextFavorited = !currentlyFavorited;

      setOptimisticFavoriteState((previous) => ({
        ...previous,
        [listingId]: nextFavorited,
      }));

      try {
        if (currentlyFavorited) {
          await removeFavorite(listingId);
          setFavorites((previous) =>
            previous.filter((favorite) => favorite.listingId !== listingId)
          );
        } else {
          const created = await addFavorite(listingId);
          setFavorites((previous) => {
            const exists = previous.some(
              (favorite) => favorite.listingId === listingId
            );
            if (exists) return previous;
            return [created, ...previous];
          });
        }

        return { ok: true };
      } catch {
        return {
          ok: false,
          errorMessage: 'Unable to update favorites right now.',
        };
      } finally {
        setOptimisticFavoriteState((previous) => {
          const next = { ...previous };
          delete next[listingId];
          return next;
        });
      }
    },
    [isAuthenticated, isFavorited]
  );

  const value = useMemo<FavoritesContextValue>(() => {
    return {
      favorites,
      isLoading,
      isFavorited,
      toggleFavorite,
      refreshFavorites,
    };
  }, [favorites, isLoading, isFavorited, toggleFavorite, refreshFavorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }

  return context;
}
