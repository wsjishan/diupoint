'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import EditListingForm from '@/components/listing/edit-listing-form';
import Container from '@/components/ui/container';
import { fetchMyListingById } from '@/lib/api/listings';
import type { ApiListing } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { APP_ROUTES } from '@/lib/routes';

export default function EditMyListingPage() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const [listing, setListing] = useState<ApiListing | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !params?.id) return;

    setIsFetching(true);
    setError(null);

    void (async () => {
      try {
        const result = await fetchMyListingById(params.id);
        setListing(result);
      } catch {
        setError('Listing not found or you do not have access to it.');
      } finally {
        setIsFetching(false);
      }
    })();
  }, [isAuthenticated, isLoading, params?.id]);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main>
        <Container className="py-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full max-w-3xl">
            <div className="mb-4 sm:mb-5">
              <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                Edit Listing
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                Update details for your listing.
              </p>
            </div>

            {isLoading || isFetching ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
                Loading listing...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300 sm:p-6">
                <p>{error}</p>
                <Link
                  href={APP_ROUTES.myListings}
                  className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-400/35 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-500/20"
                >
                  Back to My Listings
                </Link>
              </div>
            ) : listing ? (
              <EditListingForm listing={listing} />
            ) : null}
          </section>
        </Container>
      </main>

      <div className="bg-white dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}
