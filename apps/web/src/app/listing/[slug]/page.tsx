import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import ListingImageGallery from '@/components/listing/listing-image-gallery';
import Button from '@/components/ui/button';
import Container from '@/components/ui/container';
import ListingCard from '@/components/ui/listing-card';
import {
  ALL_LISTINGS,
  getListingBySlug,
  type Listing,
} from '@/data/mock-listings';
import { getStoreBySlug } from '@/data/mock-stores';

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

function getMoreFromTitle(listing: Listing): string {
  if (listing.sellerType === 'store' || listing.storeSlug) {
    return `More from ${listing.seller}`;
  }

  return `More from ${listing.seller}`;
}

function getRelatedListings(listing: Listing): Listing[] {
  const bySameSeller = ALL_LISTINGS.filter((item) => {
    if (item.id === listing.id) return false;

    if (listing.sellerType === 'store' || listing.storeSlug) {
      return item.storeSlug && item.storeSlug === listing.storeSlug;
    }

    return item.seller === listing.seller && item.sellerType !== 'store';
  });

  if (bySameSeller.length > 0) {
    return bySameSeller.slice(0, 6);
  }

  return ALL_LISTINGS.filter(
    (item) => item.id !== listing.id && item.category === listing.category
  ).slice(0, 6);
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const store = listing.storeSlug ? getStoreBySlug(listing.storeSlug) : null;
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
  const relatedListings = getRelatedListings(listing);

  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main className="pb-12 pt-6 sm:pb-16 sm:pt-8">
        <Container>
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
            <ListingImageGallery
              title={listing.title}
              images={
                listing.images ??
                (listing.imageUrl ? [listing.imageUrl] : undefined)
              }
              fallbackSeed={listing.slug ?? listing.id}
            />

            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
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
              </div>

              <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                {listing.title}
              </h1>

              <p className="mt-4 text-3xl font-black tracking-tight text-[#2F3FBF] dark:text-indigo-300">
                ৳ {listing.price.toLocaleString()}
              </p>

              <div className="mt-5 space-y-2 text-sm text-gray-500 dark:text-slate-400">
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

              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-slate-800/70">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {isStoreSeller ? (
                      listing.storeSlug ? (
                        <Link
                          href={`/store/${listing.storeSlug}`}
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
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      isVerified
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'border border-gray-200 bg-white text-gray-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {isVerified
                      ? isStoreSeller
                        ? 'Verified Store'
                        : 'Verified Seller'
                      : isStoreSeller
                        ? 'Unverified Store'
                        : 'Unverified Seller'}
                  </span>
                  <span className="inline-flex rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
                    {isStoreSeller ? 'Store Seller' : 'Personal Seller'}
                  </span>
                </div>
                <p className="mt-2 line-clamp-1 text-sm text-gray-600 dark:text-slate-300">
                  {isStoreSeller
                    ? `Sold by ${store?.name ?? listing.seller}. ${sellerSummary}`
                    : `Listed by ${listing.seller}. ${sellerSummary}`}
                </p>

                {isStoreSeller && listing.storeSlug ? (
                  <Link
                    href={`/store/${listing.storeSlug}`}
                    className="mt-3 inline-flex items-center text-sm font-semibold text-[#2F3FBF] transition-colors hover:text-[#2535a8] dark:text-indigo-300 dark:hover:text-indigo-200"
                  >
                    Visit store page
                  </Link>
                ) : null}
              </div>

              {isStoreSeller ? (
                <div className="mt-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${
                        stockStatus === 'out-of-stock'
                          ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-300'
                          : stockStatus === 'low-stock'
                            ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-300'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300'
                      }`}
                    >
                      {formatStockStatus(stockStatus)}
                    </span>
                    {paymentMethods.map((method) => (
                      <span
                        key={method}
                        className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                      >
                        {formatPaymentLabel(method)}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <Button
                      variant="secondary"
                      className="h-11 flex-1 border-indigo-300 bg-indigo-50 text-[#2F3FBF] hover:bg-indigo-100 dark:border-indigo-400/35 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                    >
                      Add to Cart
                    </Button>
                    <Button className="h-11 flex-1 sm:px-6">Buy Now</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <Button className="h-11 flex-1 sm:px-6">
                      Message Seller
                    </Button>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
                    >
                      Call
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
                    >
                      Share
                    </button>
                  </div>
                </div>
              )}
            </article>
          </section>

          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:mt-10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Description
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-slate-300 sm:text-[15px]">
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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

      <div className="bg-gray-50 dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}
