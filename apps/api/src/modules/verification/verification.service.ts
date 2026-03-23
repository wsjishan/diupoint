import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PrismaClient,
  VerificationRequestStatus,
  VerificationStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';

const prisma = new PrismaClient();
const DIU_EMAIL_DOMAINS = ['@diu.edu.bd', '@s.diu.edu.bd'];
const OTP_EXPIRY_MINUTES = 10;

@Injectable()
export class VerificationService {
  async requestVerification(userId: string, dto: RequestVerificationDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        verificationStatus: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Account is already verified.');
    }

    const verificationEmail = dto.verificationEmail.trim().toLowerCase();
    this.assertDiuEmail(verificationEmail);

    const otp = this.generateOtp();
    const otpCodeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.$transaction([
      prisma.verificationRequest.updateMany({
        where: {
          userId,
          status: VerificationRequestStatus.PENDING,
        },
        data: {
          status: VerificationRequestStatus.CANCELLED,
        },
      }),
      prisma.verificationRequest.create({
        data: {
          userId,
          verificationEmail,
          otpCodeHash,
          expiresAt,
          status: VerificationRequestStatus.PENDING,
        },
      }),
    ]);

    // Stubbed for now: in production this OTP should be emailed.
    return {
      message: 'Verification OTP generated successfully.',
      verificationEmail,
      expiresAt,
      mockOtp: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async confirmVerification(userId: string, dto: ConfirmVerificationDto) {
    const verificationEmail = dto.verificationEmail.trim().toLowerCase();
    this.assertDiuEmail(verificationEmail);

    const now = new Date();

    const verificationRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId,
        verificationEmail,
        status: VerificationRequestStatus.PENDING,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationRequest) {
      throw new BadRequestException('No valid verification request found.');
    }

    const isOtpValid = await bcrypt.compare(
      dto.otp,
      verificationRequest.otpCodeHash
    );
    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP code.');
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: VerificationStatus.VERIFIED,
          verifiedAt: now,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          accountType: true,
          verificationStatus: true,
          verifiedAt: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: { status: VerificationRequestStatus.VERIFIED },
      }),
      prisma.verificationRequest.updateMany({
        where: {
          userId,
          verificationEmail,
          status: VerificationRequestStatus.PENDING,
          id: { not: verificationRequest.id },
        },
        data: {
          status: VerificationRequestStatus.CANCELLED,
        },
      }),
    ]);

    return {
      message: 'Account verification completed successfully.',
      user: updatedUser,
    };
  }

  private assertDiuEmail(email: string) {
    const isDiu = DIU_EMAIL_DOMAINS.some((domain) => email.endsWith(domain));
    if (!isDiu) {
      throw new BadRequestException(
        'Only DIU email addresses are allowed for verification.'
      );
    }
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
