'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import Container from '@/components/ui/container';
import ListingCard from '@/components/ui/listing-card';
import { mapApiListingToUi } from '@/lib/api/adapters';
import {
  archiveListing,
  fetchMyListings,
  markListingSold,
} from '@/lib/api/listings';
import type { ApiListing, ApiListingStatus } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { APP_ROUTES, createMyListingEditHref } from '@/lib/routes';

function toManageStatus(
  status: ApiListingStatus
): 'ACTIVE' | 'SOLD' | 'ARCHIVED' {
  if (status === 'SOLD') return 'SOLD';
  if (status === 'ARCHIVED') return 'ARCHIVED';
  return 'ACTIVE';
}

function statusClasses(status: 'ACTIVE' | 'SOLD' | 'ARCHIVED'): string {
  if (status === 'SOLD') {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-300';
  }

  if (status === 'ARCHIVED') {
    return 'border border-gray-300 bg-gray-100 text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';
  }

  return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300';
}

export default function MyListingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isFetching, setIsFetching] = useState(true);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    setIsFetching(true);
    setError(null);

    void (async () => {
      try {
        const mine = await fetchMyListings();
        setListings(mine);
      } catch {
        setError('Unable to load your listings right now.');
      } finally {
        setIsFetching(false);
      }
    })();
  }, [isAuthenticated, isLoading]);

  const activeAndSoldListings = useMemo(
    () => listings.filter((listing) => listing.status !== 'ARCHIVED'),
    [listings]
  );

  const archivedListings = useMemo(
    () => listings.filter((listing) => listing.status === 'ARCHIVED'),
    [listings]
  );

  async function handleMarkSold(listingId: string) {
    setActionError(null);
    setActionId(listingId);

    try {
      const updated = await markListingSold(listingId);
      setListings((previous) =>
        previous.map((listing) =>
          listing.id === listingId ? updated : listing
        )
      );
    } catch {
      setActionError('Could not mark this listing as sold.');
    } finally {
      setActionId(null);
    }
  }

  async function handleArchive(listingId: string) {
    setActionError(null);
    setActionId(listingId);

    try {
      await archiveListing(listingId);
      setListings((previous) =>
        previous.map((listing) =>
          listing.id === listingId
            ? { ...listing, status: 'ARCHIVED' }
            : listing
        )
      );
    } catch {
      setActionError('Could not archive this listing.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main>
        <Container className="py-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full max-w-6xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                  My Listings
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  View and manage all the listings you posted on DIUPoint.
                </p>
              </div>
              <Link
                href={APP_ROUTES.postItem}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
              >
                + Post New Item
              </Link>
            </div>

            {actionError ? (
              <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300">
                {actionError}
              </p>
            ) : null}

            {isLoading || isFetching ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
                Loading your listings...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300 sm:p-6">
                {error}
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-white/10 dark:bg-slate-900 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  You haven’t posted anything yet.
                </h2>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Start selling by posting your first item.
                </p>
                <Link
                  href={APP_ROUTES.postItem}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
                >
                  Post First Item
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <section className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    Active and sold listings
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeAndSoldListings.map((listing) => {
                      const mapped = mapApiListingToUi(listing);
                      const status = toManageStatus(listing.status);
                      const isSold = status === 'SOLD';

                      return (
                        <article
                          key={listing.id}
                          className={isSold ? 'opacity-70' : ''}
                        >
                          <ListingCard listing={mapped} />
                          <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses(status)}`}
                              >
                                {status}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                {listing.category}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                              <Link
                                href={createMyListingEditHref(listing.id)}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                disabled={
                                  status !== 'ACTIVE' || actionId === listing.id
                                }
                                onClick={() => handleMarkSold(listing.id)}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:pointer-events-none disabled:opacity-50 dark:border-amber-400/35 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                              >
                                Mark Sold
                              </button>

                              <button
                                type="button"
                                disabled={
                                  status === 'ARCHIVED' ||
                                  actionId === listing.id
                                }
                                onClick={() => handleArchive(listing.id)}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:pointer-events-none disabled:opacity-50 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                              >
                                Archive
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                {archivedListings.length > 0 ? (
                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Archived listings
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {archivedListings.map((listing) => {
                        const mapped = mapApiListingToUi(listing);
                        const status = toManageStatus(listing.status);

                        return (
                          <article
                            key={listing.id}
                            className="opacity-60"
                          >
                            <ListingCard listing={mapped} />
                            <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses(status)}`}
                              >
                                {status}
                              </span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ) : null}
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
