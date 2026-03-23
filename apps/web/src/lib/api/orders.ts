import { apiRequestWithAuth } from '@/lib/api/http';
import type {
  ApiCheckoutPaymentMethod,
  ApiCreateOrderResponse,
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
