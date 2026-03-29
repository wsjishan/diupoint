import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

type AuthenticatedRequest = {
  user: {
    sub: string;
    email: string;
  };
};

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.createFromCart(req.user.sub, dto);
  }

  @Get('orders/me')
  listMyOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.listMyOrders(req.user.sub);
  }

  @Get('stores/me/orders')
  listStoreOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.listStoreOrders(req.user.sub);
  }
}
