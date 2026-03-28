"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const legacy_prisma_enums_1 = require("../../common/legacy-prisma-enums");
const create_order_dto_1 = require("./dto/create-order.dto");
const prisma = new client_1.PrismaClient();
let OrdersService = class OrdersService {
    async createFromCart(userId, dto) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        listing: {
                            select: {
                                id: true,
                                storeProfileId: true,
                                sellerType: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            throw new common_1.BadRequestException('Cart is empty.');
        }
        const storeGroups = new Map();
        for (const item of cart.items) {
            if (!item.listing.storeProfileId) {
                throw new common_1.BadRequestException('Cart contains non-store listing, cannot create order.');
            }
            const storeProfileId = item.listing.storeProfileId;
            if (!storeGroups.has(storeProfileId)) {
                storeGroups.set(storeProfileId, []);
            }
            storeGroups.get(storeProfileId)?.push({
                itemId: item.id,
                listingId: item.listingId,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
            });
        }
        const paymentMethod = this.mapPaymentMethod(dto.paymentMethod);
        const createdOrders = await prisma.$transaction(async (tx) => {
            const orders = [];
            for (const [storeProfileId, items] of storeGroups.entries()) {
                const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
                const total = subtotal;
                const order = await tx.order.create({
                    data: {
                        userId,
                        storeProfileId,
                        paymentMethod,
                        status: legacy_prisma_enums_1.OrderStatus.PENDING,
                        subtotal: subtotal.toFixed(2),
                        total: total.toFixed(2),
                        items: {
                            create: items.map((item) => ({
                                listingId: item.listingId,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice.toFixed(2),
                            })),
                        },
                    },
                    include: {
                        storeProfile: {
                            select: {
                                id: true,
                                storeName: true,
                                slug: true,
                                logoUrl: true,
                                isFeatured: true,
                            },
                        },
                        items: {
                            include: {
                                listing: {
                                    include: {
                                        images: { orderBy: { sortOrder: 'asc' } },
                                    },
                                },
                            },
                        },
                    },
                });
                orders.push(order);
            }
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return orders;
        });
        return {
            message: 'Order created successfully.',
            orders: createdOrders,
            summary: {
                orderCount: createdOrders.length,
            },
        };
    }
    async listMyOrders(userId) {
        return prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                storeProfile: {
                    select: {
                        id: true,
                        storeName: true,
                        slug: true,
                        logoUrl: true,
                        isFeatured: true,
                    },
                },
                items: {
                    include: {
                        listing: {
                            include: {
                                images: { orderBy: { sortOrder: 'asc' } },
                            },
                        },
                    },
                },
            },
        });
    }
    async listStoreOrders(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                accountType: true,
                storeProfile: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        if (user.accountType !== legacy_prisma_enums_1.AccountType.STORE) {
            throw new common_1.ForbiddenException('Only STORE accounts can access this endpoint.');
        }
        if (!user.storeProfile) {
            throw new common_1.NotFoundException('Store profile not found for this account.');
        }
        return prisma.order.findMany({
            where: {
                storeProfileId: user.storeProfile.id,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        verificationStatus: true,
                    },
                },
                items: {
                    include: {
                        listing: {
                            include: {
                                images: { orderBy: { sortOrder: 'asc' } },
                            },
                        },
                    },
                },
            },
        });
    }
    mapPaymentMethod(method) {
        if (method === create_order_dto_1.CheckoutPaymentMethod.COD) {
            return legacy_prisma_enums_1.PaymentMethod.CASH_ON_DELIVERY;
        }
        return legacy_prisma_enums_1.PaymentMethod.ONLINE_PAYMENT;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)()
], OrdersService);
