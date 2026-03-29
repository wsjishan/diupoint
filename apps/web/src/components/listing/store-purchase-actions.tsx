'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { useCart } from '@/lib/cart/cart-context';
import { APP_ROUTES, createSignInHref } from '@/lib/routes';

interface StorePurchaseActionsProps {
  listingId: string;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  compact?: boolean;
}

export default function StorePurchaseActions({
  listingId,
  stockStatus,
  compact = false,
}: StorePurchaseActionsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOutOfStock = stockStatus === 'out-of-stock';

  async function runAddToCart(redirectToCheckout: boolean) {
    if (isOutOfStock) return;

    setFeedback(null);
    setError(null);

    if (redirectToCheckout) {
      setIsBuyingNow(true);
    } else {
      setIsAdding(true);
    }

    try {
      const result = await addToCart(listingId, 1);

      if (result.requiresAuth) {
        if (typeof window === 'undefined') {
          router.push(APP_ROUTES.signIn);
          return;
        }

        const returnTo = `${window.location.pathname}${window.location.search}`;
        router.push(createSignInHref(returnTo));
        return;
      }

      if (!result.ok) {
        setError(result.errorMessage ?? 'Unable to update cart right now.');
        return;
      }

      if (redirectToCheckout) {
        router.push(APP_ROUTES.checkout);
        return;
      }

      setFeedback('Added to cart.');
    } finally {
      setIsAdding(false);
      setIsBuyingNow(false);
    }
  }

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <div
        className={
          compact
            ? 'flex items-center gap-2.5'
            : 'grid grid-cols-1 gap-2 sm:grid-cols-2'
        }
      >
        <Button
          variant="secondary"
          className={
            compact
              ? 'h-10 px-4 text-xs'
              : 'h-10 w-full border-indigo-300 bg-white text-[#2F3FBF] hover:bg-indigo-100/80 dark:border-indigo-400/35 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-500/20'
          }
          disabled={isOutOfStock || isAdding || isBuyingNow}
          onClick={() => {
            void runAddToCart(false);
          }}
        >
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>

        <Button
          className={
            compact
              ? 'h-10 px-4 text-xs shadow-md shadow-indigo-900/20'
              : 'h-10 w-full bg-[#2F3FBF] text-white shadow-md shadow-indigo-900/20 hover:bg-[#2535a8]'
          }
          disabled={isOutOfStock || isAdding || isBuyingNow}
          onClick={() => {
            void runAddToCart(true);
          }}
        >
          {isBuyingNow ? 'Redirecting...' : 'Buy Now'}
        </Button>
      </div>

      {feedback ? (
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          {feedback}
        </p>
      ) : null}

      {error ? (
        <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
      ) : null}
    </div>
  );
}
