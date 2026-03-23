import type { Listing } from '@/data/mock-listings';

export function buildMixedLatestFeed(listings: Listing[]): Listing[] {
  const personalListings = listings.filter(
    (listing) => listing.sellerType !== 'store'
  );
  const storeListings = listings.filter(
    (listing) => listing.sellerType === 'store'
  );

  const mixedFeed: Listing[] = [];

  for (
    let index = 0;
    index < Math.max(personalListings.length, storeListings.length);
    index += 1
  ) {
    if (personalListings[index]) {
      mixedFeed.push(personalListings[index]);
    }

    if (storeListings[index]) {
      mixedFeed.push(storeListings[index]);
    }
  }

  return mixedFeed;
}
