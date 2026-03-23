import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountType, ListingStatus, PrismaClient } from '@prisma/client';

import { UpdateStoreDto } from './dto/update-store.dto';

const prisma = new PrismaClient();

@Injectable()
export class StoresService {
  async getPublicStore(slug: string) {
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
      throw new NotFoundException('Store not found.');
    }

    const listings = await prisma.listing.findMany({
      where: {
        storeProfileId: storeProfile.id,
        status: ListingStatus.PUBLISHED,
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

  async getDashboard(userId: string) {
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
      throw new NotFoundException('User not found.');
    }

    if (user.accountType !== AccountType.STORE) {
      throw new ForbiddenException(
        'Only STORE accounts can access this endpoint.'
      );
    }

    if (!user.storeProfile) {
      throw new NotFoundException('Store profile not found for this account.');
    }

    const [productCount, orderCount, latestListings] = await Promise.all([
      prisma.listing.count({
        where: {
          storeProfileId: user.storeProfile.id,
          status: { not: ListingStatus.ARCHIVED },
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

  async updateMe(userId: string, dto: UpdateStoreDto) {
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
      throw new NotFoundException('User not found.');
    }

    if (user.accountType !== AccountType.STORE) {
      throw new ForbiddenException(
        'Only STORE accounts can access this endpoint.'
      );
    }

    if (!user.storeProfile) {
      throw new NotFoundException('Store profile not found for this account.');
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
}
