"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const search_query_dto_1 = require("./dto/search-query.dto");
const prisma = new client_1.PrismaClient();
let SearchService = class SearchService {
    async search(query) {
        const where = {
            status: client_1.ListingStatus.PUBLISHED,
        };
        if (query.q) {
            where.OR = [
                { title: { contains: query.q, mode: 'insensitive' } },
                { category: { contains: query.q, mode: 'insensitive' } },
                { location: { contains: query.q, mode: 'insensitive' } },
                { user: { fullName: { contains: query.q, mode: 'insensitive' } } },
                {
                    storeProfile: {
                        is: {
                            storeName: { contains: query.q, mode: 'insensitive' },
                        },
                    },
                },
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
        if (query.sort === search_query_dto_1.SearchSort.PRICE_ASC) {
            orderBy = { price: 'asc' };
        }
        if (query.sort === search_query_dto_1.SearchSort.PRICE_DESC) {
            orderBy = { price: 'desc' };
        }
        return prisma.listing.findMany({
            where,
            orderBy,
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
                        isFeatured: true,
                        logoUrl: true,
                    },
                },
            },
        });
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)()
], SearchService);
