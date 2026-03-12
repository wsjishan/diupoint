import Container from '@/components/ui/container';
import SectionHeader from '@/components/ui/section-header';
import ListingCard from '@/components/ui/listing-card';
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

const SECTIONS = [
  { title: 'Recently Added', listings: RECENTLY_ADDED },
  { title: 'Books & Notes', listings: BOOKS_LISTINGS },
  { title: 'Electronics', listings: ELECTRONICS_LISTINGS },
  { title: 'Room Essentials', listings: ROOM_ESSENTIALS_LISTINGS },
  { title: 'Housing', listings: HOUSING_LISTINGS },
];

function getSectionBg(title: string, index: number): string {
  if (title === 'Housing') return 'bg-[#f3f5ff] dark:bg-indigo-950/30';
  return index % 2 === 0
    ? 'bg-white dark:bg-slate-950'
    : 'bg-gray-50 dark:bg-slate-900';
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <CategoryFilter />

      <main>
        {/* Hero */}
        <div className="relative border-b border-gray-100 dark:border-slate-800 py-10 text-center overflow-hidden">
          {/* Light mode: background image */}
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat dark:hidden"
            style={{
              backgroundImage: "url('/images/hero/hero-bg-marketplace.png')",
            }}
            aria-hidden="true"
          />
          {/* Light mode: soft white overlay */}
          <div
            className="absolute inset-0 bg-white/65 dark:hidden"
            aria-hidden="true"
          />
          {/* Dark mode: gradient background */}
          <div
            className="absolute inset-0 hidden dark:block bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(79,70,229,0.18),transparent)]" />
          </div>
          <div className="relative">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-3xl lg:text-4xl">
              The marketplace built for DIU students
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-slate-400">
              Buy and sell textbooks, electronics, housing, and campus
              essentials across the DIU campus.
            </p>
          </div>
        </div>

        {/* Listing sections — each gets its own background band */}
        {SECTIONS.map((section, i) => (
          <div
            key={section.title}
            className={getSectionBg(section.title, i)}
          >
            <Container className="py-12">
              <section>
                <SectionHeader title={section.title} />
                {section.listings.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-4">
                    {section.listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-14 text-center">
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
              </section>
            </Container>
          </div>
        ))}

        {/* CTA section */}
        <div className="border-t border-white/5 bg-linear-to-r from-[#1d255f] via-[#2a2f7c] to-[#1d255f] py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Sell something you no longer need
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Post your item and connect with DIU students looking for it.
            </p>
            <div className="mt-8">
              <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-7 py-2.5 text-sm font-semibold text-[#2F3FBF] shadow-md transition-all duration-200 hover:-translate-y-[1px] hover:bg-white/95 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d255f]">
                <span className="text-base leading-none">+</span>
                Post Now
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
