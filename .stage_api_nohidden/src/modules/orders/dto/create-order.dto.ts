import { IsEnum } from 'class-validator';

export enum CheckoutPaymentMethod {
  COD = 'COD',
  BKASH = 'BKASH',
}

export class CreateOrderDto {
  @IsEnum(CheckoutPaymentMethod)
  paymentMethod!: CheckoutPaymentMethod;
}
