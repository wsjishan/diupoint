import { apiRequestWithAuth } from '@/lib/api/http';
import type { ApiCartItem, ApiCartResponse } from '@/lib/api/types';

export interface AddCartItemPayload {
  listingId: string;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export async function fetchCart(): Promise<ApiCartResponse> {
  return apiRequestWithAuth<ApiCartResponse>('/cart', {
    method: 'GET',
  });
}

export async function addCartItem(
  payload: AddCartItemPayload
): Promise<ApiCartItem> {
  return apiRequestWithAuth<ApiCartItem>('/cart/items', {
    method: 'POST',
    body: payload,
  });
}

export async function updateCartItem(
  itemId: string,
  payload: UpdateCartItemPayload
): Promise<ApiCartItem> {
  return apiRequestWithAuth<ApiCartItem>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function removeCartItem(itemId: string): Promise<void> {
  await apiRequestWithAuth(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}
