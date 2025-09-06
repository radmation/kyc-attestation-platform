"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainProviderType = exports.AttestationStatus = void 0;
var AttestationStatus;
(function (AttestationStatus) {
    AttestationStatus["PENDING"] = "PENDING";
    AttestationStatus["ACTIVE"] = "ACTIVE";
    AttestationStatus["REVOKED"] = "REVOKED";
    AttestationStatus["EXPIRED"] = "EXPIRED";
    AttestationStatus["SUSPENDED"] = "SUSPENDED";
})(AttestationStatus || (exports.AttestationStatus = AttestationStatus = {}));
var BlockchainProviderType;
(function (BlockchainProviderType) {
    BlockchainProviderType["HYPERLEDGER_FABRIC"] = "HYPERLEDGER_FABRIC";
    BlockchainProviderType["ETHEREUM"] = "ETHEREUM";
    BlockchainProviderType["POLYGON"] = "POLYGON";
    BlockchainProviderType["ARBITRUM"] = "ARBITRUM";
    BlockchainProviderType["AVALANCHE"] = "AVALANCHE";
    BlockchainProviderType["BSC"] = "BSC";
    BlockchainProviderType["PRIVATE_ETHEREUM"] = "PRIVATE_ETHEREUM";
})(BlockchainProviderType || (exports.BlockchainProviderType = BlockchainProviderType = {}));
//# sourceMappingURL=blockchain-provider.interface.js.map