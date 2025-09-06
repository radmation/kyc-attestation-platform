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
var BlockchainProviderFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const blockchain_provider_interface_1 = require("./interfaces/blockchain-provider.interface");
let BlockchainProviderFactory = BlockchainProviderFactory_1 = class BlockchainProviderFactory {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(BlockchainProviderFactory_1.name);
        this.providers = new Map();
        this.registry = new Map();
        this.initializeRegistry();
    }
    initializeRegistry() {
        this.logger.log(`Initialized provider registry with ${this.registry.size} providers`);
    }
    async createProvider(config) {
        const cacheKey = `${config.providerType}-${config.networkName}`;
        if (this.providers.has(cacheKey)) {
            const cachedProvider = this.providers.get(cacheKey);
            if (await cachedProvider.isHealthy()) {
                this.logger.log(`Returning cached provider: ${cacheKey}`);
                return cachedProvider;
            }
            else {
                this.logger.warn(`Cached provider ${cacheKey} is unhealthy, removing from cache`);
                await cachedProvider.disconnect();
                this.providers.delete(cacheKey);
            }
        }
        const validationResult = this.validateConfiguration(config);
        if (!validationResult.isValid) {
            const errors = validationResult.errors.join(', ');
            throw new Error(`Provider configuration validation failed: ${errors}`);
        }
        const registryEntry = this.registry.get(config.providerType);
        if (!registryEntry) {
            throw new Error(`Unsupported provider type: ${config.providerType}`);
        }
        if (!registryEntry.isEnabled) {
            throw new Error(`Provider ${config.providerType} is disabled`);
        }
        if (!registryEntry.supportedNetworks.includes(config.networkName)) {
            this.logger.warn(`Network ${config.networkName} is not in supported networks list for ${config.providerType}: ${registryEntry.supportedNetworks.join(', ')}`);
        }
        try {
            const ProviderClass = registryEntry.providerClass;
            const provider = new ProviderClass(config);
            this.logger.log(`Creating new provider: ${cacheKey}`);
            await provider.initialize();
            if (!(await provider.isHealthy())) {
                throw new Error(`Provider ${cacheKey} failed health check after initialization`);
            }
            this.providers.set(cacheKey, provider);
            this.logger.log(`Successfully created and cached provider: ${cacheKey}`);
            return provider;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to create provider ${cacheKey}:`, error);
            throw new Error(`Provider creation failed for ${cacheKey}: ${errorMessage}`);
        }
    }
    async getProvider(providerType, networkName) {
        const config = this.createDefaultConfiguration(providerType, networkName);
        return this.createProvider(config);
    }
    getAvailableProviders() {
        return Array.from(this.registry.values());
    }
    getCachedProviders() {
        return Array.from(this.providers.entries()).map(([key, provider]) => ({
            key,
            providerType: provider.providerType,
            networkName: provider.networkName
        }));
    }
    async removeProvider(providerType, networkName) {
        const cacheKey = `${providerType}-${networkName}`;
        const provider = this.providers.get(cacheKey);
        if (provider) {
            this.logger.log(`Removing provider from cache: ${cacheKey}`);
            await provider.disconnect();
            this.providers.delete(cacheKey);
        }
    }
    async clearCache() {
        this.logger.log('Clearing all cached providers');
        const disconnectPromises = Array.from(this.providers.values()).map(provider => provider.disconnect().catch(error => this.logger.error('Error disconnecting provider:', error)));
        await Promise.allSettled(disconnectPromises);
        this.providers.clear();
        this.logger.log('All cached providers cleared');
    }
    async healthCheckAllProviders() {
        const healthChecks = {};
        for (const [key, provider] of this.providers.entries()) {
            try {
                healthChecks[key] = await provider.isHealthy();
            }
            catch (error) {
                this.logger.error(`Health check failed for provider ${key}:`, error);
                healthChecks[key] = false;
            }
        }
        return healthChecks;
    }
    registerProvider(entry) {
        this.registry.set(entry.providerType, entry);
        this.logger.log(`Registered new provider: ${entry.providerType} - ${entry.description}`);
    }
    validateConfiguration(config) {
        const errors = [];
        if (!config.providerType) {
            errors.push('Provider type is required');
        }
        if (!config.networkName) {
            errors.push('Network name is required');
        }
        if (config.enabled === undefined) {
            errors.push('Enabled flag is required');
        }
        if (!config.enabled) {
            errors.push('Provider is disabled');
        }
        if (config.providerType === blockchain_provider_interface_1.BlockchainProviderType.HYPERLEDGER_FABRIC) {
            this.validateFabricConfiguration(config, errors);
        }
        else if ([
            blockchain_provider_interface_1.BlockchainProviderType.ETHEREUM,
            blockchain_provider_interface_1.BlockchainProviderType.POLYGON,
            blockchain_provider_interface_1.BlockchainProviderType.ARBITRUM,
            blockchain_provider_interface_1.BlockchainProviderType.AVALANCHE,
            blockchain_provider_interface_1.BlockchainProviderType.BSC,
            blockchain_provider_interface_1.BlockchainProviderType.PRIVATE_ETHEREUM
        ].includes(config.providerType)) {
            this.validateEthereumConfiguration(config, errors);
        }
        else {
            errors.push(`Unknown provider type: ${config.providerType}`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateFabricConfiguration(config, errors) {
        if (!config.fabricConfig) {
            errors.push('Fabric configuration is required');
            return;
        }
        const { fabricConfig } = config;
        if (!fabricConfig.connectionProfilePath) {
            errors.push('Connection profile path is required for Fabric');
        }
        if (!fabricConfig.walletPath) {
            errors.push('Wallet path is required for Fabric');
        }
        if (!fabricConfig.identityName) {
            errors.push('Identity name is required for Fabric');
        }
        if (!fabricConfig.channelName) {
            errors.push('Channel name is required for Fabric');
        }
        if (!fabricConfig.chaincodeName) {
            errors.push('Chaincode name is required for Fabric');
        }
        if (!fabricConfig.mspId) {
            errors.push('MSP ID is required for Fabric');
        }
    }
    validateEthereumConfiguration(config, errors) {
        if (!config.ethereumConfig) {
            errors.push('Ethereum configuration is required');
            return;
        }
        const { ethereumConfig } = config;
        if (!ethereumConfig.rpcUrl) {
            errors.push('RPC URL is required for Ethereum');
        }
        if (!ethereumConfig.chainId) {
            errors.push('Chain ID is required for Ethereum');
        }
        if (!ethereumConfig.contracts?.attestationContract) {
            errors.push('Attestation contract address is required for Ethereum');
        }
        if (!ethereumConfig.privateKey && !ethereumConfig.mnemonic) {
            errors.push('Either private key or mnemonic is required for Ethereum');
        }
    }
    createDefaultConfiguration(providerType, networkName) {
        const baseConfig = {
            providerType,
            networkName,
            enabled: true,
            connectionTimeout: this.configService.get('BLOCKCHAIN_CONNECTION_TIMEOUT', 30000),
            requestTimeout: this.configService.get('BLOCKCHAIN_REQUEST_TIMEOUT', 10000),
            maxRetries: this.configService.get('BLOCKCHAIN_MAX_RETRIES', 3),
            healthCheckInterval: this.configService.get('BLOCKCHAIN_HEALTH_CHECK_INTERVAL', 60000),
            environment: this.configService.get('NODE_ENV', 'development')
        };
        if (providerType === blockchain_provider_interface_1.BlockchainProviderType.HYPERLEDGER_FABRIC) {
            return {
                ...baseConfig,
                providerType: blockchain_provider_interface_1.BlockchainProviderType.HYPERLEDGER_FABRIC,
                fabricConfig: {
                    connectionProfilePath: this.configService.get('FABRIC_CONNECTION_PROFILE_PATH', ''),
                    walletPath: this.configService.get('FABRIC_WALLET_PATH', './wallet'),
                    identityName: this.configService.get('FABRIC_IDENTITY_NAME', 'appUser'),
                    channelName: this.configService.get('FABRIC_CHANNEL_NAME', networkName || 'kycchannel'),
                    chaincodeName: this.configService.get('FABRIC_CHAINCODE_NAME', 'kycattestation'),
                    mspId: this.configService.get('FABRIC_MSP_ID', 'Org1MSP'),
                    enableDiscovery: this.configService.get('FABRIC_ENABLE_DISCOVERY', 'true') === 'true',
                    asLocalhost: this.configService.get('FABRIC_AS_LOCALHOST', 'true') === 'true'
                }
            };
        }
        else {
            throw new Error(`Default configuration not implemented for provider type: ${providerType}`);
        }
    }
};
exports.BlockchainProviderFactory = BlockchainProviderFactory;
exports.BlockchainProviderFactory = BlockchainProviderFactory = BlockchainProviderFactory_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BlockchainProviderFactory);
//# sourceMappingURL=blockchain-provider.factory.js.map