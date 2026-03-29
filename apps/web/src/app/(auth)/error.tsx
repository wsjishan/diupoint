'use client';

import ErrorStateCard from '@/components/ui/error-state-card';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorStateCard
      title="Authentication page failed to load."
      description="We could not open the sign-in flow right now. Try again, or go back home and retry in a moment."
      error={error}
      onRetry={reset}
    />
  );
}
