'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';

type GateModalType = 'login-required' | 'verification-required' | null;

interface PersonalSellerActionsProps {
  sellerPhone?: string;
  isLoggedIn: boolean;
  isVerified: boolean;
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
  isLoggedIn,
  isVerified,
}: PersonalSellerActionsProps) {
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [gateModal, setGateModal] = useState<GateModalType>(null);

  function handleContactSellerClick() {
    if (!isLoggedIn) {
      setGateModal('login-required');
      return;
    }

    if (!isVerified) {
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
          title: 'Login required',
          message: 'To contact the seller, please sign in to your account.',
          primaryLabel: 'Sign In',
          primaryHref: '/signin',
        }
      : gateModal === 'verification-required'
        ? {
            title: 'Verification required',
            message:
              'To protect both buyers and sellers, you need to verify your account before contacting sellers.',
            primaryLabel: 'Verify Now',
            primaryHref: '/verify',
          }
        : null;

  return (
    <>
      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-slate-800/70">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Contact seller
        </p>

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
          Login & verification required
        </p>

        <div
          id="personal-contact-options"
          className={`overflow-hidden transition-all duration-200 ${
            showContactOptions
              ? 'mt-2.5 max-h-14 opacity-100'
              : 'mt-0 max-h-0 opacity-0 pointer-events-none'
          }`}
        >
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

      {modalContent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-900">
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
              {modalContent.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              {modalContent.message}
            </p>

            <div className="mt-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setGateModal(null)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
              >
                Cancel
              </button>
              <a
                href={modalContent.primaryHref}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
              >
                {modalContent.primaryLabel}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
