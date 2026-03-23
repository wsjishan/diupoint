import { apiRequestWithAuth } from '@/lib/api/http';
import type { ApiFavorite } from '@/lib/api/types';

export async function fetchFavorites(): Promise<ApiFavorite[]> {
  return apiRequestWithAuth<ApiFavorite[]>('/favorites', {
    method: 'GET',
  });
}

export async function addFavorite(listingId: string): Promise<ApiFavorite> {
  return apiRequestWithAuth<ApiFavorite>(`/favorites/${listingId}`, {
    method: 'POST',
  });
}

export async function removeFavorite(listingId: string): Promise<void> {
  await apiRequestWithAuth(`/favorites/${listingId}`, {
    method: 'DELETE',
  });
}
