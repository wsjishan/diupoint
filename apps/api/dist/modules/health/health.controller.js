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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let HealthController = class HealthController {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async getHealth() {
        const databaseUrl = this.configService.get('DATABASE_URL');
        if (!databaseUrl) {
            throw new common_1.ServiceUnavailableException('DATABASE_URL is not configured.');
        }
        try {
            await prisma.$queryRaw `SELECT 1`;
            return {
                status: 'ok',
                app: 'up',
                env: 'loaded',
                database: 'up',
                timestamp: new Date().toISOString(),
            };
        }
        catch {
            throw new common_1.ServiceUnavailableException({
                status: 'error',
                app: 'up',
                env: 'loaded',
                database: 'down',
                message: 'Database connectivity check failed.',
            });
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HealthController);
