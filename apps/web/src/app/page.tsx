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
  { title: 'Housing', listings: HOUSING_LISTINGS },
  { title: 'Room Essentials', listings: ROOM_ESSENTIALS_LISTINGS },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CategoryFilter />

      <main>
        {/* Intro header */}
        <div className="border-b border-gray-100 py-8 text-center">
          <span className="inline-flex items-center rounded-full border border-[#2F3FBF]/30 bg-[#2F3FBF]/5 px-3 py-1 text-xs font-medium text-[#2F3FBF]">
            Exclusive for DIU students
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            DIUPoint — Student Marketplace
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Buy and sell textbooks, electronics, housing, and campus essentials
            with fellow DIU students.
          </p>
        </div>

        {/* Listing sections */}
        <Container className="space-y-12 py-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <SectionHeader title={section.title} />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {section.listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                  />
                ))}
              </div>
            </section>
          ))}
        </Container>

        {/* CTA section */}
        <div className="bg-[#2F3FBF] py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Sell something you no longer need
            </h2>
            <p className="mt-2 text-sm text-blue-200">
              Post your item and connect with DIU students looking for it.
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-[#2F3FBF] transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F3FBF]">
                + Post Item
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
