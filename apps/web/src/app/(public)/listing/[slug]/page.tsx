import Link from 'next/link';
import { notFound } from 'next/navigation';
import FavoriteToggleButton from '@/components/listing/favorite-toggle-button';
import ListingImageGallery from '@/components/listing/listing-image-gallery';
import PersonalSellerActions from '@/components/listing/personal-seller-actions';
import StorePurchaseActions from '@/components/listing/store-purchase-actions';
import Container from '@/components/ui/container';
import ListingCard from '@/components/ui/listing-card';
import SellerTypeIcon from '@/components/ui/seller-type-icon';
import VerificationTick from '@/components/ui/verification-tick';
import { ALL_LISTINGS, type Listing } from '@/data/mock-listings';
import { getStoreBySlug } from '@/data/mock-stores';
import { fetchListingBySlug, fetchListings } from '@/lib/api/listings';
import { createStoreHref } from '@/lib/routes';
import { fetchStoreBySlug } from '@/lib/api/stores';

interface ListingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatPostedDate(isoDate?: string): string {
  if (!isoDate) return 'Recently posted';

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'Recently posted';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatPaymentLabel(method: 'cod' | 'bkash' | 'card'): string {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'bkash') return 'bKash';
  return 'Card';
}

function formatStockStatus(
  status?: 'in-stock' | 'low-stock' | 'out-of-stock'
): string {
  if (status === 'low-stock') return 'Low stock';
  if (status === 'out-of-stock') return 'Out of stock';
  return 'In stock';
}

function stockToneClasses(
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
): string {
  if (status === 'out-of-stock') {
    return 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-300';
  }

  if (status === 'low-stock') {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-300';
  }

  return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300';
}

function getMoreFromTitle(listing: Listing): string {
  if (listing.sellerType === 'store' || listing.storeSlug) {
    return `More from ${listing.seller}`;
  }

  return `More from ${listing.seller}`;
}

