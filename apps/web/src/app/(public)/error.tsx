'use client';

import ErrorStateCard from '@/components/ui/error-state-card';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorStateCard
      title="We could not load this page."
      description="Something interrupted this marketplace view. Please retry, or return home and continue browsing."
      error={error}
      onRetry={reset}
    />
  );
}
