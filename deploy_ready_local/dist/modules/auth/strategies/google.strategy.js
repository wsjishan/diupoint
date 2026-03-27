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
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    constructor(configService) {
        const clientID = configService.get('GOOGLE_CLIENT_ID')?.trim();
        const clientSecret = configService
            .get('GOOGLE_CLIENT_SECRET')
            ?.trim();
        const callbackURL = configService
            .get('GOOGLE_CALLBACK_URL')
            ?.trim();
        super({
            clientID: clientID && clientID.length > 0 ? clientID : 'missing-client-id',
            clientSecret: clientSecret && clientSecret.length > 0
                ? clientSecret
                : 'missing-client-secret',
            callbackURL: callbackURL && callbackURL.length > 0
                ? callbackURL
                : 'http://localhost:4000/api/auth/google/callback',
            scope: ['email', 'profile'],
            passReqToCallback: true,
        });
    }
    validate(req, _accessToken, _refreshToken, profile) {
        const email = profile.emails?.[0]?.value?.trim().toLowerCase();
        if (!email) {
            throw new common_1.UnauthorizedException('Google account email is unavailable.');
        }
        const fullName = profile.displayName?.trim() ||
            [profile.name?.givenName, profile.name?.familyName]
                .filter((part) => Boolean(part && part.trim().length > 0))
                .join(' ')
                .trim() ||
            'Google User';
        const state = typeof req.query?.state === 'string' && req.query.state.startsWith('/')
            ? req.query.state
            : '/';
        return {
            email,
            fullName,
            returnTo: state,
        };
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleStrategy);
