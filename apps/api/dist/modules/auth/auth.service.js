"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const client_2 = require("@prisma/client");
const jwt_1 = require("@nestjs/jwt");
const password_hasher_1 = require("./password-hasher");
const DIU_EMAIL_DOMAINS = ['@diu.edu.bd', '@s.diu.edu.bd'];
const prisma = new client_1.PrismaClient();
let AuthService = class AuthService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async signUp(dto) {
        return this.withAuthAvailability(async () => {
            const email = this.normalizeEmail(dto.email);
            const fullName = this.normalizeName(dto.fullName);
            if (!fullName) {
                throw new common_1.BadRequestException('Full name is required.');
            }
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new common_1.ConflictException('Email is already registered.');
            }
            const passwordHash = await (0, password_hasher_1.hashPassword)(dto.password);
            const isDiuEmail = this.isDiuEmail(email);
            const createdUser = await prisma.user.create({
                data: {
                    fullName,
                    email,
                    passwordHash,
                    accountType: dto.accountType,
                    verificationStatus: isDiuEmail
                        ? client_1.VerificationStatus.VERIFIED
                        : client_1.VerificationStatus.UNVERIFIED,
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
    async signIn(dto) {
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
                throw new common_1.UnauthorizedException('Invalid email or password.');
            }
            const isPasswordValid = await (0, password_hasher_1.comparePassword)(dto.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid email or password.');
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
    async me(userId) {
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
                throw new common_1.UnauthorizedException('Invalid access token.');
            }
            return this.toSafeUser(user);
        });
    }
    async signAccessToken(userId, email) {
        return this.jwtService.signAsync({
            sub: userId,
            email,
        });
    }
    async buildAuthSuccessResponse(userId, email, user) {
        const accessToken = await this.signAccessToken(userId, email);
        return {
            accessToken,
            user: this.toSafeUser(user),
        };
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    normalizeName(fullName) {
        return fullName.trim().replace(/\s+/g, ' ');
    }
    async withAuthAvailability(action) {
        try {
            return await action();
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error instanceof client_2.Prisma.PrismaClientInitializationError ||
                error instanceof client_2.Prisma.PrismaClientRustPanicError ||
                error instanceof client_2.Prisma.PrismaClientUnknownRequestError) {
                throw new common_1.ServiceUnavailableException('Authentication service is temporarily unavailable.');
            }
            throw error;
        }
    }
    isDiuEmail(email) {
        const normalizedEmail = this.normalizeEmail(email);
        return DIU_EMAIL_DOMAINS.some((domain) => normalizedEmail.endsWith(domain));
    }
    toSafeUser(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
