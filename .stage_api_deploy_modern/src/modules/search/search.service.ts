import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ListingStatus } from '../../common/legacy-prisma-enums';

import { SearchQueryDto, SearchSort } from './dto/search-query.dto';

const prisma: any = new PrismaClient();

@Injectable()
export class SearchService {
  async search(query: SearchQueryDto) {
    const where: any = {
      status: ListingStatus.PUBLISHED,
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

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === SearchSort.PRICE_ASC) {
      orderBy = { price: 'asc' };
    }
    if (query.sort === SearchSort.PRICE_DESC) {
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
}
