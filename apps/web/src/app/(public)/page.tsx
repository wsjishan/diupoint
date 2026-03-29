import {
  ALL_LISTINGS,
  LATEST_FROM_STORES,
  type Listing,
} from '@/data/mock-listings';
import { buildMixedLatestFeed } from '@/lib/api/home';
import { fetchListings } from '@/lib/api/listings';

import HomePageClient from './home-page-client';

interface HomePageInitialData {
  latestListingsFeed: Listing[];
  freshFromStores: Listing[];
}

function getFallbackHomeData(): HomePageInitialData {
  return {
    latestListingsFeed: buildMixedLatestFeed(ALL_LISTINGS).slice(0, 18),
    freshFromStores: LATEST_FROM_STORES.slice(0, 8),
  };
}

async function getInitialHomeData(): Promise<HomePageInitialData> {
  const fallback = getFallbackHomeData();

  try {
    const { listings } = await fetchListings();

    if (listings.length === 0) {
      return fallback;
    }

    return {
      latestListingsFeed: buildMixedLatestFeed(listings).slice(0, 18),
      freshFromStores: listings
        .filter((listing) => listing.sellerType === 'store')
        .slice(0, 8),
    };
  } catch (error) {
    const isProductionBuild =
      process.env.NEXT_PHASE === 'phase-production-build';

    if (process.env.NODE_ENV !== 'production' || isProductionBuild) {
      return fallback;
    }

    throw error;
  }
}

export default async function HomePage() {
  const initialData = await getInitialHomeData();

  return (
    <HomePageClient
      initialLatestListingsFeed={initialData.latestListingsFeed}
      initialFreshFromStores={initialData.freshFromStores}
    />
  );
}
