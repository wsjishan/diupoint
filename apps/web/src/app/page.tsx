'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/container';
import SectionHeader from '@/components/ui/section-header';
import ListingCard from '@/components/ui/listing-card';
import StoreCard from '@/components/ui/store-card';
import CategoryFilter from '@/components/layout/category-filter';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import {
  CATEGORIES,
  LATEST_FROM_STORES,
  ALL_LISTINGS,
  type Listing,
} from '@/data/mock-listings';
import { FEATURED_STORES } from '@/data/mock-stores';
import { buildMixedLatestFeed } from '@/lib/api/home';
import { fetchListings } from '@/lib/api/listings';

const LATEST_LISTINGS_FEED = buildMixedLatestFeed(ALL_LISTINGS).slice(0, 18);

const FRESH_FROM_STORES = LATEST_FROM_STORES.slice(0, 8);
const HOMEPAGE_FEATURED_STORES = FEATURED_STORES.slice(0, 4);
const CATEGORY_LABEL_BY_ID = CATEGORIES.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.id] = category.label;
    return acc;
  },
  {}
);

interface ListingSectionProps {
  title: string;
  icon?: string;
  subtitle?: string;
  listings: Listing[];
  className: string;
  viewAllHref?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

function ListingSection({
  title,
  icon,
  subtitle,
  listings,
  className,
  viewAllHref,
  emptyTitle = 'No listings yet',
  emptyDescription = 'Be the first to post in this category.',
}: ListingSectionProps) {
  return (
    <div className={className}>
      <Container className="py-8 sm:py-10">
        <section>
          <SectionHeader
            title={title}
            icon={icon}
            subtitle={subtitle}
            viewAllHref={viewAllHref}
          />
          {listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6 text-gray-400 dark:text-slate-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-600 dark:text-slate-400">
                {emptyTitle}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                {emptyDescription}
              </p>
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [latestListingsFeed, setLatestListingsFeed] =
    useState<Listing[]>(LATEST_LISTINGS_FEED);
  const [freshFromStores, setFreshFromStores] =
    useState<Listing[]>(FRESH_FROM_STORES);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      const listings = await fetchListings();

      if (cancelled || listings.length === 0) {
        return;
      }

      setLatestListingsFeed(buildMixedLatestFeed(listings).slice(0, 18));
      setFreshFromStores(
        listings.filter((listing) => listing.sellerType === 'store').slice(0, 8)
      );
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearchSubmit(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      router.push('/search');
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  const latestListings = useMemo(() => {
    if (activeCategory === 'all') {
      return latestListingsFeed;
    }

    const categoryLabel = CATEGORY_LABEL_BY_ID[activeCategory];
    return latestListingsFeed.filter(
      (listing) => listing.category === categoryLabel
    );
  }, [activeCategory, latestListingsFeed]);

  const latestListingsSubtitle =
    activeCategory === 'all'
      ? 'A live mix of student and store listings across DIU'
      : `Latest ${CATEGORY_LABEL_BY_ID[activeCategory]?.toLowerCase() ?? 'category'} listings across DIU`;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <Navbar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main>
        <ListingSection
          title="Latest Listings"
          subtitle={latestListingsSubtitle}
          listings={latestListings}
          className="bg-white dark:bg-slate-950"
          viewAllHref="/listings/recent"
          emptyTitle="No listings found in this category yet."
          emptyDescription="Try another category."
        />

        <div className="bg-gray-50 dark:bg-slate-900">
          <Container className="py-7 sm:py-8">
            <section>
              <SectionHeader
                title="Fresh from Stores"
                subtitle="Quick picks from student-run stores"
                viewAllHref="/listings?type=store"
              />
              <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:px-0">
                {freshFromStores.map((listing) => (
                  <div
                    key={listing.id}
                    className="w-[72vw] shrink-0 sm:w-[42vw] lg:w-[20rem]"
                  >
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            </section>
          </Container>
        </div>

        <div className="bg-white dark:bg-slate-950">
          <Container className="py-7 sm:py-8">
            <section>
              <SectionHeader
                title="Featured Stores"
                subtitle="Trusted storefronts worth following"
              />
              <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:px-0">
                {HOMEPAGE_FEATURED_STORES.map((store) => (
                  <div
                    key={store.id}
                    className="w-[82vw] shrink-0 sm:w-[20rem]"
                  >
                    <StoreCard store={store} />
                  </div>
                ))}
              </div>
            </section>
          </Container>
        </div>

        {/* CTA + footer region */}
        <div className="bg-gray-50 dark:bg-slate-900">
          <Container className="py-8 sm:py-10">
            <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 sm:p-6">
              <h2 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-xl">
                Sell something you no longer need
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-gray-500 dark:text-slate-400">
                Post your item and connect with DIU students who are actively
                looking for it.
              </p>
              <button className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#2F3FBF] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#2535a8] active:bg-[#1e2d96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950">
                + Post Now
              </button>
            </section>
          </Container>
          <Footer />
        </div>
      </main>
    </div>
  );
}
