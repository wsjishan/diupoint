'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';

export default function PersonalSellerActions() {
  const [showContactOptions, setShowContactOptions] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <Button
          className="h-10 px-5"
          onClick={() => setShowContactOptions((previous) => !previous)}
          aria-expanded={showContactOptions}
          aria-controls="personal-contact-options"
        >
          Contact Seller
        </Button>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
        >
          Share
        </button>
      </div>

      <div
        id="personal-contact-options"
        className={`mt-3 flex gap-2 overflow-hidden transition-all duration-200 ${
          showContactOptions
            ? 'max-h-12 opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
        >
          Call
        </button>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
        >
          WhatsApp
        </button>
      </div>
    </div>
  );
}
