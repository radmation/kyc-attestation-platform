- **Priority**: P2 (High)
- **Estimate**: M (1-2 weeks)
- **Type**: SDK Development
- **Dependencies**: All tasks in `phase-1-enforcement-contracts`
- **Description**: Create a user-friendly JavaScript/TypeScript SDK to enable token issuers to easily integrate our on-chain compliance features into their applications and smart contracts with minimal effort.
- **AI-Friendly Instructions**:
  - **Goal**: Develop an NPM package that abstracts away the complexity of interacting with our Hyperledger Fabric compliance chaincodes.
  - **SDK Structure (`/packages/compliance-sdk`)**:
    1.  **`ComplianceService` class**:
        - **`constructor(fabricConnectionDetails)`**: Initializes a connection to the Fabric network.
        - **`async checkCompliance(senderAddress, receiverAddress): Promise<boolean>`**: A simple method that calls the `gatekeeper` chaincode and returns a boolean result.
        - **`async isBlacklisted(address): Promise<boolean>`**: Calls the `isAddressBlacklisted` chaincode function.
        - **`async isFrozen(address): Promise<boolean>`**: Calls the `isAddressFrozen` chaincode function.
    2.  **`AdminService` class (for issuer backend use)**:
        - **`constructor(adminConnectionDetails)`**: Initializes a connection with admin credentials.
        - **`async blacklistAddress(address)`**: Calls the `addToBlacklist` chaincode function.
        - **`async unblacklistAddress(address)`**: Calls the `removeFromBlacklist` chaincode function.
        - **`async freezeAddress(address)`**: Calls the `freezeAddress` chaincode function.
        - **`async unfreezeAddress(address)`**: Calls the `unfreezeAddress` chaincode function.
    3.  **Clear Documentation**:
        - Create a `README.md` for the package with clear installation, configuration, and usage examples.
- **Acceptance Criteria**:
  - [ ] A new NPM package is created within a `/packages` directory.
  - [ ] The `ComplianceService` and `AdminService` classes are implemented as described.
  - [ ] The SDK successfully connects to the local Fabric network and interacts with the deployed chaincodes.
  - [ ] Unit tests are written for the SDK methods.
  - [ ] The `README.md` provides comprehensive documentation for developers.
- **Success Metrics**:
  - A developer can integrate our compliance checks into their application in under 30 minutes using the SDK.
  - The SDK abstracts 100% of the direct Fabric SDK interaction for standard compliance checks. 