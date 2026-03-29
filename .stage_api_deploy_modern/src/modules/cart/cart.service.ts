import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ListingStatus, SellerType } from '../../common/legacy-prisma-enums';

import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const prisma: any = new PrismaClient();

@Injectable()
export class CartService {
  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            storeProfile: {
              select: {
                id: true,
                storeName: true,
                slug: true,
                logoUrl: true,
                isFeatured: true,
              },
            },
            user: {
              select: {
                id: true,
                fullName: true,
                accountType: true,
                verificationStatus: true,
              },
            },
          },
        },
      },
    });

    return {
      id: cart.id,
      userId: cart.userId,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items,
      summary: {
        itemCount: items.length,
      },
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const listing = await prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: {
        id: true,
        sellerType: true,
        storeProfileId: true,
        status: true,
        price: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    if (listing.sellerType !== SellerType.STORE || !listing.storeProfileId) {
      throw new BadRequestException(
        'Only STORE listings can be added to cart.'
      );
    }

    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new BadRequestException(
        'Only active listings can be added to cart.'
      );
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_listingId: {
          cartId: cart.id,
          listingId: dto.listingId,
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: Math.min(99, existing.quantity + dto.quantity),
        },
        include: {
          listing: {
            include: {
              images: { orderBy: { sortOrder: 'asc' } },
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

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        listingId: dto.listingId,
        quantity: dto.quantity,
        unitPrice: listing.price,
      },
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
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

  async updateItem(userId: string, cartItemId: string, dto: UpdateCartItemDto) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found.');
    }

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: dto.quantity,
      },
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
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

  async removeItem(userId: string, cartItemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found.');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return {
      success: true,
      cartItemId,
    };
  }

  private async getOrCreateCart(userId: string) {
    const existingCart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (existingCart) {
      return existingCart;
    }

    return prisma.cart.create({
      data: { userId },
    });
  }
}