function getRelatedListings(
  listing: Listing,
  sourceListings: Listing[]
): Listing[] {
  const bySameSeller = sourceListings.filter((item) => {
    if (item.id === listing.id) return false;

    if (listing.sellerType === 'store' || listing.storeSlug) {
      return item.storeSlug && item.storeSlug === listing.storeSlug;
    }

    return item.seller === listing.seller && item.sellerType !== 'store';
  });

  if (bySameSeller.length > 0) {
    return bySameSeller.slice(0, 6);
  }

  return sourceListings
    .filter(
      (item) => item.id !== listing.id && item.category === listing.category
    )
    .slice(0, 6);
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await fetchListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const [relatedSource, storefront] = await Promise.all([
    fetchListings({ category: listing.category }),
    listing.storeSlug
      ? fetchStoreBySlug(listing.storeSlug)
      : Promise.resolve(null),
  ]);

  const store = listing.storeSlug
    ? (storefront?.store ?? getStoreBySlug(listing.storeSlug) ?? null)
    : null;
  const isStoreSeller =
    listing.sellerType === 'store' || Boolean(listing.storeSlug);
  const isVerified = isStoreSeller
    ? (store?.isVerified ?? listing.isSellerVerified ?? false)
    : (listing.isSellerVerified ?? false);
  const sellerSummary = isStoreSeller
    ? (listing.sellerSummary ??
      store?.shortTagline ??
      'Student-run store on DIUPoint.')
    : (listing.sellerSummary ?? 'DIU student seller.');
  const stockStatus = listing.stockStatus ?? 'in-stock';
  const paymentMethods = listing.paymentSupported ?? [];
  const relatedListings = getRelatedListings(
    listing,
    relatedSource.listings.length > 0 ? relatedSource.listings : ALL_LISTINGS
  );

  return (
    <>
      <main
        className={`pt-5 sm:pt-6 ${isStoreSeller ? 'pb-30 sm:pb-16' : 'pb-12 sm:pb-16'}`}
      >
        <Container>
          <section className="grid items-start gap-6 lg:grid-cols-2">
            <ListingImageGallery
              title={listing.title}
              images={
                listing.images ??
                (listing.imageUrl ? [listing.imageUrl] : undefined)
              }
              fallbackSeed={listing.slug ?? listing.id}
            />

            <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {listing.category}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    listing.condition === 'new'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {listing.condition === 'new' ? 'New' : 'Used'}
                </span>

                <FavoriteToggleButton
                  listingId={listing.id}
                  showText
                  className="ml-auto inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-gray-600 transition-colors hover:border-rose-200 hover:text-rose-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-400/40 dark:hover:text-rose-300"
                  iconClassName="h-3.5 w-3.5"
                />
              </div>

              <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-gray-950 dark:text-slate-100 sm:text-[1.75rem]">
                {listing.title}
              </h1>

              <p className="mt-2.5 text-3xl font-black tracking-tight text-[#2F3FBF] dark:text-indigo-300">
                ৳ {listing.price.toLocaleString()}
              </p>

              <div className="mt-3.5 space-y-1.5 text-sm text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    className="h-4 w-4 shrink-0"
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
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    className="h-4 w-4 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25m10.5-2.25v2.25M4.5 8.25h15M5.25 5.25h13.5A1.5 1.5 0 0120.25 6.75v12a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-12a1.5 1.5 0 011.5-1.5z"
                    />
                  </svg>
                  <span>Posted {formatPostedDate(listing.postedAt)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-slate-800/70">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  {isStoreSeller ? 'Store Identity' : 'Seller Identity'}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <p className="text-[15px] font-semibold text-gray-900 dark:text-slate-100">
                    {isStoreSeller ? (
                      listing.storeSlug ? (
                        <Link
                          href={createStoreHref(listing.storeSlug)}
                          className="transition-colors hover:text-[#2F3FBF] dark:hover:text-indigo-300"
                        >
                          {store?.name ?? listing.seller}
                        </Link>
                      ) : (
                        (store?.name ?? listing.seller)
                      )
                    ) : (
                      listing.seller
                    )}
                  </p>
                  {isVerified ? <VerificationTick /> : null}
                  <SellerTypeIcon sellerType={isStoreSeller ? 'store' : 'personal'} />
                </div>
                {isStoreSeller ? (
                  <p className="mt-1.5 text-sm text-gray-600 dark:text-slate-300">
                    {`Sold by ${store?.name ?? listing.seller}. ${sellerSummary}`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Responds directly via phone or WhatsApp
                  </p>
                )}

                {isStoreSeller && listing.storeSlug ? (
                  <Link
                    href={createStoreHref(listing.storeSlug)}
                    className="mt-1.5 inline-flex items-center text-sm font-semibold text-[#2F3FBF]/90 transition-colors hover:text-[#2535a8] dark:text-indigo-300/90 dark:hover:text-indigo-200"
                  >
                    Visit store page
                  </Link>
                ) : null}
              </div>

              {isStoreSeller ? (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/55 p-3.5 shadow-sm shadow-indigo-900/5 dark:border-indigo-400/25 dark:bg-indigo-500/10">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700/80 dark:text-indigo-300/90">
                    Purchase Options
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${stockToneClasses(stockStatus)}`}
                    >
                      {formatStockStatus(stockStatus)}
                    </span>
                    {paymentMethods.map((method) => (
                      <span
                        key={method}
                        className="inline-flex rounded-full border border-indigo-200/80 bg-white px-2.5 py-1 font-medium text-gray-700 dark:border-indigo-400/30 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {formatPaymentLabel(method)}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3">
                    <StorePurchaseActions
                      listingId={listing.id}
                      stockStatus={stockStatus}
                    />
                  </div>

                  {stockStatus === 'out-of-stock' ? (
                    <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">
                      This item is currently unavailable.
                    </p>
                  ) : null}
                </div>
              ) : (
                <PersonalSellerActions sellerPhone={listing.sellerPhone} />
              )}
            </article>
          </section>

          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:mt-6 sm:p-5">
            <p className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">
              Description
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Product details and seller notes
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-6.5 text-gray-700 dark:text-slate-300 sm:text-[15px]">
              {listing.description}
            </p>
          </section>

          <section className="mt-10 sm:mt-12">
            <div className="mb-4 flex items-end justify-between sm:mb-5">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-950 dark:text-slate-100 sm:text-2xl">
                {getMoreFromTitle(listing)}
              </h2>
            </div>

            {relatedListings.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4">
                {relatedListings.map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
                No additional listings yet.
              </div>
            )}
          </section>
        </Container>
      </main>

      {isStoreSeller ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/96 px-3 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/96 lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black tracking-tight text-[#2F3FBF] dark:text-indigo-300">
                ৳ {listing.price.toLocaleString()}
              </p>
              <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
                {formatStockStatus(stockStatus)}
              </p>
            </div>

            <StorePurchaseActions
              listingId={listing.id}
              stockStatus={stockStatus}
              compact
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
