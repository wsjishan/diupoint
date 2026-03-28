"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
if (!process.env.DATABASE_URL && process.env.PROD_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.PROD_DATABASE_URL;
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.setGlobalPrefix('api');
    const configService = app.get(config_1.ConfigService);
    const port = Number(process.env.PORT ?? configService.get('PORT') ?? '4000');
    await app.listen(port, '0.0.0.0');
}
bootstrap();
