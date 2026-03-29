'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import {
  APP_ROUTES,
  createSignInHref,
  createVerifyAccountHref,
} from '@/lib/routes';

type GateModalType = 'login-required' | 'verification-required' | null;

interface PersonalSellerActionsProps {
  sellerPhone?: string;
}

function toWhatsAppHref(phone?: string): string {
  if (!phone) return '#';

  const numeric = phone.replace(/\D/g, '');
  return `https://wa.me/${numeric}`;
}

function toCallHref(phone?: string): string {
  if (!phone) return '#';

  return `tel:${phone}`;
}

export default function PersonalSellerActions({
  sellerPhone,
}: PersonalSellerActionsProps) {
  const { isAuthenticated, verificationStatus } = useAuth();

  const [showContactOptions, setShowContactOptions] = useState(false);
  const [gateModal, setGateModal] = useState<GateModalType>(null);

  const effectiveViewerState: 'guest' | 'unverified' | 'verified' =
    isAuthenticated
      ? verificationStatus === 'VERIFIED'
        ? 'verified'
        : 'unverified'
      : 'guest';

  const isViewerLoggedIn = effectiveViewerState !== 'guest';
  const isAccountVerified = effectiveViewerState === 'verified';

  const viewerLabel =
    effectiveViewerState === 'verified'
      ? 'Viewer: Verified'
      : effectiveViewerState === 'unverified'
        ? 'Viewer: Unverified'
        : 'Viewer: Guest';

  const loginHref = useMemo(() => {
    if (typeof window === 'undefined') {
      return APP_ROUTES.signIn;
    }

    return createSignInHref(window.location.pathname + window.location.search);
  }, []);

  function handleContactSellerClick() {
    if (!isViewerLoggedIn) {
      setGateModal('login-required');
      return;
    }

    if (!isAccountVerified) {
      setGateModal('verification-required');
      return;
    }

    setShowContactOptions((previous) => !previous);
  }

  function handleShareClick() {
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      navigator.share({
        title: 'DIUPoint Listing',
        text: 'Check this listing on DIUPoint',
        url: window.location.href,
      });
      return;
    }

    navigator.clipboard.writeText(window.location.href);
  }

  const modalContent =
    gateModal === 'login-required'
      ? {
          title: 'Sign in to continue',
          message: 'Contact options are available for verified accounts.',
          primaryLabel: 'Sign In',
          primaryHref: APP_ROUTES.signIn,
          secondaryLabel: 'Cancel',
        }
      : gateModal === 'verification-required'
        ? {
            title: 'Verify your account to contact sellers',
            message:
              'Use your DIU email to unlock calling and WhatsApp access and help keep DIUPoint safe for everyone.',
            primaryLabel: 'Verify Now',
            primaryHref: createVerifyAccountHref(),
            secondaryLabel: 'Maybe Later',
          }
        : null;

  return (
    <>
      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-slate-800/70">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Contact seller
        </p>

        <div className="mt-1.5 inline-flex items-center rounded-full border border-dashed border-[#2F3FBF]/35 bg-[#2F3FBF]/6 px-2.5 py-1 text-[11px] font-semibold text-[#2F3FBF] dark:border-indigo-300/35 dark:bg-indigo-400/12 dark:text-indigo-200">
          {viewerLabel}
        </div>

        <div className="mt-2 flex items-center gap-2.5">
          <Button
            className="h-10 flex-1 px-4"
            onClick={handleContactSellerClick}
            aria-expanded={showContactOptions}
            aria-controls="personal-contact-options"
          >
            Contact Seller
          </Button>

          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
          >
            Share
          </button>
        </div>

        <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
          {isAccountVerified
            ? 'Verified account: click Contact Seller to reveal WhatsApp and Call.'
            : 'Login and verification are required to unlock WhatsApp and Call.'}
        </p>

        <div
          id="personal-contact-options"
          className={`overflow-hidden transition-all duration-200 ${
            showContactOptions
              ? 'mt-2.5 max-h-32 opacity-100'
              : 'mt-0 max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-2.5 dark:border-emerald-400/35 dark:bg-emerald-500/10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700/90 dark:text-emerald-300">
              Contact Options Unlocked
            </p>
            <div className="grid w-full grid-cols-2 gap-2">
              <a
                href={toWhatsAppHref(sellerPhone)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
              >
                WhatsApp
              </a>
              <a
                href={toCallHref(sellerPhone)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
              >
                Call
              </a>
            </div>
          </div>
        </div>
      </div>

      {modalContent ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-[2px]"
          onClick={() => setGateModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={modalContent.title}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {modalContent.title}
              </h3>
              <button
                type="button"
                onClick={() => setGateModal(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6l-12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              {modalContent.message}
            </p>

            <div className="mt-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setGateModal(null)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
              >
                {modalContent.secondaryLabel}
              </button>

              {gateModal === 'login-required' ? (
                <Link
                  href={loginHref}
                  onClick={() => setGateModal(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
                >
                  {modalContent.primaryLabel}
                </Link>
              ) : (
                <Link
                  href={modalContent.primaryHref}
                  onClick={() => setGateModal(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
                >
                  {modalContent.primaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
