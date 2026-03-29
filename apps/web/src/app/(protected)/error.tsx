'use client';

import ErrorStateCard from '@/components/ui/error-state-card';

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorStateCard
      title="Account page failed to load."
      description="We could not load your dashboard content right now. Try again, or return home while we reconnect."
      error={error}
      onRetry={reset}
    />
  );
}
