'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import AccountVerificationFlow from '@/components/account/account-verification-flow';
import Container from '@/components/ui/container';

function withVerifiedViewer(returnTo: string): string {
  const safeTarget = returnTo.startsWith('/') ? returnTo : '/';
  const [path, rawQuery = ''] = safeTarget.split('?');
  const params = new URLSearchParams(rawQuery);

  params.set('viewer', 'verified');
  params.set('verified', '1');

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export default function VerifyAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = useMemo(() => {
    return searchParams.get('returnTo') ?? '/';
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main className="pb-14 pt-8 sm:pt-10">
        <Container>
          <section className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
            <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100">
              Verify your account
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              Complete a quick DIU email verification to unlock seller contact
              options.
            </p>

            <div className="mt-4">
              <AccountVerificationFlow
                autoCompleteOnSuccess
                autoCompleteDelayMs={900}
                onVerified={() => {
                  router.replace(withVerifiedViewer(returnTo));
                }}
                className="border-0 bg-transparent p-0"
              />
            </div>
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
