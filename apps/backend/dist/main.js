"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const backend_module_1 = require("./backend.module");
const global_exception_filter_1 = require("./shared/filters/global-exception.filter");
const response_interceptor_1 = require("./shared/interceptors/response.interceptor");
const cors_config_1 = require("./shared/config/cors.config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(backend_module_1.BackendModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api/v1');
    app.enableCors((0, cors_config_1.createCorsConfig)(configService));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('KYC Attestation Platform API')
            .setDescription('API for KYC verification and blockchain attestations')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth', 'Authentication endpoints')
            .addTag('users', 'User management')
            .addTag('kyc', 'KYC verification')
            .addTag('attestations', 'Blockchain attestations')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    console.error('Error starting application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map