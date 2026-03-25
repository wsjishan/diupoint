import { apiRequestWithAuth } from '@/lib/api/http';
import type {
  ApiCheckoutPaymentMethod,
  ApiCreateOrderResponse,
  ApiMyOrder,
} from '@/lib/api/types';

export interface CreateOrderPayload {
  paymentMethod: ApiCheckoutPaymentMethod;
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<ApiCreateOrderResponse> {
  return apiRequestWithAuth<ApiCreateOrderResponse>('/orders', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchMyOrders(): Promise<ApiMyOrder[]> {
  return apiRequestWithAuth<ApiMyOrder[]>('/orders/me', {
    method: 'GET',
  });
}
