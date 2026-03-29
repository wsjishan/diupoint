'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteToggleButton from '@/components/listing/favorite-toggle-button';
import { getListingSlug, type Listing } from '@/data/mock-listings';
import { createListingHref, createStoreHref } from '@/lib/routes';

type ConditionBadge = 'new' | 'used';

const badgeClasses: Record<ConditionBadge, string> = {
  new: 'bg-green-500 text-white',
  used: 'bg-amber-500 text-white',
};

const badgeLabels: Record<ConditionBadge, string> = {
  new: 'New',
  used: 'Used',
};

const fallbackGradients = [
  'linear-gradient(135deg, #eef2ff, #e0e7ff)',
  'linear-gradient(135deg, #eff6ff, #e2e8f0)',
  'linear-gradient(135deg, #f8fafc, #e0e7ff)',
];

function getFallbackGradient(seed: string): string {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return fallbackGradients[Math.abs(hash) % fallbackGradients.length];
}

interface ListingCardProps {
  listing: Listing;
}

function toStoreSlug(listing: Listing): string {
  if (listing.storeSlug) return listing.storeSlug;

  return listing.seller
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function ListingCard({ listing }: ListingCardProps) {
  const isRental = listing.category === 'Housing';
  const listingHref = createListingHref(getListingSlug(listing));
  const imageSrc = listing.imageUrl?.trim() ?? '';
  const hasImage = imageSrc.length > 0;
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const showImage = hasImage && failedImageSrc !== imageSrc;
  const fallbackBackground = getFallbackGradient(listing.id);
  const isStoreSeller =
    listing.sellerType === 'store' || Boolean(listing.storeSlug);
  const storeHref = createStoreHref(toStoreSlug(listing));
  const conditionBadge: ConditionBadge = listing.condition ?? 'used';

  return (
    <article className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-800/90 shadow-sm shadow-gray-900/5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-gray-200 dark:hover:border-white/20 hover:shadow-xl hover:shadow-gray-900/12 dark:hover:shadow-black/35">
      {/* Image placeholder */}
      <div
        className="relative aspect-4/3 w-full overflow-hidden transition-all duration-200 group-hover:brightness-105"
        style={
          showImage
            ? undefined
            : {
                background: fallbackBackground,
              }
        }
      >
        {showImage ? (
          <Link
            href={listingHref}
            aria-label={`View details for ${listing.title}`}
            className="absolute inset-0"
          >
            <Image
              src={imageSrc}
              alt={listing.title}
              fill
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              onError={() => setFailedImageSrc(imageSrc)}
            />
          </Link>
        ) : (
          <Link
            href={listingHref}
            aria-label={`View details for ${listing.title}`}
            className="absolute inset-0"
          />
        )}

        {/* subtle bottom vignette to lift card content boundary */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/20 to-transparent" />

        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClasses[conditionBadge]}`}
        >
          {badgeLabels[conditionBadge]}
        </span>
        <FavoriteToggleButton
          listingId={listing.id}
          className="group/heart absolute right-2 top-2 rounded-full bg-white/80 dark:bg-slate-700/80 p-1.5 text-gray-500 dark:text-slate-300 shadow-sm transition-all duration-150 hover:scale-110 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-500 hover:shadow-md"
        />
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-3 lg:p-3.5">
        <span className="inline-flex w-fit items-center rounded-full bg-gray-100 dark:bg-slate-700/80 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-slate-300">
          {listing.category}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-slate-100 transition-colors group-hover:text-[#2F3FBF] dark:group-hover:text-indigo-400">
          <Link
            href={listingHref}
            className="hover:underline"
          >
            {listing.title}
          </Link>
        </h3>
        <p className="mt-auto pt-0.5 text-base font-bold text-gray-900 dark:text-slate-100">
          ৳ {listing.price.toLocaleString()}
          {isRental && (
            <span className="ml-1 text-xs font-medium text-gray-400 dark:text-slate-500">
              / month
            </span>
          )}
        </p>
        {isStoreSeller ? (
          <div className="mt-1.5 flex min-w-0 items-center gap-1 text-xs text-gray-600 dark:text-slate-300">
            <span className="shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#2F3FBF] dark:bg-indigo-500/15 dark:text-indigo-300">
              Store
            </span>
            <span
              className="inline-flex shrink-0"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9l1.5-4.5h15L21 9m-18 0h18v10.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5V9zm4.5 0v12m9-12v12"
                />
              </svg>
            </span>
            <Link
              href={storeHref}
              className="min-w-0 flex-1 truncate font-medium text-gray-700 transition-colors hover:text-[#2F3FBF] dark:text-slate-200 dark:hover:text-indigo-300"
            >
              {listing.seller}
            </Link>
          </div>
        ) : (
          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-gray-600 dark:text-slate-300">
            <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-slate-700 dark:text-slate-200">
              Seller
            </span>
            <span
              className="inline-flex shrink-0"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
                />
              </svg>
            </span>
            <span className="truncate font-medium text-gray-700 dark:text-slate-200">
              {listing.seller}
            </span>
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-3.5 w-3.5 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          <span className="truncate">{listing.location}</span>
        </div>
        <Link
          href={listingHref}
          className="mt-1 inline-flex w-fit text-xs font-semibold text-[#2F3FBF] transition-colors hover:text-[#2535a8] dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
