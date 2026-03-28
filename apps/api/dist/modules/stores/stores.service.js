"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const legacy_prisma_enums_1 = require("../../common/legacy-prisma-enums");
const prisma = new client_1.PrismaClient();
let StoresService = class StoresService {
    async getPublicStore(slug) {
        const storeProfile = await prisma.storeProfile.findUnique({
            where: { slug },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        accountType: true,
                        verificationStatus: true,
                    },
                },
            },
        });
        if (!storeProfile) {
            throw new common_1.NotFoundException('Store not found.');
        }
        const listings = await prisma.listing.findMany({
            where: {
                storeProfileId: storeProfile.id,
                status: legacy_prisma_enums_1.ListingStatus.PUBLISHED,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
            },
        });
        return {
            store: {
                id: storeProfile.id,
                slug: storeProfile.slug,
                storeName: storeProfile.storeName,
                description: storeProfile.description,
                phone: storeProfile.phone,
                whatsapp: storeProfile.whatsapp,
                logoUrl: storeProfile.logoUrl,
                bannerUrl: storeProfile.bannerUrl,
                isFeatured: storeProfile.isFeatured,
                createdAt: storeProfile.createdAt,
                owner: storeProfile.user,
            },
            listings,
            summary: {
                listingCount: listings.length,
            },
        };
    }
    async getDashboard(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                accountType: true,
                storeProfile: {
                    select: {
                        id: true,
                        slug: true,
                        storeName: true,
                        description: true,
                        phone: true,
                        whatsapp: true,
                        logoUrl: true,
                        bannerUrl: true,
                        isFeatured: true,
                        createdAt: true,
                        updatedAt: true,
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
        const [productCount, orderCount, latestListings] = await Promise.all([
            prisma.listing.count({
                where: {
                    storeProfileId: user.storeProfile.id,
                    status: { not: legacy_prisma_enums_1.ListingStatus.ARCHIVED },
                },
            }),
            prisma.order.count({
                where: {
                    storeProfileId: user.storeProfile.id,
                },
            }),
            prisma.listing.findMany({
                where: { storeProfileId: user.storeProfile.id },
                orderBy: { createdAt: 'desc' },
                take: 8,
                include: {
                    images: { orderBy: { sortOrder: 'asc' } },
                },
            }),
        ]);
        return {
            storeProfile: user.storeProfile,
            productCount,
            orderCount,
            latestListings,
            summary: {
                latestListingCount: latestListings.length,
            },
        };
    }
    async updateMe(userId, dto) {
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
        return prisma.storeProfile.update({
            where: { id: user.storeProfile.id },
            data: {
                storeName: dto.storeName,
                description: dto.description,
                phone: dto.phone,
                whatsapp: dto.whatsapp,
                logoUrl: dto.logoUrl,
                bannerUrl: dto.bannerUrl,
            },
            select: {
                id: true,
                userId: true,
                storeName: true,
                slug: true,
                description: true,
                phone: true,
                whatsapp: true,
                logoUrl: true,
                bannerUrl: true,
                isFeatured: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)()
], StoresService);
