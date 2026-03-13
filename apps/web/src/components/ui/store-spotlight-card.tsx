import Link from 'next/link';
import type { Store } from '@/data/mock-stores';

interface StoreSpotlightCardProps {
  store: Store;
}

export default function StoreSpotlightCard({ store }: StoreSpotlightCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-white p-4 shadow-sm shadow-indigo-900/7 dark:border-indigo-400/20 dark:bg-slate-900/75 sm:p-5">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.12),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.18),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-extrabold text-[#2F3FBF] ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-indigo-400/35">
            {store.logoPlaceholder}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
              Store Spotlight
            </p>
            <Link
              href={`/store/${store.slug}`}
              className="mt-0.5 block truncate text-base font-bold text-gray-900 transition-colors hover:text-[#2F3FBF] dark:text-slate-100 dark:hover:text-indigo-300"
            >
              {store.name}
            </Link>
            <p className="mt-0.5 line-clamp-1 text-sm font-medium text-gray-600 dark:text-slate-300">
              {store.tagline}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <span
                className="inline-flex"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-3.5 w-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 12.75l-7.5 7.5L3 10.5V3h7.5l9.75 9.75z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 7.5h.008v.008H7.5V7.5z"
                  />
                </svg>
              </span>
              <span className="truncate">{store.categoryFocus}</span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-sm text-gray-500 dark:text-slate-400">
              {store.description}
            </p>
          </div>
        </div>

        <Link
          href={`/store/${store.slug}`}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-sm font-semibold text-[#2F3FBF] transition-colors hover:bg-indigo-100 dark:border-indigo-300/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 sm:w-fit"
        >
          Visit Store
        </Link>
      </div>
    </article>
  );
}
