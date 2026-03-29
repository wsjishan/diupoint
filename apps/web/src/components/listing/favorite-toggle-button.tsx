'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/lib/favorites/favorites-context';
import { APP_ROUTES, createSignInHref } from '@/lib/routes';

interface FavoriteToggleButtonProps {
  listingId: string;
  className?: string;
  iconClassName?: string;
  showText?: boolean;
}

export default function FavoriteToggleButton({
  listingId,
  className = '',
  iconClassName = 'h-4 w-4',
  showText = false,
}: FavoriteToggleButtonProps) {
  const router = useRouter();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const favorited = isFavorited(listingId);

  async function handleToggle() {
    setErrorMessage(null);
    const result = await toggleFavorite(listingId);

    if (result.requiresAuth) {
      if (typeof window === 'undefined') {
        router.push(APP_ROUTES.signIn);
        return;
      }

      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.push(createSignInHref(returnTo));
      return;
    }

    if (!result.ok && result.errorMessage) {
      setErrorMessage(result.errorMessage);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorited}
        className={`${className} ${favorited ? 'text-rose-500 dark:text-rose-300' : ''}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={favorited ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.75}
          className={`${iconClassName} transition-colors`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        {showText ? (
          <span className="ml-1.5 text-xs font-semibold">
            {favorited ? 'Saved' : 'Save'}
          </span>
        ) : null}
      </button>

      {errorMessage ? (
        <p className="absolute right-0 top-full mt-1 whitespace-nowrap text-[11px] font-medium text-rose-600 dark:text-rose-300">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
