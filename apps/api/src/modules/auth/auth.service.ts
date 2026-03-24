import { AccountType, PrismaClient, VerificationStatus } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { comparePassword, hashPassword } from './password-hasher';

const DIU_EMAIL_DOMAINS = ['@diu.edu.bd', '@s.diu.edu.bd'];
const prisma = new PrismaClient();

type SafeUser = {
  id: string;
  fullName: string;
  email: string;
  accountType: AccountType;
  verificationStatus: VerificationStatus;
  verifiedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  storeProfile: {
    id: string;
    storeName: string;
    slug: string;
    isFeatured: boolean;
    logoUrl: string | null;
    bannerUrl: string | null;
  } | null;
};

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signUp(dto: SignUpDto) {
    return this.withAuthAvailability(async () => {
      const email = this.normalizeEmail(dto.email);
      const fullName = this.normalizeName(dto.fullName);

      if (!fullName) {
        throw new BadRequestException('Full name is required.');
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        throw new ConflictException('Email is already registered.');
      }

      const passwordHash = await hashPassword(dto.password);
      const isDiuEmail = this.isDiuEmail(email);

      const createdUser = await prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          accountType: dto.accountType,
          verificationStatus: isDiuEmail
            ? VerificationStatus.VERIFIED
            : VerificationStatus.UNVERIFIED,
          verifiedAt: isDiuEmail ? new Date() : null,
        },
        include: {
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

      return this.buildAuthSuccessResponse(createdUser.id, createdUser.email, {
        id: createdUser.id,
        fullName: createdUser.fullName,
        email: createdUser.email,
        accountType: createdUser.accountType,
        verificationStatus: createdUser.verificationStatus,
        verifiedAt: createdUser.verifiedAt,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
        storeProfile: createdUser.storeProfile,
      });
    });
  }

  async signIn(dto: SignInDto) {
    return this.withAuthAvailability(async () => {
      const email = this.normalizeEmail(dto.email);

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
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

      if (!user) {
        throw new UnauthorizedException('Invalid email or password.');
      }

      const isPasswordValid = await comparePassword(
        dto.password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password.');
      }

      return this.buildAuthSuccessResponse(user.id, user.email, {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        verificationStatus: user.verificationStatus,
        verifiedAt: user.verifiedAt,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        storeProfile: user.storeProfile,
      });
    });
  }

  async me(userId: string) {
    return this.withAuthAvailability(async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
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

      if (!user) {
        throw new UnauthorizedException('Invalid access token.');
      }

      return this.toSafeUser(user);
    });
  }

  private async signAccessToken(userId: string, email: string) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
    });
  }

  private async buildAuthSuccessResponse(
    userId: string,
    email: string,
    user: {
      id: string;
      fullName: string;
      email: string;
      accountType: AccountType;
      verificationStatus: VerificationStatus;
      verifiedAt: Date | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      storeProfile: {
        id: string;
        storeName: string;
        slug: string;
        isFeatured: boolean;
        logoUrl: string | null;
        bannerUrl: string | null;
      } | null;
    }
  ) {
    const accessToken = await this.signAccessToken(userId, email);

    return {
      accessToken,
      user: this.toSafeUser(user),
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeName(fullName: string): string {
    return fullName.trim().replace(/\s+/g, ' ');
  }

  private async withAuthAvailability<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientRustPanicError ||
        error instanceof Prisma.PrismaClientUnknownRequestError
      ) {
        throw new ServiceUnavailableException(
          'Authentication service is temporarily unavailable.'
        );
      }

      throw error;
    }
  }

  private isDiuEmail(email: string): boolean {
    const normalizedEmail = this.normalizeEmail(email);
    return DIU_EMAIL_DOMAINS.some((domain) => normalizedEmail.endsWith(domain));
  }

  private toSafeUser(user: {
    id: string;
    fullName: string;
    email: string;
    accountType: AccountType;
    verificationStatus: VerificationStatus;
    verifiedAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    storeProfile: {
      id: string;
      storeName: string;
      slug: string;
      isFeatured: boolean;
      logoUrl: string | null;
      bannerUrl: string | null;
    } | null;
  }): SafeUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      accountType: user.accountType,
      verificationStatus: user.verificationStatus,
      verifiedAt: user.verifiedAt,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      storeProfile: user.storeProfile
        ? {
            id: user.storeProfile.id,
            storeName: user.storeProfile.storeName,
            slug: user.storeProfile.slug,
            isFeatured: user.storeProfile.isFeatured,
            logoUrl: user.storeProfile.logoUrl,
            bannerUrl: user.storeProfile.bannerUrl,
          }
        : null,
    };
  }
}
