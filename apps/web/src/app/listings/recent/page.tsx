'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Container from '@/components/ui/container';
import ListingCard from '@/components/ui/listing-card';
import CategoryChip from '@/components/ui/category-chip';
import { CATEGORIES, type Listing } from '@/data/mock-listings';
import { fetchListings, type ListingSort } from '@/lib/api/listings';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import Pagination from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 20;
type ConditionFilter = 'all' | 'new' | 'used';

const SORT_OPTIONS: Array<{ value: ListingSort; label: string }> = [
  { value: 'latest', label: 'Latest' },
  { value: 'price-asc', label: 'Price low to high' },
  { value: 'price-desc', label: 'Price high to low' },
];

const CATEGORY_LABEL_BY_ID = CATEGORIES.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.id] = category.label;
    return acc;
  },
  {}
);

const VALID_CATEGORY_IDS = new Set(CATEGORIES.map((category) => category.id));
const VALID_SORTS = new Set<ListingSort>(['latest', 'price-asc', 'price-desc']);

function sanitizePageParam(value: string | null): number {
  if (!value) return 1;
  if (!/^\d+$/.test(value)) return 1;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900"
        >
          <div className="aspect-4/3 w-full animate-pulse bg-gray-100 dark:bg-slate-800" />
          <div className="space-y-2 p-3.5">
            <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100 dark:bg-slate-800" />
            <div className="h-3.5 w-full animate-pulse rounded bg-gray-100 dark:bg-slate-800" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-slate-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface FiltersPanelProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  conditionFilter: ConditionFilter;
  onConditionChange: (condition: ConditionFilter) => void;
  sortOption: ListingSort;
  onSortChange: (sort: ListingSort) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

function FiltersPanel({
  activeCategory,
  onCategoryChange,
  conditionFilter,
  onConditionChange,
  sortOption,
  onSortChange,
  hasActiveFilters,
  onClearAll,
}: FiltersPanelProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 sm:p-5">
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

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
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
            onChange={(event) => onSortChange(event.target.value as ListingSort)}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-slate-100 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 dark:focus:border-white/20 focus:ring-2 focus:ring-[#2F3FBF]/15 dark:focus:ring-white/10"
          >
            {SORT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClearAll}
            disabled={!hasActiveFilters}
            className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-300 transition-colors hover:border-[#2F3FBF]/30 hover:text-[#2F3FBF] disabled:cursor-not-allowed disabled:opacity-45 dark:hover:border-white/20 dark:hover:text-slate-100 lg:w-auto"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}

function RecentListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const rawQuery = searchParams.get('q') ?? '';
  const query = rawQuery.trim();
  const rawCategory = searchParams.get('category');
  const rawCondition = searchParams.get('condition');
  const rawSort = searchParams.get('sort');
  const rawPage = searchParams.get('page');

  const activeCategory =
    rawCategory && VALID_CATEGORY_IDS.has(rawCategory) ? rawCategory : 'all';
  const conditionFilter: ConditionFilter =
    rawCondition === 'new' || rawCondition === 'used' ? rawCondition : 'all';
  const sortOption: ListingSort =
    rawSort && VALID_SORTS.has(rawSort as ListingSort)
      ? (rawSort as ListingSort)
      : 'latest';
  const page = sanitizePageParam(rawPage);

  const [searchInput, setSearchInput] = useState(query);

  const hasActiveFilters =
    query.length > 0 ||
    activeCategory !== 'all' ||
    conditionFilter !== 'all' ||
    sortOption !== 'latest';

  const updateRoute = useCallback(
    (
      updates: Partial<{
        q: string | null;
        category: string | null;
        condition: ConditionFilter | null;
        sort: ListingSort | null;
        page: number | null;
      }>,
      method: 'push' | 'replace' = 'push'
    ) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === 'all' ||
          value === 'latest'
        ) {
          nextParams.delete(key);
          return;
        }
        nextParams.set(key, String(value));
      });

      if (nextParams.get('page') === '1') {
        nextParams.delete('page');
      }

      const nextQueryString = nextParams.toString();
      const href = nextQueryString
        ? `/listings/recent?${nextQueryString}`
        : '/listings/recent';

      if (method === 'replace') {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [router, searchParams]
  );

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (!rawPage) {
      return;
    }

    if (!/^\d+$/.test(rawPage)) {
      updateRoute({ page: null }, 'replace');
      return;
    }

    const parsedPage = Number.parseInt(rawPage, 10);
    if (!Number.isFinite(parsedPage) || parsedPage < 1) {
      updateRoute({ page: null }, 'replace');
    }
  }, [rawPage, updateRoute]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextQuery = searchInput.trim();

      if (nextQuery === query) {
        return;
      }

      updateRoute({ q: nextQuery || null, page: null }, 'replace');
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, searchInput, updateRoute]);

  useEffect(() => {
    let cancelled = false;

    async function loadListings(): Promise<void> {
      setIsLoading(true);

      try {
        const category =
          activeCategory === 'all'
            ? undefined
            : CATEGORY_LABEL_BY_ID[activeCategory];
        const { listings: nextListings, total } = await fetchListings({
          q: query || undefined,
          category,
          condition:
            conditionFilter === 'all' ? undefined : conditionFilter,
          sort: sortOption,
          page,
          limit: ITEMS_PER_PAGE,
        });

        if (cancelled) {
          return;
        }

        const nextTotalPages = Math.max(
          1,
          Math.ceil(total / ITEMS_PER_PAGE)
        );

        if (page > nextTotalPages) {
          updateRoute(
            {
              page: nextTotalPages === 1 ? null : nextTotalPages,
            },
            'replace'
          );
          return;
        }

        setListings(nextListings);
        setTotalResults(total);
        setTotalPages(nextTotalPages);
      } catch {
        if (cancelled) {
          return;
        }
        setListings([]);
        setTotalResults(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, [
    activeCategory,
    conditionFilter,
    page,
    query,
    sortOption,
    updateRoute,
  ]);

  const categoryLabel = CATEGORY_LABEL_BY_ID[activeCategory] ?? 'All Items';
  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sortOption)?.label ??
    'Latest';
  const storeListingCount = listings.filter(
    (listing) => listing.sellerType === 'store'
  ).length;
  const personalListingCount = listings.length - storeListingCount;
  const contextSummary = useMemo(() => {
    const parts: string[] = [];

    if (query) {
      parts.push(`search "${query}"`);
    }
    if (activeCategory !== 'all') {
      parts.push(categoryLabel.toLowerCase());
    }
    if (conditionFilter !== 'all') {
      parts.push(`${conditionFilter} condition`);
    }

    if (parts.length === 0) {
      return 'Showing all latest listings';
    }

    return `Filtered by ${parts.join(' · ')}`;
  }, [activeCategory, categoryLabel, conditionFilter, query]);

  const resultsSummary = `${totalResults.toLocaleString()} listing${
    totalResults === 1 ? '' : 's'
  } found`;

  const navigateToPage = (newPage: number) => {
    updateRoute({ page: newPage === 1 ? null : newPage });
  };

  const handleCategoryChange = (nextCategory: string) => {
    updateRoute({
      category: nextCategory === 'all' ? null : nextCategory,
      page: null,
    });
  };

  const handleConditionChange = (nextCondition: ConditionFilter) => {
    updateRoute({
      condition: nextCondition === 'all' ? null : nextCondition,
      page: null,
    });
  };

  const handleSortChange = (nextSort: ListingSort) => {
    updateRoute({
      sort: nextSort === 'latest' ? null : nextSort,
      page: null,
    });
  };

  const handleClearAll = () => {
    updateRoute({
      q: null,
      category: null,
      condition: null,
      sort: null,
      page: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <main>
        <Container className="py-5 sm:py-7 lg:py-9">
          <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-2xl">
                  Latest Listings Marketplace
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Browse fresh listings from DIU students and stores in one feed.
                </p>
              </div>
              <span className="inline-flex h-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-[#2F3FBF] dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-300">
                {totalResults.toLocaleString()} total active
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-gray-600 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>
              <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-gray-600 dark:text-slate-300">
                {storeListingCount} store listings
              </span>
              <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-gray-600 dark:text-slate-300">
                {personalListingCount} student sellers
              </span>
              <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-gray-600 dark:text-slate-300">
                {categoryLabel}
              </span>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
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
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search listings by title, category, location..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-all duration-150 focus:border-[#2F3FBF]/40 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/8 focus:ring-2 focus:ring-[#2F3FBF]/15 dark:focus:ring-white/10"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters((current) => !current)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 px-3.5 text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 sm:hidden"
              >
                {showMobileFilters ? 'Hide filters' : 'Filters & sort'}
              </button>
            </div>

            <div className="mt-4 hidden sm:block">
              <FiltersPanel
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                conditionFilter={conditionFilter}
                onConditionChange={handleConditionChange}
                sortOption={sortOption}
                onSortChange={handleSortChange}
                hasActiveFilters={hasActiveFilters}
                onClearAll={handleClearAll}
              />
            </div>

            {showMobileFilters && (
              <div className="mt-4 sm:hidden">
                <FiltersPanel
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryChange}
                  conditionFilter={conditionFilter}
                  onConditionChange={handleConditionChange}
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                  hasActiveFilters={hasActiveFilters}
                  onClearAll={handleClearAll}
                />
              </div>
            )}
          </section>

          <section className="mt-5 sm:mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400 sm:mb-4">
              <p className="font-medium text-gray-700 dark:text-slate-200">
                {resultsSummary}
              </p>
              <span className="hidden text-gray-300 dark:text-slate-600 sm:inline">
                •
              </span>
              <p>{contextSummary}</p>
              {sortOption !== 'latest' ? (
                <span className="rounded-full border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-slate-300">
                  Sorted by {sortLabel.toLowerCase()}
                </span>
              ) : null}
              {isLoading ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300">
                  Updating...
                </span>
              ) : null}
            </div>

            {isLoading && listings.length === 0 ? (
              <LoadingSkeleton />
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={navigateToPage}
                />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-slate-900 p-10 text-center sm:p-12">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  No listings found.
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  Try a different search keyword or clear filters to see more
                  listings.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-5 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors hover:border-[#2F3FBF]/30 hover:text-[#2F3FBF] dark:hover:border-white/20 dark:hover:text-slate-100"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default function RecentListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <Navbar />
          <main>
            <Container className="py-6">
              <LoadingSkeleton />
            </Container>
          </main>
        </div>
      }
    >
      <RecentListingsContent />
    </Suspense>
  );
}
