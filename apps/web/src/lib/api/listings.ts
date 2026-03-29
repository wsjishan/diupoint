import {
  ALL_LISTINGS,
  getListingBySlug,
  type Listing,
} from '@/data/mock-listings';
import { mapApiListingToUi } from '@/lib/api/adapters';
import {
  apiRequest,
  apiRequestWithAuth,
  isApiRequestError,
} from '@/lib/api/http';
import type {
  ApiListing,
  ApiListingCondition,
  ApiListingStatus,
  ApiSellerType,
} from '@/lib/api/types';

export type ListingSort = 'latest' | 'price-asc' | 'price-desc';

export interface ListingQuery {
  q?: string;
  category?: string;
  condition?: 'new' | 'used';
  seller?: 'store' | 'personal';
  sort?: ListingSort;
  page?: number;
  limit?: number;
}

export interface CreateListingPayload {
  sellerType: ApiSellerType;
  storeProfileId?: string;
  title: string;
  description: string;
  category: string;
  condition: ApiListingCondition;
  price: number;
  location: string;
  status?: ApiListingStatus;
}

export interface UpdateListingPayload {
  title?: string;
  description?: string;
  category?: string;
  condition?: ApiListingCondition;
  price?: number;
  location?: string;
  status?: ApiListingStatus;
}

function mapSortForListings(
  sort: ListingSort | undefined
): 'price_asc' | 'price_desc' | undefined {
  if (sort === 'price-asc') return 'price_asc';
  if (sort === 'price-desc') return 'price_desc';
  return undefined;
}

export function filterAndSortMockListings(
  listings: Listing[],
  query: ListingQuery
): Listing[] {
  const normalizedQuery = query.q?.trim().toLowerCase() || '';

  let filtered = listings;

  if (normalizedQuery) {
    filtered = filtered.filter((listing) => {
      const haystack = [
        listing.title,
        listing.category,
        listing.location,
        listing.seller,
        listing.storeLabel || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }

  if (query.category) {
    filtered = filtered.filter(
      (listing) => listing.category === query.category
    );
  }

  if (query.condition) {
    filtered = filtered.filter(
      (listing) => listing.condition === query.condition
    );
  }

  if (query.seller) {
    filtered = filtered.filter((listing) => {
      const sellerType =
        listing.sellerType ?? (listing.storeSlug ? 'store' : 'personal');
      return sellerType === query.seller;
    });
  }

  return [...filtered].sort((left, right) => {
    if (query.sort === 'price-asc') {
      return left.price - right.price;
    }

    if (query.sort === 'price-desc') {
      return right.price - left.price;
    }

    const leftTime = left.postedAt ? Date.parse(left.postedAt) : 0;
    const rightTime = right.postedAt ? Date.parse(right.postedAt) : 0;
    return rightTime - leftTime;
  });
}

export async function fetchListings(
  query: ListingQuery = {}
): Promise<{ listings: Listing[]; total: number }> {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.category) params.set('category', query.category);
  if (query.condition) params.set('condition', query.condition.toUpperCase());
  if (query.seller) params.set('seller', query.seller.toUpperCase());
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));

  const sort = mapSortForListings(query.sort);
  if (sort) params.set('sort', sort);

  const path = `/listings${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const result = await apiRequest<{ listings: ApiListing[]; total: number }>(
      path
    );
    return {
      listings: result.listings.map(mapApiListingToUi),
      total: result.total,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    const mockListings = filterAndSortMockListings(ALL_LISTINGS, query);
    const { page = 1, limit = 20 } = query;
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      listings: mockListings.slice(start, end),
      total: mockListings.length,
    };
  }
}

export async function fetchListingBySlug(
  slug: string
): Promise<Listing | null> {
  try {
    const listing = await apiRequest<ApiListing>(`/listings/${slug}`);
    return mapApiListingToUi(listing);
  } catch (error) {
    if (isApiRequestError(error) && error.status === 404) {
      return null;
    }

    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    return getListingBySlug(slug) ?? null;
  }
}

export async function createListing(
  payload: CreateListingPayload
): Promise<ApiListing> {
  return apiRequestWithAuth<ApiListing>('/listings', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchMyListings(): Promise<ApiListing[]> {
  return apiRequestWithAuth<ApiListing[]>('/users/me/listings', {
    method: 'GET',
  });
}

export async function fetchMyListingById(id: string): Promise<ApiListing> {
  return apiRequestWithAuth<ApiListing>(`/users/me/listings/${id}`, {
    method: 'GET',
  });
}

export async function updateListing(
  listingId: string,
  payload: UpdateListingPayload
): Promise<ApiListing> {
  return apiRequestWithAuth<ApiListing>(`/listings/${listingId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function markListingSold(listingId: string): Promise<ApiListing> {
  return updateListing(listingId, { status: 'SOLD' });
}

export async function archiveListing(listingId: string): Promise<void> {
  await apiRequestWithAuth(`/listings/${listingId}`, {
    method: 'DELETE',
  });
}
