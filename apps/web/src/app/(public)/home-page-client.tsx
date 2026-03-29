'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/container';
import SectionHeader from '@/components/ui/section-header';
import ListingCard from '@/components/ui/listing-card';
import StoreCard from '@/components/ui/store-card';
import CategoryFilter, {
  type CategoryConditionFilter,
} from '@/components/layout/category-filter';
import {
  CATEGORIES,
  type Listing,
} from '@/data/mock-listings';
import { FEATURED_STORES } from '@/data/mock-stores';
import { buildMixedLatestFeed } from '@/lib/api/home';
import { fetchListings } from '@/lib/api/listings';
import { APP_ROUTES } from '@/lib/routes';

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

function SectionFooterViewAllLink({ href }: { href: string }) {
  return (
    <div className="mt-4 flex justify-end sm:mt-5">
      <Link
        href={href}
        className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 text-sm font-semibold text-[#2F3FBF] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100/70 hover:text-[#2535a8] dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:border-indigo-300/40 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-200"
      >
        <span className="whitespace-nowrap">View all</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  );
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
          {viewAllHref ? <SectionFooterViewAllLink href={viewAllHref} /> : null}
        </section>
      </Container>
    </div>
  );
}

interface HomePageClientProps {
  initialLatestListingsFeed: Listing[];
  initialFreshFromStores: Listing[];
}

export default function HomePageClient({
  initialLatestListingsFeed,
  initialFreshFromStores,
}: HomePageClientProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeCondition, setActiveCondition] =
    useState<CategoryConditionFilter>('all');
  const [latestListingsFeed, setLatestListingsFeed] =
    useState<Listing[]>(initialLatestListingsFeed);
  const [freshFromStores, setFreshFromStores] =
    useState<Listing[]>(initialFreshFromStores);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        const { listings } = await fetchListings();

        if (cancelled || listings.length === 0) {
          return;
        }

        setLatestListingsFeed(buildMixedLatestFeed(listings).slice(0, 18));
        setFreshFromStores(
          listings
            .filter((listing) => listing.sellerType === 'store')
            .slice(0, 8)
        );
      } catch {
        // Keep server-provided data when client refresh fails.
      }
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  const latestListings = useMemo(() => {
    return latestListingsFeed.filter((listing) => {
      const categoryMatches =
        activeCategory === 'all' ||
        listing.category === CATEGORY_LABEL_BY_ID[activeCategory];
      const conditionMatches =
        activeCondition === 'all' ||
        listing.condition === activeCondition;

      return categoryMatches && conditionMatches;
    });
  }, [activeCategory, activeCondition, latestListingsFeed]);

  const latestListingsSubtitle = useMemo(() => {
    if (activeCategory === 'all' && activeCondition === 'all') {
      return 'A mix of student and store listings';
    }

    if (activeCategory === 'all') {
      return `Latest ${activeCondition} listings across DIU`;
    }

    const categoryLabel =
      CATEGORY_LABEL_BY_ID[activeCategory]?.toLowerCase() ?? 'category';

    if (activeCondition === 'all') {
      return `Latest ${categoryLabel} listings across DIU`;
    }

    return `Latest ${activeCondition} ${categoryLabel} listings across DIU`;
  }, [activeCategory, activeCondition]);

  return (
    <>
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeCondition={activeCondition}
        onConditionChange={setActiveCondition}
      />

      <main>
        <ListingSection
          title="Latest Listings"
          subtitle={latestListingsSubtitle}
          listings={latestListings}
          className="bg-white dark:bg-slate-950"
          viewAllHref={APP_ROUTES.recentListings}
          emptyTitle="No listings match these filters yet."
          emptyDescription="Try another category or condition."
        />

        <div className="bg-gray-50 dark:bg-slate-900">
          <Container className="py-7 sm:py-8">
            <section>
              <SectionHeader
                title="Fresh from Stores"
                subtitle="Picks from student-run stores"
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
              <SectionFooterViewAllLink
                href={`${APP_ROUTES.recentListings}?seller=store`}
              />
            </section>
          </Container>
        </div>

        <div className="bg-white dark:bg-slate-950">
          <Container className="py-7 sm:py-8">
            <section>
              <SectionHeader
                title="Featured Stores"
                subtitle="Trusted storefronts to follow"
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

        <div className="bg-gray-50 dark:bg-slate-900">
          <Container className="py-8 sm:py-10">
            <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 sm:p-6">
              <h2 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-xl">
                Sell your item
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-gray-500 dark:text-slate-400">
                Connect with students who are looking for it.
              </p>
              <Link
                href={APP_ROUTES.postItem}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#2F3FBF] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#2535a8] active:bg-[#1e2d96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
              >
                + Post Now
              </Link>
            </section>
          </Container>
        </div>
      </main>
    </>
  );
}
