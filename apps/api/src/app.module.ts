import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';

import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { HealthModule } from './modules/health/health.module';
import { ListingsModule } from './modules/listings/listings.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { SearchModule } from './modules/search/search.module';
import { StoresModule } from './modules/stores/stores.module';
import { UsersModule } from './modules/users/users.module';
import { VerificationModule } from './modules/verification/verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // App Service should use portal/app settings; local dev can still use .env files.
      ignoreEnvFile: Boolean(process.env.WEBSITE_INSTANCE_ID),
      envFilePath: process.env.WEBSITE_INSTANCE_ID
        ? []
        : [
            resolve(process.cwd(), 'apps/api/.env'),
            resolve(process.cwd(), '.env'),
            resolve(__dirname, '../.env'),
          ],
      validate: validateEnv,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    StoresModule,
    ListingsModule,
    SearchModule,
    VerificationModule,
    FavoritesModule,
    CartModule,
    OrdersModule,
    RatingsModule,
  ],
})
export class AppModule {}
