'use client';

import { useMemo, useRef, useState } from 'react';
import ListingCard from '@/components/ui/listing-card';
import type { Listing } from '@/data/mock-listings';

type SortOption = 'latest' | 'price-low' | 'price-high';

interface StorefrontProductsProps {
  storeName: string;
  listings: Listing[];
  productCount: number;
}

function getGridClasses(count: number): string {
  if (count <= 2) {
    return 'mx-auto grid max-w-2xl grid-cols-1 gap-4 min-[420px]:grid-cols-2';
  }

  if (count <= 6) {
    return 'mx-auto grid max-w-5xl grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-3';
  }

  return 'grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
}

const ITEMS_PER_PAGE = 15;

export default function StorefrontProducts({
  storeName,
  listings,
  productCount,
}: StorefrontProductsProps) {
  const productSectionRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(listings.map((item) => item.category)));
    return ['All categories', ...unique];
  }, [listings]);

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let result = listings.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        selectedCategory === 'All categories' ||
        item.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [listings, query, selectedCategory, sortBy]);

  const totalItems = filteredListings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPageToRender = Math.min(currentPage, totalPages);
  const hasFilters =
    query.trim().length > 0 || selectedCategory !== 'All categories';

  const currentPageStartIndex = (currentPageToRender - 1) * ITEMS_PER_PAGE;
  const currentPageEndIndex = currentPageStartIndex + ITEMS_PER_PAGE;
  const currentPageListings = filteredListings.slice(
    currentPageStartIndex,
    currentPageEndIndex
  );

  function scrollToProductsTop() {
    productSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPageToRender) return;

    setCurrentPage(page);
    scrollToProductsTop();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setCurrentPage(1);
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setCurrentPage(1);
  }

  function handleSortChange(sort: SortOption) {
    setSortBy(sort);
    setCurrentPage(1);
  }

  function resetFilters() {
    setQuery('');
    setSelectedCategory('All categories');
    setSortBy('latest');
    setCurrentPage(1);
  }

  return (
    <div
      id="store-products"
      ref={productSectionRef}
      className="py-10 sm:py-14"
    >
      <section>
        <div className="mb-6 flex flex-col gap-3 border-b border-gray-200/80 pb-4 dark:border-white/10 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-2xl">
              Products from {storeName}
            </h2>
            <p className="mt-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 sm:text-sm">
              {filteredListings.length} listing
              {filteredListings.length === 1 ? '' : 's'} found
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-[#2F3FBF] dark:border-indigo-400/30 dark:bg-slate-900 dark:text-indigo-300">
              {productCount} total products
            </span>
            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
              >
                Reset filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-xl border-0 bg-transparent p-0 dark:bg-transparent lg:sticky lg:top-24 lg:h-fit lg:rounded-xl lg:border lg:border-gray-200/70 lg:bg-white/70 lg:p-4 lg:backdrop-blur-sm lg:dark:border-white/10 lg:dark:bg-slate-900/60">
            <div>
              <label
                htmlFor="store-search"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400"
              >
                Search this store
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5 dark:bg-slate-800 lg:py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  id="store-search"
                  type="text"
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  placeholder="Search products"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Categories
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {categories.map((category) => {
                  const active = category === selectedCategory;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryChange(category)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'bg-[#2F3FBF] text-white'
                          : 'border border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Sort by
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[
                  { key: 'latest', label: 'Latest' },
                  { key: 'price-low', label: 'Price low to high' },
                  { key: 'price-high', label: 'Price high to low' },
                ].map((option) => {
                  const active = sortBy === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSortChange(option.key as SortOption)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'bg-[#2F3FBF] text-white'
                          : 'border border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 text-xs font-semibold text-[#2F3FBF] transition-colors hover:text-[#2535a8] dark:text-indigo-300"
              >
                Clear filters
              </button>
            ) : null}
          </aside>

          <div className="space-y-5 sm:space-y-6">
            {currentPageListings.length > 0 ? (
              <>
                <div
                  className={`${getGridClasses(currentPageListings.length)} [&>article]:transition-all [&>article]:duration-200 [&>article:hover]:-translate-y-1 [&>article:hover]:shadow-lg [&>article:hover]:shadow-slate-900/10`}
                >
                  {currentPageListings.map((listing) => (
                    <div key={listing.id}>
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="mt-8 flex justify-center">
                    <nav
                      aria-label="Store product pagination"
                      className="flex flex-wrap items-center justify-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => goToPage(currentPageToRender - 1)}
                        disabled={currentPageToRender === 1}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-200 hover:text-[#2F3FBF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNumber = index + 1;
                        const isActive = pageNumber === currentPageToRender;

                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => goToPage(pageNumber)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-3 text-xs font-semibold transition-colors ${
                              isActive
                                ? 'border-[#2F3FBF] bg-[#2F3FBF] text-white dark:border-indigo-400 dark:bg-indigo-400 dark:text-slate-950'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => goToPage(currentPageToRender + 1)}
                        disabled={currentPageToRender === totalPages}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-200 hover:text-[#2F3FBF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                ) : null}

                {totalItems > 0 ? (
                  <div className="text-center text-[11px] font-medium text-gray-500 dark:text-slate-400">
                    Showing {currentPageStartIndex + 1}-
                    {Math.min(currentPageEndIndex, totalItems)} of {totalItems}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-slate-800">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  No products match these filters
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Try another category or clear your search.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
