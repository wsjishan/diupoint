"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const DIU_EMAIL_DOMAINS = ['@diu.edu.bd', '@s.diu.edu.bd'];
const OTP_EXPIRY_MINUTES = 10;
let VerificationService = class VerificationService {
    async requestVerification(userId, dto) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                verificationStatus: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        if (user.verificationStatus === client_1.VerificationStatus.VERIFIED) {
            throw new common_1.BadRequestException('Account is already verified.');
        }
        const verificationEmail = dto.verificationEmail.trim().toLowerCase();
        this.assertDiuEmail(verificationEmail);
        const otp = this.generateOtp();
        const otpCodeHash = await bcrypt_1.default.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await prisma.$transaction([
            prisma.verificationRequest.updateMany({
                where: {
                    userId,
                    status: client_1.VerificationRequestStatus.PENDING,
                },
                data: {
                    status: client_1.VerificationRequestStatus.CANCELLED,
                },
            }),
            prisma.verificationRequest.create({
                data: {
                    userId,
                    verificationEmail,
                    otpCodeHash,
                    expiresAt,
                    status: client_1.VerificationRequestStatus.PENDING,
                },
            }),
        ]);
        return {
            message: 'Verification OTP generated successfully.',
            verificationEmail,
            expiresAt,
            mockOtp: process.env.NODE_ENV === 'production' ? undefined : otp,
        };
    }
    async confirmVerification(userId, dto) {
        const verificationEmail = dto.verificationEmail.trim().toLowerCase();
        this.assertDiuEmail(verificationEmail);
        const now = new Date();
        const verificationRequest = await prisma.verificationRequest.findFirst({
            where: {
                userId,
                verificationEmail,
                status: client_1.VerificationRequestStatus.PENDING,
                expiresAt: {
                    gt: now,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!verificationRequest) {
            throw new common_1.BadRequestException('No valid verification request found.');
        }
        const isOtpValid = await bcrypt_1.default.compare(dto.otp, verificationRequest.otpCodeHash);
        if (!isOtpValid) {
            throw new common_1.BadRequestException('Invalid OTP code.');
        }
        const [updatedUser] = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    verificationStatus: client_1.VerificationStatus.VERIFIED,
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
                data: { status: client_1.VerificationRequestStatus.VERIFIED },
            }),
            prisma.verificationRequest.updateMany({
                where: {
                    userId,
                    verificationEmail,
                    status: client_1.VerificationRequestStatus.PENDING,
                    id: { not: verificationRequest.id },
                },
                data: {
                    status: client_1.VerificationRequestStatus.CANCELLED,
                },
            }),
        ]);
        return {
            message: 'Account verification completed successfully.',
            user: updatedUser,
        };
    }
    assertDiuEmail(email) {
        const isDiu = DIU_EMAIL_DOMAINS.some((domain) => email.endsWith(domain));
        if (!isDiu) {
            throw new common_1.BadRequestException('Only DIU email addresses are allowed for verification.');
        }
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = __decorate([
    (0, common_1.Injectable)()
], VerificationService);
