import {
  apiRequest,
  apiRequestWithAuth,
  isApiRequestError,
  logPublicApiFallback,
} from '@/lib/api/http';
import type {
  ApiListingRatingsResponse,
  ApiRating,
} from '@/lib/api/types';

export async function fetchListingRatings(
  listingId: string
): Promise<ApiListingRatingsResponse> {
  try {
    return await apiRequest<ApiListingRatingsResponse>(
      `/listings/${listingId}/ratings`
    );
  } catch (error) {
    logPublicApiFallback(`fetchListingRatings(${listingId})`, error);
    return { ratings: [], average: null, count: 0 };
  }
}

export async function fetchMyRating(
  listingId: string
): Promise<ApiRating | null> {
  try {
    return await apiRequestWithAuth<ApiRating>(
      `/listings/${listingId}/ratings/me`
    );
  } catch (error) {
    if (isApiRequestError(error) && error.status === 404) {
      return null;
    }
    return null;
  }
}

export async function submitRating(
  listingId: string,
  value: number,
  comment?: string
): Promise<ApiRating> {
  return apiRequestWithAuth<ApiRating>(`/listings/${listingId}/ratings`, {
    method: 'PUT',
    body: { value, comment: comment || undefined },
  });
}
