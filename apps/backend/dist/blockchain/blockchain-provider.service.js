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
var BlockchainProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainProviderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const blockchain_provider_interface_1 = require("./interfaces/blockchain-provider.interface");
const blockchain_provider_factory_1 = require("./blockchain-provider.factory");
let BlockchainProviderService = BlockchainProviderService_1 = class BlockchainProviderService {
    constructor(providerFactory, configService) {
        this.providerFactory = providerFactory;
        this.configService = configService;
        this.logger = new common_1.Logger(BlockchainProviderService_1.name);
        this.healthStatus = new Map();
        this.metrics = new Map();
        this.healthCheckInterval = null;
        this.primaryProvider = {
            type: this.configService.get('PRIMARY_BLOCKCHAIN_PROVIDER', blockchain_provider_interface_1.BlockchainProviderType.HYPERLEDGER_FABRIC),
            network: this.configService.get('PRIMARY_BLOCKCHAIN_NETWORK', 'kycchannel'),
        };
    }
    async onModuleInit() {
        this.logger.log('Initializing Blockchain Provider Service');
        const healthCheckIntervalMs = this.configService.get('BLOCKCHAIN_HEALTH_CHECK_INTERVAL', 60000);
        this.healthCheckInterval = setInterval(() => this.performHealthChecks(), healthCheckIntervalMs);
        await this.performHealthChecks();
        this.logger.log('Blockchain Provider Service initialized');
    }
    async onModuleDestroy() {
        this.logger.log('Shutting down Blockchain Provider Service');
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        await this.providerFactory.clearCache();
        this.logger.log('Blockchain Provider Service shutdown complete');
    }
    async getPrimaryProvider() {
        try {
            const provider = await this.providerFactory.getProvider(this.primaryProvider.type, this.primaryProvider.network);
            await this.recordProviderMetric(provider, 'getPrimaryProvider', true, 0);
            return provider;
        }
        catch (error) {
            await this.recordProviderMetric(null, 'getPrimaryProvider', false, 0);
            throw error;
        }
    }
    async getProvider(providerType, networkName) {
        try {
            const provider = await this.providerFactory.getProvider(providerType, networkName);
            await this.recordProviderMetric(provider, 'getProvider', true, 0);
            return provider;
        }
        catch (error) {
            await this.recordProviderMetric(null, 'getProvider', false, 0);
            throw error;
        }
    }
    async createAttestation(request) {
        const startTime = Date.now();
        try {
            const provider = await this.getPrimaryProvider();
            const result = await provider.createAttestation(request);
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(provider, 'createAttestation', result.success, responseTime);
            this.logger.log(`Attestation creation ${result.success ? 'succeeded' : 'failed'} for ID: ${request.id}`);
            return result;
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(null, 'createAttestation', false, responseTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to create attestation for ID ${request.id}:`, error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    async getAttestation(id) {
        const startTime = Date.now();
        try {
            const provider = await this.getPrimaryProvider();
            const result = await provider.getAttestation(id);
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(provider, 'getAttestation', true, responseTime);
            this.logger.log(`Attestation retrieval ${result ? 'succeeded' : 'failed'} for ID: ${id}`);
            return result;
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(null, 'getAttestation', false, responseTime);
            this.logger.error(`Failed to get attestation for ID ${id}:`, error);
            throw error;
        }
    }
    async revokeAttestation(id) {
        const startTime = Date.now();
        try {
            const provider = await this.getPrimaryProvider();
            const result = await provider.revokeAttestation(id);
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(provider, 'revokeAttestation', result.success, responseTime);
            this.logger.log(`Attestation revocation ${result.success ? 'succeeded' : 'failed'} for ID: ${id}`);
            return result;
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(null, 'revokeAttestation', false, responseTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to revoke attestation for ID ${id}:`, error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    async updateAttestationStatus(id, status) {
        const startTime = Date.now();
        try {
            const provider = await this.getPrimaryProvider();
            const result = await provider.updateAttestationStatus(id, status);
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(provider, 'updateAttestationStatus', result.success, responseTime);
            this.logger.log(`Attestation status update ${result.success ? 'succeeded' : 'failed'} for ID: ${id} to status: ${status}`);
            return result;
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(null, 'updateAttestationStatus', false, responseTime);
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to update attestation status for ID ${id}:`, error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    async getAttestationsByWallet(walletId) {
        const startTime = Date.now();
        try {
            const provider = await this.getPrimaryProvider();
            const result = await provider.getAttestationsByWallet(walletId);
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(provider, 'getAttestationsByWallet', true, responseTime);
            this.logger.log(`Retrieved ${result.length} attestations for wallet: ${walletId}`);
            return result;
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            await this.recordProviderMetric(null, 'getAttestationsByWallet', false, responseTime);
            this.logger.error(`Failed to get attestations for wallet ${walletId}:`, error);
            throw error;
        }
    }
    getAvailableProviders() {
        return this.providerFactory.getAvailableProviders();
    }
    getCachedProvidersWithHealth() {
        const cachedProviders = this.providerFactory.getCachedProviders();
        return cachedProviders.map((cached) => {
            const health = this.healthStatus.get(cached.key);
            const metrics = this.metrics.get(cached.key);
            return {
                ...cached,
                health,
                metrics,
            };
        });
    }
    getProviderMetrics(providerType, networkName) {
        if (providerType && networkName) {
            const key = `${providerType}-${networkName}`;
            return this.metrics.get(key);
        }
        return Object.fromEntries(this.metrics.entries());
    }
    async performHealthChecks() {
        try {
            const healthResults = await this.providerFactory.healthCheckAllProviders();
            const currentTime = new Date();
            for (const [providerKey, isHealthy] of Object.entries(healthResults)) {
                const currentStatus = this.healthStatus.get(providerKey);
                const consecutiveFailures = isHealthy
                    ? 0
                    : (currentStatus?.consecutiveFailures || 0) + 1;
                const healthStatus = {
                    isHealthy,
                    lastChecked: currentTime,
                    consecutiveFailures,
                };
                if (!isHealthy) {
                    healthStatus.errorMessage = 'Health check failed';
                }
                this.healthStatus.set(providerKey, healthStatus);
                if (!isHealthy && consecutiveFailures >= 3) {
                    this.logger.warn(`Provider ${providerKey} has failed ${consecutiveFailures} consecutive health checks`);
                }
            }
        }
        catch (error) {
            this.logger.error('Health check process failed:', error);
        }
    }
    async recordProviderMetric(provider, operation, success, responseTime) {
        if (!provider)
            return;
        const providerKey = `${provider.providerType}-${provider.networkName}`;
        const currentMetrics = this.metrics.get(providerKey) || {
            requestCount: 0,
            successCount: 0,
            failureCount: 0,
            averageResponseTime: 0,
        };
        const newRequestCount = currentMetrics.requestCount + 1;
        const newAverageResponseTime = (currentMetrics.averageResponseTime * currentMetrics.requestCount +
            responseTime) /
            newRequestCount;
        this.metrics.set(providerKey, {
            requestCount: newRequestCount,
            successCount: success
                ? currentMetrics.successCount + 1
                : currentMetrics.successCount,
            failureCount: success
                ? currentMetrics.failureCount
                : currentMetrics.failureCount + 1,
            averageResponseTime: newAverageResponseTime,
            lastRequestTime: new Date(),
        });
    }
};
exports.BlockchainProviderService = BlockchainProviderService;
exports.BlockchainProviderService = BlockchainProviderService = BlockchainProviderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_provider_factory_1.BlockchainProviderFactory,
        config_1.ConfigService])
], BlockchainProviderService);
//# sourceMappingURL=blockchain-provider.service.js.map