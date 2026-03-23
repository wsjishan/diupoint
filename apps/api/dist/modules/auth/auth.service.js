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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const DIU_EMAIL_DOMAINS = ['@diu.edu.bd', '@s.diu.edu.bd'];
const prisma = new client_1.PrismaClient();
let AuthService = class AuthService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async signUp(dto) {
        const email = dto.email.trim().toLowerCase();
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email is already registered.');
        }
        const passwordHash = await bcrypt_1.default.hash(dto.password, 12);
        const isDiuEmail = this.isDiuEmail(email);
        const createdUser = await prisma.user.create({
            data: {
                fullName: dto.fullName.trim(),
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
        const accessToken = await this.signAccessToken(createdUser.id, createdUser.email);
        return {
            accessToken,
            user: this.toSafeUser(createdUser),
        };
    }
    async signIn(dto) {
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
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const isPasswordValid = await bcrypt_1.default.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const accessToken = await this.signAccessToken(user.id, user.email);
        return {
            accessToken,
            user: this.toSafeUser(user),
        };
    }
    async me(userId) {
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
    }
    async signAccessToken(userId, email) {
        return this.jwtService.signAsync({
            sub: userId,
            email,
        });
    }
    isDiuEmail(email) {
        const normalizedEmail = email.toLowerCase();
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
