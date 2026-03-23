import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FavoritesService {
  async list(userId: string) {
    return prisma.favorite.findMany({
      where: {
        userId,
        listing: {
          status: {
            not: ListingStatus.ARCHIVED,
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

  async add(userId: string, listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found.');
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

  async remove(userId: string, listingId: string) {
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
}
