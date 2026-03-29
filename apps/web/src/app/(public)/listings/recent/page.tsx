'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Container from '@/components/ui/container';
import ListingCard from '@/components/ui/listing-card';
import CategoryChip from '@/components/ui/category-chip';
import { CATEGORIES, type Listing } from '@/data/mock-listings';
import { fetchListings, type ListingSort } from '@/lib/api/listings';
import Pagination from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 20;
type ConditionFilter = 'all' | 'new' | 'used';
type SellerFilter = 'store';
type SelectValue = ConditionFilter | ListingSort;

interface SelectOption {
  value: SelectValue;
  label: string;
}

const CONDITION_OPTIONS: Array<SelectOption> = [
  { value: 'all', label: 'All conditions' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
];

const SORT_OPTIONS: Array<SelectOption> = [
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

interface ModernSelectProps {
  value: SelectValue;
  options: Array<SelectOption>;
  onChange: (nextValue: SelectValue) => void;
  ariaLabel: string;
}

function ModernSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const activeOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current) {
        return;
      }
      const target = event.target;
      if (target instanceof Node && !wrapperRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((current) => !current)}
        className="group flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-b from-white to-gray-50 dark:from-white/10 dark:to-white/[0.04] px-3 text-left text-sm font-semibold text-gray-900 shadow-sm shadow-gray-900/[0.03] outline-none transition-all duration-150 hover:border-[#2F3FBF]/35 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/20 dark:text-slate-100 dark:hover:border-white/20 dark:focus-visible:ring-white/15"
      >
        <span>{activeOption?.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className={`h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-[#2F3FBF] dark:text-slate-400 dark:group-hover:text-slate-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m5.75 7.75 4.25 4.5 4.25-4.5"
          />
        </svg>
      </button>

      {isOpen ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/98 dark:bg-slate-900/95 p-1.5 shadow-xl shadow-gray-900/10 backdrop-blur"
        >
          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#2F3FBF]/10 text-[#2F3FBF] dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{option.label}</span>
                  {isActive ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 10 3.2 3.2L15 6.7"
                      />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
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
        <div className="flex flex-col gap-1.5 text-sm text-gray-600 dark:text-slate-300">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Condition
          </span>
          <ModernSelect
            value={conditionFilter}
            options={CONDITION_OPTIONS}
            onChange={(nextValue) =>
              onConditionChange(nextValue as ConditionFilter)
            }
            ariaLabel="Condition"
          />
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-gray-600 dark:text-slate-300">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Sort by
          </span>
          <ModernSelect
            value={sortOption}
            options={SORT_OPTIONS}
            onChange={(nextValue) => onSortChange(nextValue as ListingSort)}
            ariaLabel="Sort by"
          />
        </div>

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
  const rawSeller = searchParams.get('seller');

  const activeCategory =
    rawCategory && VALID_CATEGORY_IDS.has(rawCategory) ? rawCategory : 'all';
  const conditionFilter: ConditionFilter =
    rawCondition === 'new' || rawCondition === 'used' ? rawCondition : 'all';
  const sortOption: ListingSort =
    rawSort && VALID_SORTS.has(rawSort as ListingSort)
      ? (rawSort as ListingSort)
      : 'latest';
  const page = sanitizePageParam(rawPage);
  const sellerFilter: SellerFilter | null =
    rawSeller === 'store' ? rawSeller : null;
  const isStoreOnlyMode = sellerFilter === 'store';

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
        seller: SellerFilter | null;
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
    if (!rawSeller) {
      return;
    }

    if (rawSeller !== 'store') {
      updateRoute({ seller: null }, 'replace');
    }
  }, [rawSeller, updateRoute]);

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
          seller: sellerFilter ?? undefined,
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
    sellerFilter,
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
  const listingUnitLabel = isStoreOnlyMode ? 'store listing' : 'listing';
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
      return isStoreOnlyMode
        ? 'Showing all store listings'
        : 'Showing all latest listings';
    }

    if (isStoreOnlyMode) {
      return `Store feed filtered by ${parts.join(' · ')}`;
    }

    return `Filtered by ${parts.join(' · ')}`;
  }, [activeCategory, categoryLabel, conditionFilter, isStoreOnlyMode, query]);

  const resultsSummary = `${totalResults.toLocaleString()} ${listingUnitLabel}${
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
      seller: isStoreOnlyMode ? 'store' : null,
      page: null,
    });
  };

  return (
    <main className="bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <Container className="py-5 sm:py-7 lg:py-9">
          <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-2xl">
                  {isStoreOnlyMode
                    ? 'Store Listings Marketplace'
                    : 'Latest Listings Marketplace'}
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  {isStoreOnlyMode
                    ? 'Browse fresh listings from DIU student-run stores.'
                    : 'Browse fresh listings from DIU students and stores in one feed.'}
                </p>
              </div>
              <span className="inline-flex h-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-[#2F3FBF] dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-300">
                {totalResults.toLocaleString()} active{' '}
                {isStoreOnlyMode ? 'store listings' : 'listings'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-gray-600 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>
              {isStoreOnlyMode ? (
                <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-gray-600 dark:text-slate-300">
                  Store-only feed
                </span>
              ) : (
                <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-gray-600 dark:text-slate-300">
                  {storeListingCount} store listings on this page
                </span>
              )}
              <span className="rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-gray-600 dark:text-slate-300">
                {categoryLabel}
              </span>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-5">
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setShowMobileFilters((current) => !current)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 px-3.5 text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
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
  );
}

export default function RecentListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 dark:bg-slate-950">
          <Container className="py-6">
            <LoadingSkeleton />
          </Container>
        </div>
      }
    >
      <RecentListingsContent />
    </Suspense>
  );
}
