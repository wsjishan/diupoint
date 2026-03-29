'use client';

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-400/30 dark:bg-rose-500/10">
        <h2 className="text-lg font-semibold text-rose-700 dark:text-rose-300">
          We could not load this page.
        </h2>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
