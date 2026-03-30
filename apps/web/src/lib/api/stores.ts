import { ALL_LISTINGS, type Listing } from '@/data/mock-listings';
import { getStoreBySlug, type Store } from '@/data/mock-stores';
import { mapApiStoreToUi } from '@/lib/api/adapters';
import {
  apiRequest,
  apiRequestWithAuth,
  isApiRequestError,
  logPublicApiFallback,
} from '@/lib/api/http';
import type {
  ApiStoreDashboardResponse,
  ApiStoreProfile,
  ApiStorePublicResponse,
} from '@/lib/api/types';

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

    logPublicApiFallback(`fetchStoreBySlug(${slug})`, error);

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

export interface UpdateMyStorePayload {
  bannerUrl?: string;
}

export async function fetchMyStoreDashboard(): Promise<ApiStoreDashboardResponse> {
  return apiRequestWithAuth<ApiStoreDashboardResponse>('/stores/me/dashboard', {
    method: 'GET',
  });
}

export async function updateMyStore(
  payload: UpdateMyStorePayload
): Promise<ApiStoreProfile> {
  return apiRequestWithAuth<ApiStoreProfile>('/stores/me', {
    method: 'PATCH',
    body: payload,
  });
}
