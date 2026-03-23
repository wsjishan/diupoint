import {
  ALL_LISTINGS,
  getListingBySlug,
  type Listing,
} from '@/data/mock-listings';
import { mapApiListingToUi } from '@/lib/api/adapters';
import { apiRequest } from '@/lib/api/http';
import type { ApiListing } from '@/lib/api/types';

export type ListingSort = 'latest' | 'price-asc' | 'price-desc';

export interface ListingQuery {
  q?: string;
  category?: string;
  condition?: 'new' | 'used';
  sort?: ListingSort;
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
): Promise<Listing[]> {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.category) params.set('category', query.category);
  if (query.condition) params.set('condition', query.condition.toUpperCase());

  const sort = mapSortForListings(query.sort);
  if (sort) params.set('sort', sort);

  const path = `/listings${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const listings = await apiRequest<ApiListing[]>(path);
    return listings.map(mapApiListingToUi);
  } catch {
    return filterAndSortMockListings(ALL_LISTINGS, query);
  }
}

export async function fetchListingBySlug(
  slug: string
): Promise<Listing | null> {
  try {
    const listing = await apiRequest<ApiListing>(`/listings/${slug}`);
    return mapApiListingToUi(listing);
  } catch {
    return getListingBySlug(slug) ?? null;
  }
}
