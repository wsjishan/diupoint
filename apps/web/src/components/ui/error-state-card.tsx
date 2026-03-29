'use client';

import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';

interface ErrorStateCardProps {
  title: string;
  description: string;
  error: Error & { digest?: string };
  onRetry: () => void;
}

export default function ErrorStateCard({
  title,
  description,
  error,
  onRetry,
}: ErrorStateCardProps) {
  const showDebugHint =
    process.env.NODE_ENV !== 'production' && Boolean(error.message?.trim());
  const referenceId = error.digest;

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div
        role="alert"
        aria-live="polite"
        className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-sm shadow-rose-900/5 dark:border-rose-400/25 dark:from-rose-500/10 dark:via-slate-900 dark:to-slate-900"
      >
        <div className="border-b border-rose-200/70 p-5 sm:p-6 dark:border-rose-400/25">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-500 shadow-sm dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.82A2 2 0 0 0 4.63 20h14.74a2 2 0 0 0 1.74-3.02l-7.4-12.82a2 2 0 0 0-3.46 0z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-slate-300">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          {referenceId ? (
            <p className="rounded-lg border border-gray-200/80 bg-white/70 px-3 py-2 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                Reference ID:
              </span>{' '}
              <code className="font-mono text-[11px]">{referenceId}</code>
            </p>
          ) : null}

          {showDebugHint ? (
            <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
              <span className="font-semibold">Debug hint:</span>{' '}
              {error.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
            >
              Try again
            </button>
            <Link
              href={APP_ROUTES.home}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-indigo-300/30 dark:focus-visible:ring-offset-slate-900"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
