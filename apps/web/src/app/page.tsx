import Container from '@/components/ui/container';
import SectionHeader from '@/components/ui/section-header';
import ListingCard from '@/components/ui/listing-card';
import LandingBanner from '@/components/ui/landing-banner';
import StoreCard from '@/components/ui/store-card';
import StoreSpotlightCard from '@/components/ui/store-spotlight-card';
import CategoryFilter from '@/components/layout/category-filter';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import {
  RECENTLY_ADDED,
  BOOKS_LISTINGS,
  ELECTRONICS_LISTINGS,
  HOUSING_LISTINGS,
  ROOM_ESSENTIALS_LISTINGS,
} from '@/data/mock-listings';
import { FEATURED_STORES, STORE_SPOTLIGHT } from '@/data/mock-stores';

const CATEGORY_SECTIONS = [
  { title: 'Books & Notes', listings: BOOKS_LISTINGS },
  { title: 'Electronics', listings: ELECTRONICS_LISTINGS },
  { title: 'Room Essentials', listings: ROOM_ESSENTIALS_LISTINGS },
  { title: 'Housing', listings: HOUSING_LISTINGS },
];

interface ListingSectionProps {
  title: string;
  icon?: string;
  listings: (typeof RECENTLY_ADDED)[number][];
  className: string;
  viewAllHref?: string;
  children?: React.ReactNode;
}

function ListingSection({
  title,
  icon,
  listings,
  className,
  viewAllHref,
  children,
}: ListingSectionProps) {
  return (
    <div className={className}>
      <Container className="py-14 sm:py-16">
        <section>
          <SectionHeader
            title={title}
            icon={icon}
            viewAllHref={viewAllHref}
          />
          {listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6 text-gray-400 dark:text-slate-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-600 dark:text-slate-400">
                No listings yet
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                Be the first to post in this category.
              </p>
            </div>
          )}
          {children}
        </section>
      </Container>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <CategoryFilter />

      <main>
        {/* Hero */}
        <LandingBanner
          title="The marketplace built for DIU students"
          subtitle="Buy and sell textbooks, electronics, housing, and campus essentials across the DIU campus."
          titleAs="h1"
        />

        <ListingSection
          title="Recently Added"
          listings={RECENTLY_ADDED}
          className="bg-white dark:bg-slate-950"
          viewAllHref="/listings/recent"
        />

        <div className="bg-gray-50 dark:bg-slate-900">
          <Container className="py-14 sm:py-16">
            <section>
              <SectionHeader
                title="Featured Stores"
                viewAllHref="/stores"
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {FEATURED_STORES.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                  />
                ))}
              </div>
            </section>
          </Container>
        </div>

        {CATEGORY_SECTIONS.map((section, index) => {
          const className =
            section.title === 'Housing'
              ? 'bg-[#f3f5ff] dark:bg-indigo-950/30'
              : index % 2 === 0
                ? 'bg-white dark:bg-slate-950'
                : 'bg-gray-50 dark:bg-slate-900';

          return (
            <ListingSection
              key={section.title}
              title={section.title}
              listings={section.listings}
              className={className}
              viewAllHref={`/listings/${section.title
                .toLowerCase()
                .replace(/\s*&\s*/g, '-')
                .replace(/\s+/g, '-')}`}
            >
              {section.title === 'Electronics' && STORE_SPOTLIGHT ? (
                <div className="mt-6 sm:mt-8">
                  <StoreSpotlightCard store={STORE_SPOTLIGHT} />
                </div>
              ) : null}
            </ListingSection>
          );
        })}

        {/* CTA section */}
        <LandingBanner
          title="Sell something you no longer need"
          subtitle="Post your item and connect with DIU students looking for it."
          buttonText="+ Post Now"
          titleAs="h2"
        />
      </main>

      <Footer />
    </div>
  );
}
