import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async getMyListings(userId: string) {
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

  async getMyListingById(userId: string, listingId: string) {
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
      throw new NotFoundException('Listing not found.');
    }

    return listing;
  }
}
