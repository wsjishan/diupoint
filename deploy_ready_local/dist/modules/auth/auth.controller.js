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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const sign_in_dto_1 = require("./dto/sign-in.dto");
const sign_up_dto_1 = require("./dto/sign-up.dto");
const google_auth_guard_1 = require("./guards/google-auth.guard");
const google_callback_auth_guard_1 = require("./guards/google-callback-auth.guard");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    googleAuthEntry(response, returnTo) {
        if (!this.authService.isGoogleOAuthConfigured()) {
            return response.redirect(this.authService.buildFrontendCallbackUrl({
                error: 'google_oauth_not_configured',
                returnTo,
            }));
        }
        const safeReturnTo = this.authService.sanitizeReturnTo(returnTo);
        return response.redirect(`/api/auth/google/start?returnTo=${encodeURIComponent(safeReturnTo)}`);
    }
    googleAuthStart() {
        return;
    }
    async googleAuthCallback(req, response) {
        try {
            if (!req.user) {
                return response.redirect(this.authService.buildFrontendCallbackUrl({
                    error: 'google_auth_failed',
                }));
            }
            const authResult = await this.authService.signInWithGoogle(req.user);
            return response.redirect(this.authService.buildFrontendCallbackUrl({
                token: authResult.accessToken,
                returnTo: req.user.returnTo,
            }));
        }
        catch {
            return response.redirect(this.authService.buildFrontendCallbackUrl({
                error: 'google_callback_failed',
                returnTo: req.user?.returnTo,
            }));
        }
    }
    signUp(dto) {
        return this.authService.signUp(dto);
    }
    signIn(dto) {
        return this.authService.signIn(dto);
    }
    me(req) {
        return this.authService.me(req.user.sub);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('google'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('returnTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleAuthEntry", null);
__decorate([
    (0, common_1.Get)('google/start'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleAuthStart", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_callback_auth_guard_1.GoogleCallbackAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthCallback", null);
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sign_up_dto_1.SignUpDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sign_in_dto_1.SignInDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
