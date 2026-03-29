import { ALL_LISTINGS, type Listing } from '@/data/mock-listings';
import { getStoreBySlug, type Store } from '@/data/mock-stores';
import { mapApiStoreToUi } from '@/lib/api/adapters';
import { apiRequest, isApiRequestError } from '@/lib/api/http';
import type { ApiStorePublicResponse } from '@/lib/api/types';

export async function fetchStoreBySlug(
  slug: string
): Promise<{ store: Store; listings: Listing[] } | null> {
  try {
    const payload = await apiRequest<ApiStorePublicResponse>(`/stores/${slug}`);
    return mapApiStoreToUi(payload);
  } catch (error) {
    if (isApiRequestError(error) && error.status === 404) {
      return null;
    }

    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    const fallbackStore = getStoreBySlug(slug);
    if (!fallbackStore) return null;

    const fallbackListings = ALL_LISTINGS.filter(
      (listing) => listing.sellerType === 'store' && listing.storeSlug === slug
    );

    return {
      store: fallbackStore,
      listings: fallbackListings,
    };
  }
}
