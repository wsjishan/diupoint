'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import CategoryChip from '@/components/ui/category-chip';
import Container from '@/components/ui/container';
import ListingCard from '@/components/ui/listing-card';
import { ALL_LISTINGS, CATEGORIES, type Listing } from '@/data/mock-listings';
import { searchListings } from '@/lib/api/search';

type ConditionFilter = 'all' | 'new' | 'used';
type SortOption = 'latest' | 'price-asc' | 'price-desc';

const CATEGORY_LABEL_BY_ID = CATEGORIES.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.id] = category.label;
    return acc;
  },
  {}
);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

interface FiltersPanelProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  conditionFilter: ConditionFilter;
  onConditionChange: (condition: ConditionFilter) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

function FiltersPanel({
  activeCategory,
  onCategoryChange,
  conditionFilter,
  onConditionChange,
  sortOption,
  onSortChange,
}: FiltersPanelProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-5">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Category
          </p>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {CATEGORIES.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.label}
                active={activeCategory === category.id}
                onClick={() => onCategoryChange(category.id)}
              />
            ))}
            <div
              className="w-1 shrink-0 sm:hidden"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-gray-600 dark:text-slate-300">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Condition
            </span>
            <select
              value={conditionFilter}
              onChange={(event) =>
                onConditionChange(event.target.value as ConditionFilter)
              }
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-slate-100 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 dark:focus:border-white/20 focus:ring-2 focus:ring-[#2F3FBF]/15 dark:focus:ring-white/10"
            >
              <option value="all">All conditions</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-gray-600 dark:text-slate-300">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Sort by
            </span>
            <select
              value={sortOption}
              onChange={(event) =>
                onSortChange(event.target.value as SortOption)
              }
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-slate-100 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 dark:focus:border-white/20 focus:ring-2 focus:ring-[#2F3FBF]/15 dark:focus:ring-white/10"
            >
              <option value="latest">Latest</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') ?? '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState('all');
  const [conditionFilter, setConditionFilter] =
    useState<ConditionFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filteredListings, setFilteredListings] =
    useState<Listing[]>(ALL_LISTINGS);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  function handleSearchSubmit(query: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const normalized = query.trim();

    if (normalized) {
      nextParams.set('q', normalized);
    } else {
      nextParams.delete('q');
    }

    const nextQueryString = nextParams.toString();
    router.push(nextQueryString ? `/search?${nextQueryString}` : '/search');
  }

  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const category =
          activeCategory === 'all'
            ? undefined
            : CATEGORY_LABEL_BY_ID[activeCategory];

        const results = await searchListings({
          q: searchQuery,
          category,
          condition: conditionFilter === 'all' ? undefined : conditionFilter,
          sort: sortOption,
        });

        if (!cancelled) {
          setFilteredListings(results);
        }
      })();
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeCategory, conditionFilter, searchQuery, sortOption]);

  const resultsSummary = useMemo(() => {
    const count = filteredListings.length;
    const normalizedSearch = normalize(searchQuery);
    const isAllCategory = activeCategory === 'all';
    const categoryLabel = CATEGORY_LABEL_BY_ID[activeCategory] ?? 'All Items';

    if (normalizedSearch) {
      return `${count} result${count === 1 ? '' : 's'} for ${normalizedSearch}`;
    }

    if (!isAllCategory) {
      return `${count} result${count === 1 ? '' : 's'} for ${categoryLabel.toLowerCase()}`;
    }

    return 'Showing all latest listings';
  }, [activeCategory, filteredListings.length, searchQuery]);

  const hasActiveFilters =
    normalize(searchQuery).length > 0 ||
    activeCategory !== 'all' ||
    conditionFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <main>
        <Container className="py-5 sm:py-7 lg:py-9">
          <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-5">
            <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100 sm:text-xl">
              Search Marketplace
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Browse listings from students and stores across DIU.
            </p>

            <div className="mt-4">
              <label
                htmlFor="search-marketplace"
                className="sr-only"
              >
                Search marketplace listings
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4 text-gray-400 dark:text-slate-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <input
                  id="search-marketplace"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search items, books, electronics, housing..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/8 focus:ring-2 focus:ring-[#2F3FBF]/15 dark:focus:ring-white/10"
                />
              </div>
            </div>

            <div className="mt-4 sm:hidden">
              <button
                type="button"
                onClick={() => setShowMobileFilters((current) => !current)}
                className="inline-flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
              >
                {showMobileFilters ? 'Hide filters' : 'Filters & sort'}
              </button>
            </div>
          </section>

          <div className="mt-4 hidden sm:block">
            <FiltersPanel
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              conditionFilter={conditionFilter}
              onConditionChange={setConditionFilter}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
          </div>

          {showMobileFilters && (
            <div className="mt-4 sm:hidden">
              <FiltersPanel
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                conditionFilter={conditionFilter}
                onConditionChange={setConditionFilter}
                sortOption={sortOption}
                onSortChange={setSortOption}
              />
            </div>
          )}

          <section className="mt-5 sm:mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400 sm:mb-4">
              <p className="font-medium text-gray-700 dark:text-slate-200">
                {resultsSummary}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                    setConditionFilter('all');
                    setSortOption('latest');
                  }}
                  className="rounded-full border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-slate-300 transition-colors hover:border-[#2F3FBF]/30 hover:text-[#2F3FBF] dark:hover:border-white/20 dark:hover:text-slate-100"
                >
                  Clear all
                </button>
              )}
            </div>

            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-slate-900 p-10 text-center sm:p-12">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  No listings found.
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  Try a different search or filter.
                </p>
              </div>
            )}
          </section>
        </Container>
      </main>

      <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
