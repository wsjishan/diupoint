"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let CartService = class CartService {
    async getCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        const items = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
            orderBy: { createdAt: 'desc' },
            include: {
                listing: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' } },
                        storeProfile: {
                            select: {
                                id: true,
                                storeName: true,
                                slug: true,
                                logoUrl: true,
                                isFeatured: true,
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                accountType: true,
                                verificationStatus: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            id: cart.id,
            userId: cart.userId,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
            items,
            summary: {
                itemCount: items.length,
            },
        };
    }
    async addItem(userId, dto) {
        const cart = await this.getOrCreateCart(userId);
        const listing = await prisma.listing.findUnique({
            where: { id: dto.listingId },
            select: {
                id: true,
                sellerType: true,
                storeProfileId: true,
                status: true,
                price: true,
            },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found.');
        }
        if (listing.sellerType !== client_1.SellerType.STORE || !listing.storeProfileId) {
            throw new common_1.BadRequestException('Only STORE listings can be added to cart.');
        }
        if (listing.status !== client_1.ListingStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Only active listings can be added to cart.');
        }
        const existing = await prisma.cartItem.findUnique({
            where: {
                cartId_listingId: {
                    cartId: cart.id,
                    listingId: dto.listingId,
                },
            },
            select: {
                id: true,
                quantity: true,
            },
        });
        if (existing) {
            return prisma.cartItem.update({
                where: { id: existing.id },
                data: {
                    quantity: Math.min(99, existing.quantity + dto.quantity),
                },
                include: {
                    listing: {
                        include: {
                            images: { orderBy: { sortOrder: 'asc' } },
                            storeProfile: {
                                select: {
                                    id: true,
                                    storeName: true,
                                    slug: true,
                                    logoUrl: true,
                                    isFeatured: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        return prisma.cartItem.create({
            data: {
                cartId: cart.id,
                listingId: dto.listingId,
                quantity: dto.quantity,
                unitPrice: listing.price,
            },
            include: {
                listing: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' } },
                        storeProfile: {
                            select: {
                                id: true,
                                storeName: true,
                                slug: true,
                                logoUrl: true,
                                isFeatured: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async updateItem(userId, cartItemId, dto) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: {
                    select: {
                        id: true,
                        userId: true,
                    },
                },
            },
        });
        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new common_1.NotFoundException('Cart item not found.');
        }
        return prisma.cartItem.update({
            where: { id: cartItemId },
            data: {
                quantity: dto.quantity,
            },
            include: {
                listing: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' } },
                        storeProfile: {
                            select: {
                                id: true,
                                storeName: true,
                                slug: true,
                                logoUrl: true,
                                isFeatured: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async removeItem(userId, cartItemId) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new common_1.NotFoundException('Cart item not found.');
        }
        await prisma.cartItem.delete({
            where: { id: cartItemId },
        });
        return {
            success: true,
            cartItemId,
        };
    }
    async getOrCreateCart(userId) {
        const existingCart = await prisma.cart.findUnique({
            where: { userId },
        });
        if (existingCart) {
            return existingCart;
        }
        return prisma.cart.create({
            data: { userId },
        });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)()
], CartService);
