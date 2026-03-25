'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import Container from '@/components/ui/container';
import { fetchMyOrders } from '@/lib/api/orders';
import { isApiRequestError } from '@/lib/api/http';
import type { ApiMyOrder } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';

function toPrice(value: number | string): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatOrderStatus(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function formatPaymentMethod(method: string): string {
  if (method === 'CASH_ON_DELIVERY' || method === 'COD') {
    return 'Cash on Delivery';
  }

  if (method === 'ONLINE_PAYMENT' || method === 'BKASH') {
    return 'Online Payment';
  }

  return method
    .toLowerCase()
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function formatCreatedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function shortOrderReference(orderId: string): string {
  if (orderId.length <= 10) return orderId;
  return `...${orderId.slice(-8).toUpperCase()}`;
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<ApiMyOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/sign-in?returnTo=%2Forders');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setIsLoadingOrders(true);
      setError(null);

      try {
        const response = await fetchMyOrders();
        if (cancelled) return;
        setOrders(response);
      } catch (loadError) {
        if (cancelled) return;

        if (isApiRequestError(loadError) && loadError.status === 401) {
          router.replace('/sign-in?returnTo=%2Forders');
          return;
        }

        setError('Unable to load orders right now. Please try again.');
      } finally {
        if (!cancelled) {
          setIsLoadingOrders(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, router]);

  const orderCards = useMemo(() => {
    return orders.map((order) => {
      const itemCount = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const itemNames = order.items
        .map((item) => item.listing?.title)
        .filter((title): title is string => Boolean(title));
      const visibleItemNames = itemNames.slice(0, 2);
      const remainingNames = Math.max(
        itemNames.length - visibleItemNames.length,
        0
      );

      return {
        ...order,
        itemCount,
        visibleItemNames,
        remainingNames,
      };
    });
  }, [orders]);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main>
        <Container className="py-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full max-w-6xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                  My Orders
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Track your placed store orders in one place.
                </p>
              </div>

              <Link
                href="/search"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
              >
                Continue Browsing
              </Link>
            </div>

            {isAuthLoading || isLoadingOrders ? (
              <div className="rounded-3xl border border-gray-200/80 bg-white p-5 text-sm text-gray-600 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
                Loading your orders...
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700 shadow-sm shadow-rose-900/5 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300 sm:p-6">
                {error}
              </div>
            ) : orderCards.length === 0 ? (
              <div className="rounded-3xl border border-gray-200/80 bg-white p-7 text-center shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-9">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  You have no orders yet.
                </h2>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Place an order from a store listing to see it here.
                </p>
                <Link
                  href="/search"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#2F3FBF] px-4 text-sm font-semibold text-white shadow-sm shadow-[#2F3FBF]/25 transition-colors hover:bg-[#2535a8]"
                >
                  Continue browsing stores
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {orderCards.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-shadow hover:shadow-md hover:shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Order {shortOrderReference(order.id)}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-gray-900 dark:text-slate-100">
                          {order.storeProfile?.storeName ?? 'Store Order'}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                          Placed on {formatCreatedDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:border-indigo-400/35 dark:bg-indigo-500/15 dark:text-indigo-300">
                          {formatOrderStatus(order.status)}
                        </span>
                        <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {formatPaymentMethod(order.paymentMethod)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Total
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-slate-100">
                          ৳ {toPrice(order.total).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Items
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {order.itemCount} item
                          {order.itemCount === 1 ? '' : 's'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Store
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {order.storeProfile?.storeName ?? 'Unknown Store'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Ordered Items
                      </p>

                      {order.visibleItemNames.length > 0 ? (
                        <ul className="mt-1.5 space-y-1 text-sm text-gray-700 dark:text-slate-300">
                          {order.visibleItemNames.map((title) => (
                            <li
                              key={`${order.id}-${title}`}
                              className="line-clamp-1"
                            >
                              {title}
                            </li>
                          ))}
                          {order.remainingNames > 0 ? (
                            <li className="text-xs font-medium text-gray-500 dark:text-slate-400">
                              +{order.remainingNames} more item
                              {order.remainingNames === 1 ? '' : 's'}
                            </li>
                          ) : null}
                        </ul>
                      ) : (
                        <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                          Item details unavailable.
                        </p>
                      )}
                    </div>
                  </article>
                ))}
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
