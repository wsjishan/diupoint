"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_path_1 = require("node:path");
const env_validation_1 = require("./config/env.validation");
const auth_module_1 = require("./modules/auth/auth.module");
const cart_module_1 = require("./modules/cart/cart.module");
const favorites_module_1 = require("./modules/favorites/favorites.module");
const listings_module_1 = require("./modules/listings/listings.module");
const orders_module_1 = require("./modules/orders/orders.module");
const search_module_1 = require("./modules/search/search.module");
const stores_module_1 = require("./modules/stores/stores.module");
const users_module_1 = require("./modules/users/users.module");
const verification_module_1 = require("./modules/verification/verification.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                envFilePath: [
                    (0, node_path_1.resolve)(process.cwd(), 'apps/api/.env'),
                    (0, node_path_1.resolve)(process.cwd(), '.env'),
                    (0, node_path_1.resolve)(__dirname, '../.env'),
                ],
                validate: env_validation_1.validateEnv,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            stores_module_1.StoresModule,
            listings_module_1.ListingsModule,
            search_module_1.SearchModule,
            verification_module_1.VerificationModule,
            favorites_module_1.FavoritesModule,
            cart_module_1.CartModule,
            orders_module_1.OrdersModule,
        ],
    })
], AppModule);
