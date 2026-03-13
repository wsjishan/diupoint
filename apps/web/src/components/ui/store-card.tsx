import Link from 'next/link';
import type { Store } from '@/data/mock-stores';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-indigo-100/80 bg-white p-4 shadow-sm shadow-indigo-900/5 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-900/10 dark:border-indigo-400/20 dark:bg-slate-900/70 dark:hover:border-indigo-300/40">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 text-xs font-bold text-[#2F3FBF] ring-1 ring-indigo-200/80 dark:from-indigo-500/25 dark:to-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/35">
            {store.logoPlaceholder}
          </div>
          <div className="min-w-0">
            <Link
              href={`/store/${store.slug}`}
              className="block truncate text-sm font-semibold text-gray-900 transition-colors hover:text-[#2F3FBF] dark:text-slate-100 dark:hover:text-indigo-300"
            >
              {store.name}
            </Link>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500 dark:text-slate-400">
              {store.tagline}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-[#2F3FBF] dark:border-indigo-300/40 dark:bg-indigo-500/15 dark:text-indigo-300">
          Featured
        </span>
      </div>

      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-slate-300">
        {store.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
        <span className="rounded-full bg-gray-100 px-2 py-1 font-medium dark:bg-slate-800 dark:text-slate-300">
          {store.categoryFocus}
        </span>
        <span aria-hidden="true">•</span>
        <span className="whitespace-nowrap font-medium">
          {store.productCount} products
        </span>
      </div>

      <Link
        href={`/store/${store.slug}`}
        className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg bg-[#2F3FBF] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2535a8]"
      >
        View Store
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </article>
  );
}
