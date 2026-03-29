import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { markDeprecatedRoute } from '../../common/http/deprecation';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.createFromCart(req.user.sub, dto);
  }

  @Get()
  listMyOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.listMyOrders(req.user.sub);
  }

  @Get('me')
  listMyOrdersAlias(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    markDeprecatedRoute({
      canonicalPath: '/api/orders',
      logger: this.logger,
      req,
      res,
    });

    return this.ordersService.listMyOrders(req.user.sub);
  }
}

@Controller('stores/me/orders')
@UseGuards(JwtAuthGuard)
export class StoreOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  listStoreOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.listStoreOrders(req.user.sub);
  }
}
