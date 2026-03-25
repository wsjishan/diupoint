import { Suspense } from 'react';
import AuthCallbackClient from './auth-callback-client';

function CallbackLoadingFallback() {
  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-slate-950">
      <main className="py-16 sm:py-20">
        <div className="mx-auto w-full max-w-lg px-4 sm:px-6">
          <section className="rounded-3xl border border-gray-200/85 bg-white p-6 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-7">
            <h1 className="text-xl font-bold text-gray-950 dark:text-slate-100">
              Completing Google sign-in...
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Please wait while we sign you in.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoadingFallback />}>
      <AuthCallbackClient />
    </Suspense>
  );
}
