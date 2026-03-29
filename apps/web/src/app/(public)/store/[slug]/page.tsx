import { notFound } from 'next/navigation';
import Container from '@/components/ui/container';
import StorefrontProducts from '@/components/store/storefront-products';
import { ALL_LISTINGS, type Listing } from '@/data/mock-listings';
import { getStoreBySlug as getMockStoreBySlug } from '@/data/mock-stores';
import { fetchStoreBySlug } from '@/lib/api/stores';

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const HERO_GRADIENTS = [
  'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #1e3a8a 100%)',
  'linear-gradient(135deg, #111827 0%, #1e293b 55%, #312e81 100%)',
  'linear-gradient(135deg, #0f172a 0%, #1f2937 45%, #1d4ed8 100%)',
  'linear-gradient(135deg, #111827 0%, #1e1b4b 52%, #0f766e 100%)',
  'linear-gradient(135deg, #0b1120 0%, #172554 50%, #0f172a 100%)',
];

function pickCoverGradient(seed: string): string {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return HERO_GRADIENTS[Math.abs(hash) % HERO_GRADIENTS.length];
}

function formatJoinedDate(joinedAt: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(joinedAt));
}

function toStoreSlug(listing: Listing): string {
  if (listing.storeSlug) return listing.storeSlug;

  return listing.seller
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function toSingleStoreSummary(
  shortTagline: string,
  description: string
): string {
  const compactTagline = shortTagline.trim().replace(/[.!?]+$/, '');
  const compactDescription = description.trim();
  return `${compactTagline}. ${compactDescription}`;
}

const HERO_META_CHIP_CLASS =
  'inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] leading-4 font-medium text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';

const HERO_META_CHIP_ICON_CLASS =
  'mr-1.5 h-3.5 w-3.5 shrink-0 text-gray-500 dark:text-slate-400';

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const apiStorefront = await fetchStoreBySlug(slug);
  const store = apiStorefront?.store ?? getMockStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const storeListings =
    apiStorefront?.listings ??
    ALL_LISTINGS.filter((listing) => {
      const isStoreSeller =
        listing.sellerType === 'store' || Boolean(listing.storeSlug);

      if (!isStoreSeller) return false;

      return toStoreSlug(listing) === store.slug;
    });

  const storeCategories = Array.from(
    new Set(storeListings.map((listing) => listing.category))
  );
  const visibleStoreCategories = storeCategories.slice(0, 3);
  const hiddenCategoryCount = Math.max(storeCategories.length - 3, 0);

  return (
    <main>
      <div className="bg-white pb-10 pt-6 dark:bg-slate-950 sm:pb-12 sm:pt-8">
        <Container>
            <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 shadow-xl shadow-slate-900/30 dark:border-indigo-400/25">
              <div
                className="relative h-40 w-full border-b border-white/10 sm:h-48"
                style={{
                  backgroundImage: store.coverImage
                    ? `linear-gradient(135deg, rgba(2, 6, 23, 0.76), rgba(30, 27, 75, 0.68)), url(${store.coverImage})`
                    : pickCoverGradient(store.slug),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-400/35 blur-3xl" />
                <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.16),transparent_45%),radial-gradient(circle_at_82%_10%,rgba(129,140,248,0.26),transparent_38%)]" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-900/25 to-transparent" />
              </div>

              <div className="relative z-10 px-3 pb-5 sm:px-7 sm:pb-7">
                <div className="-mt-10 rounded-2xl border border-slate-200/90 bg-white/96 p-3.5 shadow-xl shadow-slate-900/15 ring-1 ring-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/92 dark:ring-white/5 sm:-mt-12 sm:p-5">
                  <div className="min-w-0 lg:max-w-4xl">
                    <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-start sm:gap-3.5">
                      <div className="relative -mt-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/85 bg-white text-sm font-bold text-[#2F3FBF] shadow-lg shadow-indigo-900/15 ring-1 ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300 dark:ring-indigo-400/25 sm:-mt-8 sm:h-18 sm:w-18 sm:text-lg">
                        {store.logoPlaceholder}
                      </div>

                      <div className="min-w-0 pt-0.5 sm:pt-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-4xl">
                            {store.name}
                          </h1>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              store.isVerified
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : 'border border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {store.isVerified
                              ? 'Verified Store'
                              : 'Unverified Store'}
                          </span>
                        </div>

                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700 dark:text-slate-300 sm:mt-2.5 sm:text-[15px]">
                          {toSingleStoreSummary(
                            store.shortTagline,
                            store.description
                          )}
                        </p>

                        <div className="mt-2.5 flex flex-col gap-2 sm:mt-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href="#"
                              aria-label="Facebook"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-3.5 w-3.5"
                              >
                                <path d="M13.5 9H16V6h-2.5C11.57 6 10 7.57 10 9.5V12H8v3h2v6h3v-6h2.26l.74-3H13v-2.5c0-.28.22-.5.5-.5z" />
                              </svg>
                            </a>
                            <a
                              href="#"
                              aria-label="Instagram"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                className="h-3.5 w-3.5"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="5"
                                  ry="5"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="4"
                                />
                                <circle
                                  cx="17.5"
                                  cy="6.5"
                                  r="1"
                                  fill="currentColor"
                                  stroke="none"
                                />
                              </svg>
                            </a>
                            <a
                              href="#"
                              aria-label="WhatsApp"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-3.5 w-3.5"
                              >
                                <path d="M19.05 4.94A9.94 9.94 0 0012.06 2C6.57 2 2.1 6.47 2.1 11.96c0 1.76.46 3.48 1.33 4.99L2 22l5.21-1.37a9.9 9.9 0 004.84 1.24h.01c5.49 0 9.96-4.47 9.96-9.96a9.9 9.9 0 00-2.97-6.97zM12.06 20.2h-.01a8.24 8.24 0 01-4.19-1.15l-.3-.18-3.09.81.83-3.01-.2-.31a8.25 8.25 0 01-1.28-4.4c0-4.55 3.7-8.25 8.25-8.25 2.2 0 4.27.85 5.83 2.41a8.2 8.2 0 012.42 5.83c0 4.55-3.7 8.25-8.26 8.25zm4.52-6.18c-.25-.13-1.5-.74-1.73-.82-.23-.09-.39-.13-.56.13-.17.25-.65.82-.79.99-.14.17-.28.19-.53.06-.25-.13-1.04-.38-1.98-1.22-.74-.65-1.24-1.45-1.38-1.7-.14-.25-.01-.38.11-.5.11-.11.25-.28.38-.42.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.02 2.61c.13.17 1.76 2.69 4.27 3.77.6.26 1.08.41 1.45.53.61.2 1.16.17 1.6.1.49-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.15-.48-.27z" />
                              </svg>
                            </a>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-[#2F3FBF] transition-colors hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                className="h-3.5 w-3.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M7.5 12a4.5 4.5 0 014.5-4.5h3m-6 9h3a4.5 4.5 0 004.5-4.5m-9 0H5.25m13.5 0H21"
                                />
                              </svg>
                              Share
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {visibleStoreCategories.map((category) => (
                              <span
                                key={category}
                                className={HERO_META_CHIP_CLASS}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.8}
                                  className={HERO_META_CHIP_ICON_CLASS}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20.59 13.41l-7.18 7.18a2 2 0 01-2.83 0L3 13V3h10l7.59 7.59a2 2 0 010 2.82z"
                                  />
                                  <circle
                                    cx="7.5"
                                    cy="7.5"
                                    r="1.2"
                                    fill="currentColor"
                                    stroke="none"
                                  />
                                </svg>
                                {category}
                              </span>
                            ))}
                            {hiddenCategoryCount > 0 ? (
                              <span className={HERO_META_CHIP_CLASS}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.8}
                                  className={HERO_META_CHIP_ICON_CLASS}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20.59 13.41l-7.18 7.18a2 2 0 01-2.83 0L3 13V3h10l7.59 7.59a2 2 0 010 2.82z"
                                  />
                                  <circle
                                    cx="7.5"
                                    cy="7.5"
                                    r="1.2"
                                    fill="currentColor"
                                    stroke="none"
                                  />
                                </svg>
                                +{hiddenCategoryCount} more
                              </span>
                            ) : null}
                            <span className={HERO_META_CHIP_CLASS}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                className={HERO_META_CHIP_ICON_CLASS}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 7.5h18M6.75 3.75h10.5A1.5 1.5 0 0118.75 5.25v13.5a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 10.5h6M9 14h6"
                                />
                              </svg>
                              {store.productCount} products
                            </span>
                            <span className={HERO_META_CHIP_CLASS}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                className={HERO_META_CHIP_ICON_CLASS}
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="17"
                                  rx="2"
                                  ry="2"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16 2v4M8 2v4M3 10h18"
                                />
                              </svg>
                              Joined {formatJoinedDate(store.joinedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        </Container>
      </div>

      <Container>
        <StorefrontProducts
          storeName={store.name}
          listings={storeListings}
          productCount={store.productCount}
        />
      </Container>
    </main>
  );
}
