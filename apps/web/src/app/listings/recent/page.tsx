'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Container from '@/components/ui/container';
import ListingCard from '@/components/ui/listing-card';
import { type Listing } from '@/data/mock-listings';
import { fetchListings } from '@/lib/api/listings';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import SectionHeader from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';

export default function RecentListingsPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    setPage(page);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      const { listings, total } = await fetchListings({ page, limit: 20 });

      if (cancelled || listings.length === 0) {
        return;
      }
      setListings(listings);
      setTotalPages(Math.ceil(total / 20));
    }

    void loadListings();

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <main>
        <Container className="py-8 sm:py-10">
          <section>
            <SectionHeader
              title="Recent Listings"
              subtitle="Browse all listings from students and stores"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>
          </section>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
