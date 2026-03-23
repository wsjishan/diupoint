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
  addCartItem,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from '@/lib/api/cart';
import type { ApiCartItem } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';

interface CartActionResult {
  ok: boolean;
  requiresAuth?: boolean;
  errorMessage?: string;
  item?: ApiCartItem;
}

interface CartContextValue {
  items: ApiCartItem[];
  isLoading: boolean;
  itemCount: number;
  quantityCount: number;
  subtotal: number;
  refreshCart: () => Promise<void>;
  addToCart: (
    listingId: string,
    quantity?: number
  ) => Promise<CartActionResult>;
  setItemQuantity: (
    itemId: string,
    quantity: number
  ) => Promise<CartActionResult>;
  removeFromCart: (itemId: string) => Promise<CartActionResult>;
}

const CartContext = createContext<CartContextValue | null>(null);

function normalizeUnitPrice(value: number | string): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    const jsonStartIndex = error.message.indexOf('{');

    if (jsonStartIndex >= 0) {
      const jsonText = error.message.slice(jsonStartIndex);

      try {
        const parsed = JSON.parse(jsonText) as { message?: string | string[] };

        if (Array.isArray(parsed.message) && parsed.message.length > 0) {
          return parsed.message[0];
        }

        if (typeof parsed.message === 'string' && parsed.message.length > 0) {
          return parsed.message;
        }
      } catch {
        return fallback;
      }
    }
  }

  return fallback;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<ApiCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const cart = await fetchCart();
      setItems(cart.items);
    } catch {
      setItems([]);
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
      setItems([]);
      setIsLoading(false);
      return;
    }

    void refreshCart();
  }, [isAuthenticated, isAuthLoading, refreshCart]);

  const addToCart = useCallback(
    async (listingId: string, quantity = 1): Promise<CartActionResult> => {
      if (!isAuthenticated) {
        return {
          ok: false,
          requiresAuth: true,
        };
      }

      try {
        const item = await addCartItem({ listingId, quantity });

        setItems((previous) => {
          const existingIndex = previous.findIndex(
            (candidate) => candidate.id === item.id
          );

          if (existingIndex >= 0) {
            const next = [...previous];
            next[existingIndex] = item;
            return next;
          }

          const byListingIndex = previous.findIndex(
            (candidate) => candidate.listingId === item.listingId
          );

          if (byListingIndex >= 0) {
            const next = [...previous];
            next[byListingIndex] = item;
            return next;
          }

          return [item, ...previous];
        });

        return {
          ok: true,
          item,
        };
      } catch (addError) {
        return {
          ok: false,
          errorMessage: extractErrorMessage(
            addError,
            'Unable to add item to cart right now.'
          ),
        };
      }
    },
    [isAuthenticated]
  );

  const setItemQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<CartActionResult> => {
      if (!isAuthenticated) {
        return {
          ok: false,
          requiresAuth: true,
        };
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return {
          ok: false,
          errorMessage: 'Quantity must be between 1 and 99.',
        };
      }

      try {
        const updated = await updateCartItem(itemId, { quantity });
        setItems((previous) =>
          previous.map((candidate) =>
            candidate.id === itemId ? updated : candidate
          )
        );

        return {
          ok: true,
          item: updated,
        };
      } catch (updateError) {
        return {
          ok: false,
          errorMessage: extractErrorMessage(
            updateError,
            'Unable to update quantity right now.'
          ),
        };
      }
    },
    [isAuthenticated]
  );

  const removeFromCart = useCallback(
    async (itemId: string): Promise<CartActionResult> => {
      if (!isAuthenticated) {
        return {
          ok: false,
          requiresAuth: true,
        };
      }

      try {
        await removeCartItem(itemId);
        setItems((previous) =>
          previous.filter((candidate) => candidate.id !== itemId)
        );

        return {
          ok: true,
        };
      } catch (removeError) {
        return {
          ok: false,
          errorMessage: extractErrorMessage(
            removeError,
            'Unable to remove item right now.'
          ),
        };
      }
    },
    [isAuthenticated]
  );

  const itemCount = items.length;
  const quantityCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + normalizeUnitPrice(item.unitPrice) * item.quantity,
    0
  );

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      isLoading,
      itemCount,
      quantityCount,
      subtotal,
      refreshCart,
      addToCart,
      setItemQuantity,
      removeFromCart,
    };
  }, [
    items,
    isLoading,
    itemCount,
    quantityCount,
    subtotal,
    refreshCart,
    addToCart,
    setItemQuantity,
    removeFromCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
