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
exports.GoogleCallbackAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
let GoogleCallbackAuthGuard = class GoogleCallbackAuthGuard extends (0, passport_1.AuthGuard)('google') {
    configService;
    constructor(configService) {
        super();
        this.configService = configService;
    }
    getAuthenticateOptions(_context) {
        const frontendUrl = this.configService.get('FRONTEND_URL')?.trim();
        const normalizedFrontendUrl = frontendUrl && frontendUrl.length > 0
            ? frontendUrl.replace(/\/$/, '')
            : 'http://localhost:3000';
        return {
            session: false,
            failureRedirect: `${normalizedFrontendUrl}/auth/callback?error=google_auth_failed`,
        };
    }
};
exports.GoogleCallbackAuthGuard = GoogleCallbackAuthGuard;
exports.GoogleCallbackAuthGuard = GoogleCallbackAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleCallbackAuthGuard);
