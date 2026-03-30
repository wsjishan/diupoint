'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import Container from '@/components/ui/container';
import {
  fetchMyStoreDashboard,
  updateMyStore,
} from '@/lib/api/stores';
import { isApiRequestError } from '@/lib/api/http';
import type { ApiStoreDashboardResponse } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { APP_ROUTES, createSignInHref, createStoreHref } from '@/lib/routes';
import { DEFAULT_STORE_COVER_IMAGE } from '@/lib/store-cover';

function toTrimmedValue(value: string): string {
  return value.trim();
}

export default function StoreDashboardPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    currentUser,
    refreshCurrentUser,
  } = useAuth();

  const [dashboard, setDashboard] = useState<ApiStoreDashboardResponse | null>(
    null
  );
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isStoreAccount = currentUser?.accountType === 'STORE';

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    if (!isStoreAccount) {
      setIsLoadingDashboard(false);
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setIsLoadingDashboard(true);
      setErrorMessage(null);

      try {
        const data = await fetchMyStoreDashboard();

        if (cancelled) return;

        setDashboard(data);
        setBannerUrlInput(data.storeProfile.bannerUrl ?? '');
      } catch (error) {
        if (cancelled) return;

        if (isApiRequestError(error) && error.status === 401) {
          router.replace(createSignInHref(APP_ROUTES.storeDashboard));
          return;
        }

        setErrorMessage('Unable to load your store dashboard right now.');
      } finally {
        if (!cancelled) {
          setIsLoadingDashboard(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated, isStoreAccount, router]);

  const previewCoverImage = useMemo(() => {
    const trimmed = toTrimmedValue(bannerUrlInput);
    return trimmed || DEFAULT_STORE_COVER_IMAGE;
  }, [bannerUrlInput]);

  async function saveBannerUrl(nextBannerUrl: string) {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedValue = toTrimmedValue(nextBannerUrl);

    try {
      const updatedStore = await updateMyStore({
        bannerUrl: trimmedValue,
      });

      setBannerUrlInput(updatedStore.bannerUrl ?? '');
      setDashboard((previous) =>
        previous
          ? {
              ...previous,
              storeProfile: {
                ...previous.storeProfile,
                bannerUrl: updatedStore.bannerUrl,
              },
            }
          : previous
      );
      await refreshCurrentUser();

      setSuccessMessage(
        trimmedValue
          ? 'Store cover updated successfully.'
          : 'Store cover reset to default.'
      );
    } catch (error) {
      if (isApiRequestError(error) && error.status === 401) {
        router.replace(createSignInHref(APP_ROUTES.storeDashboard));
        return;
      }

      setErrorMessage('Could not update your cover right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveBannerUrl(bannerUrlInput);
  }

  async function handleResetToDefault() {
    await saveBannerUrl('');
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main>
        <Container className="py-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full max-w-5xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                  Store Dashboard
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Manage your storefront cover and profile highlights.
                </p>
              </div>

              {dashboard?.storeProfile?.slug ? (
                <Link
                  href={createStoreHref(dashboard.storeProfile.slug)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-slate-100"
                >
                  View Public Store
                </Link>
              ) : null}
            </div>

            {isAuthLoading || isLoadingDashboard ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
                Loading your store dashboard...
              </div>
            ) : !isStoreAccount ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-400/35 dark:bg-amber-500/10 dark:text-amber-200">
                This page is available for store accounts only.
              </div>
            ) : (
              <div className="space-y-4">
                {errorMessage ? (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-300">
                    {errorMessage}
                  </p>
                ) : null}

                {successMessage ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700 dark:border-emerald-400/35 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {successMessage}
                  </p>
                ) : null}

                <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:p-5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 sm:text-lg">
                    Cover Preview
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Your public store page will use this cover image.
                  </p>

                  <div
                    className="mt-4 h-44 w-full rounded-2xl border border-slate-900/70 bg-slate-950 shadow-lg shadow-slate-900/25 sm:h-52"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.76), rgba(30, 27, 75, 0.68)), url(${previewCoverImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                    <span>
                      Store: {dashboard?.storeProfile.storeName ?? 'Unknown'}
                    </span>
                    <span>
                      Products: {dashboard?.productCount ?? 0}
                    </span>
                    <span>
                      Orders: {dashboard?.orderCount ?? 0}
                    </span>
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:p-5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 sm:text-lg">
                    Update Cover URL
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Paste an image URL for your banner. Leave it empty to use
                    the default cover.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-3"
                  >
                    <label className="block text-sm">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Banner URL
                      </span>
                      <input
                        type="url"
                        value={bannerUrlInput}
                        onChange={(event) => setBannerUrlInput(event.target.value)}
                        placeholder="https://example.com/your-cover.jpg"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </label>

                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Store tags on your public page are auto-generated from your
                      listing categories.
                    </p>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? 'Saving...' : 'Save Cover'}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        disabled={isSaving}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-slate-100"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            )}
          </section>
        </Container>
      </main>

      <div className="bg-white dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}
