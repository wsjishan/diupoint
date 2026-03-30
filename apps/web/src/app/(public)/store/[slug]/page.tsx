import { notFound } from 'next/navigation';
import Container from '@/components/ui/container';
import VerificationTick from '@/components/ui/verification-tick';
import StorefrontProducts from '@/components/store/storefront-products';
import { ALL_LISTINGS, type Listing } from '@/data/mock-listings';
import { getStoreBySlug as getMockStoreBySlug } from '@/data/mock-stores';
import { fetchStoreBySlug } from '@/lib/api/stores';
import { DEFAULT_STORE_COVER_IMAGE } from '@/lib/store-cover';

interface StorePageProps {
  params: Promise<{
    slug: string;
  }>;
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
  const compactTagline = shortTagline.trim();
  const compactDescription = description.trim();

  if (!compactTagline && !compactDescription) {
    return 'Student-run storefront serving DIU students.';
  }

  if (!compactTagline) return compactDescription;
  if (!compactDescription) return compactTagline;

  const normalizedTagline = compactTagline
    .toLowerCase()
    .replace(/[.!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const normalizedDescription = compactDescription
    .toLowerCase()
    .replace(/[.!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    normalizedTagline === normalizedDescription ||
    normalizedDescription.includes(normalizedTagline) ||
    normalizedTagline.includes(normalizedDescription)
  ) {
    return compactDescription.length >= compactTagline.length
      ? compactDescription
      : compactTagline;
  }

  const taglineWithPunctuation = /[.!?]$/.test(compactTagline)
    ? compactTagline
    : `${compactTagline}.`;

  return `${taglineWithPunctuation} ${compactDescription}`;
}

const HERO_META_CHIP_CLASS =
  'inline-flex h-8 items-center rounded-full border border-slate-200/90 bg-white/85 px-3 text-xs font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm transition-colors duration-200 hover:border-indigo-200 hover:text-[#2F3FBF] dark:border-slate-600/90 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-indigo-400/70 dark:hover:text-indigo-300';

const HERO_META_CHIP_ICON_CLASS =
  'mr-1.5 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400';

const HERO_SOCIAL_BUTTON_CLASS =
  'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white/85 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-[#2F3FBF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/40 dark:border-slate-600/90 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300 dark:focus-visible:ring-indigo-400/50';

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

  const resolvedCoverImage = store.coverImage?.trim() || DEFAULT_STORE_COVER_IMAGE;

  return (
    <main>
      <div className="bg-white pb-10 pt-6 dark:bg-slate-950 sm:pb-12 sm:pt-8">
        <Container>
          <section className="group relative overflow-hidden rounded-[28px] border border-slate-900/80 bg-slate-950 shadow-[0_30px_65px_-28px_rgba(15,23,42,0.65)] dark:border-indigo-300/25">
            <div
              className="relative h-44 w-full border-b border-white/10 sm:h-56"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.76), rgba(30, 27, 75, 0.68)), url(${resolvedCoverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute -right-16 -top-14 h-56 w-56 rounded-full bg-indigo-400/35 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.16),transparent_45%),radial-gradient(circle_at_82%_10%,rgba(129,140,248,0.26),transparent_38%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.02)_38%,rgba(255,255,255,0)_62%)]" />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-900/25 to-transparent" />
            </div>

            <div className="relative z-10 px-3 pb-4 sm:px-6 sm:pb-7">
              <div className="-mt-11 rounded-[24px] border border-slate-200/90 bg-white/88 p-3.5 shadow-[0_24px_48px_-30px_rgba(15,23,42,0.72)] ring-1 ring-white/75 backdrop-blur-xl transition-all duration-200 group-hover:shadow-[0_28px_54px_-28px_rgba(15,23,42,0.8)] dark:border-white/10 dark:bg-slate-900/85 dark:ring-white/5 sm:-mt-14 sm:p-6">
                <div className="min-w-0 lg:max-w-4xl">
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:gap-4">
                    <div className="relative -mt-8 shrink-0 sm:-mt-12">
                      <div className="rounded-[22px] bg-linear-to-br from-indigo-400/75 via-violet-400/65 to-cyan-300/70 p-[1.5px] shadow-[0_18px_34px_-18px_rgba(79,70,229,0.78)] transition-transform duration-200 group-hover:-translate-y-0.5">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/70 bg-white text-base font-black tracking-[0.08em] text-[#2F3FBF] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] dark:border-slate-700/80 dark:bg-slate-900 dark:text-indigo-200 dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.18)] sm:h-20 sm:w-20 sm:text-xl">
                          <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] dark:drop-shadow-none">
                            {store.logoPlaceholder}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 pt-0.5 sm:pt-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 items-center rounded-full border border-indigo-200/90 bg-indigo-50/95 px-2.5 text-[11px] font-semibold text-[#2F3FBF] dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-300">
                          Campus Store
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <h1 className="text-[1.9rem] font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-[2.5rem]">
                          {store.name}
                        </h1>

                        {store.isVerified ? <VerificationTick /> : null}
                      </div>

                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-[15px]">
                        {toSingleStoreSummary(
                          store.shortTagline,
                          store.description
                        )}
                      </p>

                      <div className="mt-3 flex flex-col gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href="#"
                            aria-label="Facebook"
                            className={HERO_SOCIAL_BUTTON_CLASS}
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
                            className={HERO_SOCIAL_BUTTON_CLASS}
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
                            className={HERO_SOCIAL_BUTTON_CLASS}
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
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-indigo-200/90 bg-indigo-50/95 px-3 text-xs font-semibold text-[#2F3FBF] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/40 dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25 dark:focus-visible:ring-indigo-400/50"
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

                        <div className="flex flex-wrap items-center gap-2">
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
