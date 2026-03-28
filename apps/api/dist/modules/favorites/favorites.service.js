"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const legacy_prisma_enums_1 = require("../../common/legacy-prisma-enums");
const prisma = new client_1.PrismaClient();
let FavoritesService = class FavoritesService {
    async list(userId) {
        return prisma.favorite.findMany({
            where: {
                userId,
                listing: {
                    status: {
                        not: legacy_prisma_enums_1.ListingStatus.ARCHIVED,
                    },
                },
            },
            orderBy: {
                id: 'desc',
            },
            include: {
                listing: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' } },
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                accountType: true,
                                verificationStatus: true,
                            },
                        },
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
    async add(userId, listingId) {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found.');
        }
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_listingId: {
                    userId,
                    listingId,
                },
            },
            include: {
                listing: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' } },
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                accountType: true,
                                verificationStatus: true,
                            },
                        },
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
        if (existing) {
            return existing;
        }
        return prisma.favorite.create({
            data: {
                userId,
                listingId,
            },
            include: {
                listing: {
                    include: {
                        images: { orderBy: { sortOrder: 'asc' } },
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                accountType: true,
                                verificationStatus: true,
                            },
                        },
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
    async remove(userId, listingId) {
        await prisma.favorite.deleteMany({
            where: {
                userId,
                listingId,
            },
        });
        return {
            success: true,
            listingId,
        };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)()
], FavoritesService);
