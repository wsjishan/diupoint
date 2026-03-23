import { AccountType, PrismaClient, VerificationStatus } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

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
    const email = dto.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const isDiuEmail = this.isDiuEmail(email);

    const createdUser = await prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
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

    const accessToken = await this.signAccessToken(
      createdUser.id,
      createdUser.email
    );

    return {
      accessToken,
      user: this.toSafeUser(createdUser),
    };
  }

  async signIn(dto: SignInDto) {
    const email = dto.email.trim().toLowerCase();

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

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = await this.signAccessToken(user.id, user.email);

    return {
      accessToken,
      user: this.toSafeUser(user),
    };
  }

  async me(userId: string) {
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
  }

  private async signAccessToken(userId: string, email: string) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
    });
  }

  private isDiuEmail(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
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
