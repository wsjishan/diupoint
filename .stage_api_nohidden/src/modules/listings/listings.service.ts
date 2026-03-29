import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  ListingCondition,
  ListingStatus,
  SellerType,
} from '../../common/legacy-prisma-enums';

import {
  ListListingsQueryDto,
  ListingSort,
} from './dto/list-listings-query.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

const prisma: any = new PrismaClient();

@Injectable()
export class ListingsService {
    async list(query: ListListingsQueryDto) {
      const where: any = {
        status: { not: ListingStatus.ARCHIVED },
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
        where.condition = query.condition as ListingCondition;
      }
  
      let orderBy: any = { createdAt: 'desc' };
  
      if (query.sort === ListingSort.PRICE_ASC) {
        orderBy = { price: 'asc' };
      }
  
      if (query.sort === ListingSort.PRICE_DESC) {
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
  async getBySlug(slug: string) {
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
      throw new NotFoundException('Listing not found.');
    }

    return listing;
  }

  async create(userId: string, dto: CreateListingDto) {
    if (dto.sellerType === SellerType.STORE && !dto.storeProfileId) {
      throw new BadRequestException(
        'storeProfileId is required for STORE listings.'
      );
    }

    if (dto.sellerType === SellerType.PERSONAL && dto.storeProfileId) {
      throw new BadRequestException(
        'storeProfileId must be omitted for PERSONAL listings.'
      );
    }

    if (dto.storeProfileId) {
      const storeProfile = await prisma.storeProfile.findUnique({
        where: { id: dto.storeProfileId },
      });

      if (!storeProfile) {
        throw new NotFoundException('Store profile not found.');
      }

      if (storeProfile.userId !== userId) {
        throw new ForbiddenException(
          'You can only create listings for your own store profile.'
        );
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
        status: dto.status ?? ListingStatus.DRAFT,
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

  async update(userId: string, id: string, dto: UpdateListingDto) {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only edit your own listings.');
    }

    const data: any = {
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

  async archive(userId: string, id: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only delete your own listings.');
    }

    return prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.ARCHIVED },
      select: {
        id: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async createUniqueSlug(
    title: string,
    excludeId?: string
  ): Promise<string> {
    const base = this.slugify(title);

    if (!base) {
      throw new BadRequestException(
        'Unable to create listing slug from title.'
      );
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
}
