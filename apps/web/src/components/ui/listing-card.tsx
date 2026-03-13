import Image from 'next/image';
import type { Listing } from '@/data/mock-listings';

const badgeClasses: Record<string, string> = {
  New: 'bg-green-500 text-white',
  Used: 'bg-amber-500 text-white',
  Featured: 'bg-[#2F3FBF] text-white',
};

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const isRental = listing.category === 'Housing';
  const hasImage = Boolean(listing.imageUrl);

  return (
    <article className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-800/90 shadow-sm shadow-gray-900/3 transition-all duration-200 hover:-translate-y-1 hover:border-gray-200 dark:hover:border-white/20 hover:shadow-lg hover:shadow-gray-900/10 dark:hover:shadow-black/35">
      {/* Image placeholder */}
      <div
        className="relative aspect-4/3 w-full overflow-hidden transition-all duration-200 group-hover:brightness-105"
        style={
          hasImage
            ? undefined
            : {
                background: `linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})`,
              }
        }
      >
        {hasImage ? (
          <Image
            src={listing.imageUrl as string}
            alt={listing.title}
            fill
            className="h-full w-full object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : null}

        {/* subtle bottom vignette to lift card content boundary */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/20 to-transparent" />

        {listing.badge && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
              badgeClasses[listing.badge] ?? 'bg-gray-500 text-white'
            }`}
          >
            {listing.badge}
          </span>
        )}
        <button
          type="button"
          aria-label="Add to wishlist"
          className="group/heart absolute right-2 top-2 rounded-full bg-white/80 dark:bg-slate-700/80 p-1.5 shadow-sm transition-all duration-150 hover:scale-110 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-4 w-4 text-gray-500 dark:text-slate-400 transition-colors group-hover/heart:text-rose-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-3 lg:p-3.5">
        <span className="inline-flex w-fit items-center rounded-full bg-gray-100 dark:bg-slate-700/80 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-slate-300">
          {listing.category}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-slate-100 transition-colors group-hover:text-[#2F3FBF] dark:group-hover:text-indigo-400">
          {listing.title}
        </h3>
        <p className="mt-auto pt-0.5 text-base font-bold text-gray-900 dark:text-slate-100">
          ৳ {listing.price.toLocaleString()}
          {isRental && (
            <span className="ml-1 text-xs font-medium text-gray-400 dark:text-slate-500">
              / month
            </span>
          )}
        </p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
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
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <span className="truncate">{listing.seller}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
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
      </div>
    </article>
  );
}
