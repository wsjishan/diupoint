"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let UsersService = class UsersService {
    async getMyListings(userId) {
        return prisma.listing.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        accountType: true,
                        verificationStatus: true,
                    },
                },
                storeProfile: {
                    select: {
                        id: true,
                        storeName: true,
                        slug: true,
                        isFeatured: true,
                        logoUrl: true,
                        bannerUrl: true,
                    },
                },
            },
        });
    }
    async getMyListingById(userId, listingId) {
        const listing = await prisma.listing.findFirst({
            where: {
                id: listingId,
                userId,
            },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        accountType: true,
                        verificationStatus: true,
                    },
                },
                storeProfile: {
                    select: {
                        id: true,
                        storeName: true,
                        slug: true,
                        isFeatured: true,
                        logoUrl: true,
                        bannerUrl: true,
                    },
                },
            },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found.');
        }
        return listing;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
