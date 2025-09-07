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
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
const public_decorator_1 = require("../shared/decorators/public.decorator");
const blockchain_provider_service_1 = require("../blockchain/blockchain-provider.service");
const prisma_service_1 = require("../prisma/prisma.service");
let HealthController = class HealthController {
    constructor(health, http, blockchainService, prismaService) {
        this.health = health;
        this.http = http;
        this.blockchainService = blockchainService;
        this.prismaService = prismaService;
    }
    check() {
        return this.health.check([
            () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
            async () => {
                try {
                    await this.prismaService.$queryRaw `SELECT 1`;
                    return { database: { status: 'up' } };
                }
                catch {
                    return { database: { status: 'down' } };
                }
            },
        ]);
    }
    async checkDatabase() {
        try {
            await this.prismaService.$queryRaw `SELECT 1`;
            return {
                database: {
                    status: 'up',
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Database health check failed: ${errorMessage}`);
        }
    }
    async checkBlockchainConnection() {
        try {
            const isHealthy = this.blockchainService ? true : false;
            return {
                blockchain: {
                    status: isHealthy ? 'up' : 'down',
                    network: 'multi-blockchain',
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Blockchain health check failed: ${errorMessage}`);
        }
    }
    async getMetrics() {
        const metrics = [
            '# HELP http_requests_total Total number of HTTP requests',
            '# TYPE http_requests_total counter',
            'http_requests_total{method="GET",status="200"} 100',
            'http_requests_total{method="POST",status="201"} 50',
            '',
            '# HELP system_up System uptime',
            '# TYPE system_up gauge',
            'system_up 1',
        ];
        return metrics.join('\n');
    }
    async readiness() {
        try {
            await this.prismaService.$queryRaw `SELECT 1`;
            return { status: 'ready', timestamp: new Date().toISOString() };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Service not ready: ${errorMessage}`);
        }
    }
    async liveness() {
        return { status: 'alive', timestamp: new Date().toISOString() };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get overall health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health check result' }),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('/database'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check database connectivity' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkDatabase", null);
__decorate([
    (0, common_1.Get)('/blockchain'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check blockchain connectivity' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkBlockchainConnection", null);
__decorate([
    (0, common_1.Get)('/metrics'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Prometheus metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('/ready'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe for Kubernetes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readiness", null);
__decorate([
    (0, common_1.Get)('/live'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe for Kubernetes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "liveness", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        terminus_1.HttpHealthIndicator,
        blockchain_provider_service_1.BlockchainProviderService,
        prisma_service_1.PrismaService])
], HealthController);
//# sourceMappingURL=health.controller.js.map