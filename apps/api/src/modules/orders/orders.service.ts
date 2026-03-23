import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  OrderStatus,
  PaymentMethod,
  PrismaClient,
} from '@prisma/client';

import { CheckoutPaymentMethod, CreateOrderDto } from './dto/create-order.dto';

const prisma = new PrismaClient();

@Injectable()
export class OrdersService {
  async createFromCart(userId: string, dto: CreateOrderDto) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            listing: {
              select: {
                id: true,
                storeProfileId: true,
                sellerType: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    const storeGroups = new Map<
      string,
      {
        itemId: string;
        listingId: string;
        quantity: number;
        unitPrice: number;
      }[]
    >();

    for (const item of cart.items) {
      if (!item.listing.storeProfileId) {
        throw new BadRequestException(
          'Cart contains non-store listing, cannot create order.'
        );
      }

      const storeProfileId = item.listing.storeProfileId;
      if (!storeGroups.has(storeProfileId)) {
        storeGroups.set(storeProfileId, []);
      }

      storeGroups.get(storeProfileId)?.push({
        itemId: item.id,
        listingId: item.listingId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      });
    }

    const paymentMethod = this.mapPaymentMethod(dto.paymentMethod);

    const createdOrders = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const [storeProfileId, items] of storeGroups.entries()) {
        const subtotal = items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
        const total = subtotal;

        const order = await tx.order.create({
          data: {
            userId,
            storeProfileId,
            paymentMethod,
            status: OrderStatus.PENDING,
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2),
            items: {
              create: items.map((item) => ({
                listingId: item.listingId,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toFixed(2),
              })),
            },
          },
          include: {
            storeProfile: {
              select: {
                id: true,
                storeName: true,
                slug: true,
                logoUrl: true,
                isFeatured: true,
              },
            },
            items: {
              include: {
                listing: {
                  include: {
                    images: { orderBy: { sortOrder: 'asc' } },
                  },
                },
              },
            },
          },
        });

        orders.push(order);
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return orders;
    });

    return {
      message: 'Order created successfully.',
      orders: createdOrders,
      summary: {
        orderCount: createdOrders.length,
      },
    };
  }

  async listMyOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        storeProfile: {
          select: {
            id: true,
            storeName: true,
            slug: true,
            logoUrl: true,
            isFeatured: true,
          },
        },
        items: {
          include: {
            listing: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  async listStoreOrders(userId: string) {
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

    return prisma.order.findMany({
      where: {
        storeProfileId: user.storeProfile.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            verificationStatus: true,
          },
        },
        items: {
          include: {
            listing: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  private mapPaymentMethod(method: CheckoutPaymentMethod): PaymentMethod {
    if (method === CheckoutPaymentMethod.COD) {
      return PaymentMethod.CASH_ON_DELIVERY;
    }

    return PaymentMethod.ONLINE_PAYMENT;
  }
}
