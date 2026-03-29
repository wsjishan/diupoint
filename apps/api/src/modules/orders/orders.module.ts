import { Module } from '@nestjs/common';

import { OrdersController, StoreOrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController, StoreOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
