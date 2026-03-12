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
  if (title === 'Housing') return 'bg-amber-50';
  return index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CategoryFilter />

      <main>
        {/* Hero */}
        <div className="border-b border-gray-100 bg-white py-10 text-center">
          <span className="inline-flex items-center rounded-full border border-[#2F3FBF]/20 bg-[#2F3FBF]/5 px-3.5 py-1 text-xs font-semibold tracking-wide text-[#2F3FBF]">
            Exclusive for DIU students
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            DIUPoint — Student Marketplace
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            Buy and sell textbooks, electronics, housing, and campus essentials
            with fellow DIU students.
          </p>
        </div>

        {/* Listing sections — each gets its own background band */}
        {SECTIONS.map((section, i) => (
          <div
            key={section.title}
            className={getSectionBg(section.title, i)}
          >
            <Container className="py-10">
              <section>
                <SectionHeader title={section.title} />
                {section.listings.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
                    {section.listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="h-6 w-6 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                        />
                      </svg>
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No listings yet
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Be the first to post in this category.
                    </p>
                  </div>
                )}
              </section>
            </Container>
          </div>
        ))}

        {/* CTA section */}
        <div className="bg-[#2F3FBF] py-12">
          <div className="mx-auto max-w-lg px-4 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Sell something you no longer need
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-blue-200">
              Post your item and connect with DIU students looking for it.
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-7 py-2.5 text-sm font-semibold text-[#2F3FBF] shadow-lg shadow-black/10 transition-all duration-150 hover:bg-blue-50 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F3FBF]">
                <span className="text-base leading-none">+</span>
                Post Item
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
