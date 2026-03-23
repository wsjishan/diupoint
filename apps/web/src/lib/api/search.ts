import { ALL_LISTINGS, type Listing } from '@/data/mock-listings';
import { mapApiListingToUi } from '@/lib/api/adapters';
import { apiRequest } from '@/lib/api/http';
import {
  filterAndSortMockListings,
  type ListingQuery,
} from '@/lib/api/listings';
import type { ApiListing } from '@/lib/api/types';

function mapSortForSearch(
  sort: ListingQuery['sort']
): 'price_asc' | 'price_desc' | undefined {
  if (sort === 'price-asc') return 'price_asc';
  if (sort === 'price-desc') return 'price_desc';
  return undefined;
}

export async function searchListings(
  query: ListingQuery = {}
): Promise<Listing[]> {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.category) params.set('category', query.category);
  if (query.condition) params.set('condition', query.condition.toUpperCase());

  const sort = mapSortForSearch(query.sort);
  if (sort) params.set('sort', sort);

  const path = `/search${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const listings = await apiRequest<ApiListing[]>(path);
    return listings.map(mapApiListingToUi);
  } catch {
    return filterAndSortMockListings(ALL_LISTINGS, query);
  }
}
