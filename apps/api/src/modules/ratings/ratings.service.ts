import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreateRatingDto } from './dto/create-rating.dto';

const prisma: any = new PrismaClient();

@Injectable()
export class RatingsService {
  async getListingRatings(listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    const ratings = await prisma.rating.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    const count = ratings.length;
    const average =
      count > 0
        ? Math.round(
            (ratings.reduce(
              (sum: number, r: { value: number }) => sum + r.value,
              0
            ) /
              count) *
              10
          ) / 10
        : null;

    return { ratings, average, count };
  }

  async getUserRating(userId: string, listingId: string) {
    return prisma.rating.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });
  }

  async createOrUpdateRating(
    userId: string,
    listingId: string,
    dto: CreateRatingDto
  ) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
      update: {
        value: dto.value,
        comment: dto.comment ?? null,
      },
      create: {
        userId,
        listingId,
        value: dto.value,
        comment: dto.comment ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return rating;
  }
}
