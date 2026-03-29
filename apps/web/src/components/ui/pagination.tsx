
'use client';

import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <button
            key={i}
            type="button"
            onClick={() => handlePageClick(i)}
            aria-current={i === currentPage ? 'page' : undefined}
            className={cn(
              'inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-3 text-xs font-semibold transition-colors',
              i === currentPage
                ? 'border-[#2F3FBF] bg-[#2F3FBF] text-white dark:border-indigo-400 dark:bg-indigo-400 dark:text-slate-950'
                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300'
            )}
          >
            {i}
          </button>
        );
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage < 3) {
        endPage = maxPagesToShow;
      } else if (currentPage > totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      if (startPage > 1) {
        pageNumbers.push(
          <button
            key={1}
            type="button"
            onClick={() => handlePageClick(1)}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
          >
            1
          </button>
        );
        if (startPage > 2) {
          pageNumbers.push(
            <span
              key="start-ellipsis"
              className="inline-flex h-8 min-w-8 items-center justify-center px-3 text-xs font-semibold text-gray-600 dark:text-slate-300"
            >
              ...
            </span>
          );
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            type="button"
            onClick={() => handlePageClick(i)}
            aria-current={i === currentPage ? 'page' : undefined}
            className={cn(
              'inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-3 text-xs font-semibold transition-colors',
              i === currentPage
                ? 'border-[#2F3FBF] bg-[#2F3FBF] text-white dark:border-indigo-400 dark:bg-indigo-400 dark:text-slate-950'
                : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300'
            )}
          >
            {i}
          </button>
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push(
            <span
              key="end-ellipsis"
              className="inline-flex h-8 min-w-8 items-center justify-center px-3 text-xs font-semibold text-gray-600 dark:text-slate-300"
            >
              ...
            </span>
          );
        }
        pageNumbers.push(
          <button
            key={totalPages}
            type="button"
            onClick={() => handlePageClick(totalPages)}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
          >
            {totalPages}
          </button>
        );
      }
    }

    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex justify-center">
      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-200 hover:text-[#2F3FBF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-indigo-200 hover:text-[#2F3FBF] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
