'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import Container from '@/components/ui/container';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';

function toPrice(value: number | string): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    items,
    isLoading,
    subtotal,
    refreshCart,
    setItemQuantity,
    removeFromCart,
  } = useCart();

  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/sign-in?returnTo=%2Fcart');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    void refreshCart();
  }, [isAuthenticated, isAuthLoading, refreshCart]);

  async function handleQuantityChange(itemId: string, nextQuantity: number) {
    setError(null);
    setBusyItemId(itemId);

    try {
      const result = await setItemQuantity(itemId, nextQuantity);
      if (!result.ok) {
        setError(result.errorMessage ?? 'Could not update quantity.');
      }
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleRemove(itemId: string) {
    setError(null);
    setBusyItemId(itemId);

    try {
      const result = await removeFromCart(itemId);
      if (!result.ok) {
        setError(result.errorMessage ?? 'Could not remove item from cart.');
      }
    } finally {
      setBusyItemId(null);
    }
  }

  const summary = useMemo(() => {
    return {
      subtotal,
      total: subtotal,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [items, subtotal]);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main>
        <Container className="py-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full max-w-6xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                  Your Cart
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Review store items before checkout.
                </p>
              </div>
              {items.length > 0 ? (
                <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                  {summary.quantity} item{summary.quantity > 1 ? 's' : ''}
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </p>
            ) : null}

            {isAuthLoading || isLoading ? (
              <div className="rounded-3xl border border-gray-200/80 bg-white p-5 text-sm text-gray-600 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
                Loading cart...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-gray-200/80 bg-white p-7 text-center shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-10">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="9"
                      cy="20"
                      r="1.25"
                    />
                    <circle
                      cx="17"
                      cy="20"
                      r="1.25"
                    />
                    <path d="M3 4h2l2.3 10.1a2 2 0 0 0 2 1.56H17a2 2 0 0 0 1.94-1.53L20.25 8H7.2" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-slate-100">
                  Your cart is empty
                </h2>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Add items from store listings to start your order.
                </p>
                <Link
                  href="/search"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#2F3FBF] px-5 text-sm font-semibold text-white shadow-sm shadow-[#2F3FBF]/25 transition-colors hover:bg-[#2535a8]"
                >
                  Continue browsing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)] lg:items-start">
                <div className="space-y-3.5">
                  {items.map((item) => {
                    const listing = item.listing;
                    const unitPrice = toPrice(item.unitPrice);
                    const itemSubtotal = unitPrice * item.quantity;
                    const isBusy = busyItemId === item.id;
                    const thumbnailUrl = listing.images?.[0]?.imageUrl;

                    return (
                      <article
                        key={item.id}
                        className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-shadow hover:shadow-md hover:shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 sm:p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                          <div className="h-24 w-full shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-800 sm:h-24 sm:w-24">
                            {thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumbnailUrl}
                                alt={listing.title}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-gray-900 dark:text-slate-100 sm:text-base">
                              {listing.title}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                              {listing.storeProfile?.storeName ??
                                'Store listing'}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
                              ৳ {unitPrice.toLocaleString()}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50/70 p-1 dark:border-slate-600 dark:bg-slate-800/70">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleQuantityChange(
                                      item.id,
                                      Math.max(1, item.quantity - 1)
                                    );
                                  }}
                                  disabled={isBusy || item.quantity <= 1}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="inline-flex h-8 min-w-11 items-center justify-center text-sm font-semibold text-gray-800 dark:text-slate-200">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void handleQuantityChange(
                                      item.id,
                                      Math.min(99, item.quantity + 1)
                                    );
                                  }}
                                  disabled={isBusy || item.quantity >= 99}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              <div className="ml-auto flex items-center gap-3">
                                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 sm:text-sm">
                                  Subtotal: ৳ {itemSubtotal.toLocaleString()}
                                </p>

                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => {
                                    void handleRemove(item.id);
                                  }}
                                  className="text-xs font-medium text-gray-500 transition-colors hover:text-rose-600 disabled:opacity-50 dark:text-slate-400 dark:hover:text-rose-300"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <aside className="h-fit rounded-3xl border border-gray-200/80 bg-white p-5 shadow-md shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-24">
                  <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-slate-100">
                    Order Summary
                  </h2>
                  <div className="mt-4 space-y-2.5 text-sm text-gray-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Items</span>
                      <span>{summary.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>৳ {summary.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="my-2 h-px bg-gray-100 dark:bg-white/10" />
                    <div className="flex items-center justify-between text-[15px]">
                      <span>Total</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-100">
                        ৳ {summary.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2F3FBF] px-4 text-sm font-semibold text-white shadow-sm shadow-[#2F3FBF]/30 transition-colors hover:bg-[#2535a8]"
                  >
                    Checkout
                  </Link>

                  <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
                    Payment options: Cash on Delivery and bKash.
                  </p>
                </aside>
              </div>
            )}
          </section>
        </Container>
      </main>

      <div className="bg-white dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}
