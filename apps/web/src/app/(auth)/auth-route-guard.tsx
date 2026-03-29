'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth/auth-context';
import { APP_ROUTES, sanitizeReturnTo } from '@/lib/routes';

export default function AuthRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnTo =
        typeof window === 'undefined'
          ? null
          : new URLSearchParams(window.location.search).get('returnTo');
      const redirectTarget = sanitizeReturnTo(returnTo, APP_ROUTES.home);
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-[40vh] px-4 py-14 text-center text-sm text-gray-600 dark:text-slate-300">
        Checking account state...
      </div>
    );
  }

  return <>{children}</>;
}
