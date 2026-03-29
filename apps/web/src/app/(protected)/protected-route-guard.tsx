'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth/auth-context';
import { APP_ROUTES, createSignInHref } from '@/lib/routes';

export default function ProtectedRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const resolvedPath = pathname || APP_ROUTES.home;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const queryString =
        typeof window === 'undefined' ? '' : window.location.search;
      const returnTo = `${resolvedPath}${queryString}`;
      router.replace(createSignInHref(returnTo));
    }
  }, [isAuthenticated, isLoading, resolvedPath, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[40vh] px-4 py-14 text-center text-sm text-gray-600 dark:text-slate-300">
        Loading your account...
      </div>
    );
  }

  return <>{children}</>;
}
