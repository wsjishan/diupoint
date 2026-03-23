'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import Container from '@/components/ui/container';
import ListingCard from '@/components/ui/listing-card';
import { mapApiListingToUi } from '@/lib/api/adapters';
import { useAuth } from '@/lib/auth/auth-context';
import { useFavorites } from '@/lib/favorites/favorites-context';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { favorites, isLoading, refreshFavorites } = useFavorites();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/sign-in?returnTo=%2Ffavorites');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    void refreshFavorites();
  }, [isAuthenticated, isAuthLoading, refreshFavorites]);

  const listings = useMemo(() => {
    return favorites.map((favorite) => mapApiListingToUi(favorite.listing));
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main>
        <Container className="py-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full max-w-6xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                  Saved Items
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Listings you saved for later.
                </p>
              </div>
              <Link
                href="/search"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
              >
                Browse Listings
              </Link>
            </div>

            {isAuthLoading || isLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
                Loading your saved items...
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-white/10 dark:bg-slate-900 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  You haven’t saved any items yet.
                </h2>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Tap the heart icon on listings to save them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                  />
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
