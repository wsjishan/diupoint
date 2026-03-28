"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const legacy_prisma_enums_1 = require("../../common/legacy-prisma-enums");
const list_listings_query_dto_1 = require("./dto/list-listings-query.dto");
const prisma = new client_1.PrismaClient();
let ListingsService = class ListingsService {
    async list(query) {
        const where = {
            status: { not: legacy_prisma_enums_1.ListingStatus.ARCHIVED },
        };
        if (query.q) {
            where.OR = [
                { title: { contains: query.q, mode: 'insensitive' } },
                { description: { contains: query.q, mode: 'insensitive' } },
            ];
        }
        if (query.category) {
            where.category = {
                equals: query.category,
                mode: 'insensitive',
            };
        }
        if (query.condition) {
            where.condition = query.condition;
        }
        let orderBy = { createdAt: 'desc' };
        if (query.sort === list_listings_query_dto_1.ListingSort.PRICE_ASC) {
            orderBy = { price: 'asc' };
        }
        if (query.sort === list_listings_query_dto_1.ListingSort.PRICE_DESC) {
            orderBy = { price: 'desc' };
        }
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                orderBy,
                skip,
                take: limit,
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
            }),
            prisma.listing.count({ where }),
        ]);
        return { listings, total };
    }
    async getBySlug(slug) {
        const listing = await prisma.listing.findUnique({
            where: { slug },
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
                        description: true,
                        logoUrl: true,
                        bannerUrl: true,
                        isFeatured: true,
                    },
                },
            },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found.');
        }
        return listing;
    }
    async create(userId, dto) {
        if (dto.sellerType === legacy_prisma_enums_1.SellerType.STORE && !dto.storeProfileId) {
            throw new common_1.BadRequestException('storeProfileId is required for STORE listings.');
        }
        if (dto.sellerType === legacy_prisma_enums_1.SellerType.PERSONAL && dto.storeProfileId) {
            throw new common_1.BadRequestException('storeProfileId must be omitted for PERSONAL listings.');
        }
        if (dto.storeProfileId) {
            const storeProfile = await prisma.storeProfile.findUnique({
                where: { id: dto.storeProfileId },
            });
            if (!storeProfile) {
                throw new common_1.NotFoundException('Store profile not found.');
            }
            if (storeProfile.userId !== userId) {
                throw new common_1.ForbiddenException('You can only create listings for your own store profile.');
            }
        }
        const listing = await prisma.listing.create({
            data: {
                userId,
                storeProfileId: dto.storeProfileId ?? null,
                sellerType: dto.sellerType,
                title: dto.title,
                slug: await this.createUniqueSlug(dto.title),
                description: dto.description,
                category: dto.category,
                condition: dto.condition,
                price: dto.price,
                location: dto.location,
                status: dto.status ?? legacy_prisma_enums_1.ListingStatus.DRAFT,
            },
            include: {
                images: true,
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
                    },
                },
            },
        });
        return listing;
    }
    async update(userId, id, dto) {
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found.');
        }
        if (listing.userId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own listings.');
        }
        const data = {
            title: dto.title,
            description: dto.description,
            category: dto.category,
            condition: dto.condition,
            price: dto.price,
            location: dto.location,
            status: dto.status,
        };
        if (dto.title && dto.title !== listing.title) {
            data.slug = await this.createUniqueSlug(dto.title, listing.id);
        }
        return prisma.listing.update({
            where: { id },
            data,
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
    async archive(userId, id) {
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found.');
        }
        if (listing.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own listings.');
        }
        return prisma.listing.update({
            where: { id },
            data: { status: legacy_prisma_enums_1.ListingStatus.ARCHIVED },
            select: {
                id: true,
                slug: true,
                status: true,
                updatedAt: true,
            },
        });
    }
    slugify(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    async createUniqueSlug(title, excludeId) {
        const base = this.slugify(title);
        if (!base) {
            throw new common_1.BadRequestException('Unable to create listing slug from title.');
        }
        let slug = base;
        let suffix = 1;
        while (true) {
            const existing = await prisma.listing.findFirst({
                where: {
                    slug,
                    ...(excludeId ? { id: { not: excludeId } } : {}),
                },
                select: { id: true },
            });
            if (!existing) {
                return slug;
            }
            suffix += 1;
            slug = `${base}-${suffix}`;
        }
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)()
], ListingsService);
