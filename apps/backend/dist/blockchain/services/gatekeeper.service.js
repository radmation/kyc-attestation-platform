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
var GatekeeperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatekeeperService = void 0;
const common_1 = require("@nestjs/common");
const fabric_blockchain_provider_1 = require("../providers/fabric-blockchain.provider");
let GatekeeperService = GatekeeperService_1 = class GatekeeperService {
    constructor(fabricProvider) {
        this.fabricProvider = fabricProvider;
        this.logger = new common_1.Logger(GatekeeperService_1.name);
        this.chaincodeName = 'gatekeeper';
        this.channelName = 'kycchannel';
    }
    async checkCompliance(senderAddress, receiverAddress) {
        this.logger.debug(`Checking compliance for sender: ${senderAddress}, receiver: ${receiverAddress}`);
        try {
            const mockResult = {
                sender: senderAddress,
                receiver: receiverAddress,
                isCompliant: false,
                reason: 'Mock implementation - would check KYC attestations on blockchain',
                checkedAt: new Date().toISOString(),
                senderValid: false,
                receiverValid: false,
            };
            this.logger.log(`Compliance check completed: ${mockResult.isCompliant} for ${senderAddress} -> ${receiverAddress}`);
            return mockResult;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Failed to check compliance:', errorMessage);
            throw new Error(`Compliance check failed: ${errorMessage}`);
        }
    }
    async getPauseState() {
        this.logger.debug('Getting gatekeeper pause state');
        try {
            const mockResult = {
                paused: false,
            };
            this.logger.log(`Gatekeeper pause state: ${mockResult.paused}`);
            return mockResult;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Failed to get pause state:', errorMessage);
            throw new Error(`Failed to get pause state: ${errorMessage}`);
        }
    }
    async pauseContract() {
        this.logger.debug('Pausing gatekeeper contract');
        try {
            this.logger.warn('Mock implementation - would pause gatekeeper contract');
            this.logger.log('Gatekeeper contract paused successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Failed to pause contract:', errorMessage);
            throw new Error(`Failed to pause contract: ${errorMessage}`);
        }
    }
    async unpauseContract() {
        this.logger.debug('Unpausing gatekeeper contract');
        try {
            this.logger.warn('Mock implementation - would unpause gatekeeper contract');
            this.logger.log('Gatekeeper contract unpaused successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Failed to unpause contract:', errorMessage);
            throw new Error(`Failed to unpause contract: ${errorMessage}`);
        }
    }
    async isTransactionCompliant(senderAddress, receiverAddress) {
        const result = await this.checkCompliance(senderAddress, receiverAddress);
        this.logger.debug(`Transaction compliance result: ${result.isCompliant}. Reason: ${result.reason}`);
        return result.isCompliant;
    }
    async getComplianceDetails(senderAddress, receiverAddress) {
        const details = await this.checkCompliance(senderAddress, receiverAddress);
        const recommendation = details.isCompliant
            ? 'Transaction can proceed - both parties have valid KYC attestations'
            : 'Transaction should be blocked - ' + details.reason;
        return {
            isCompliant: details.isCompliant,
            details,
            recommendation,
        };
    }
};
exports.GatekeeperService = GatekeeperService;
exports.GatekeeperService = GatekeeperService = GatekeeperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fabric_blockchain_provider_1.FabricBlockchainProvider])
], GatekeeperService);
//# sourceMappingURL=gatekeeper.service.js.map