- **Priority**: P1 (Critical for MVP)
- **Estimate**: L (2-3 weeks)
- **Type**: Feature Implementation
- **Description**: Develop, test, and deploy the core "Gatekeeper" smart contract. This contract will act as a compliance middleware for token transactions, verifying the on-chain KYC attestation of the sender and receiver before allowing a transaction to proceed.
- **AI-Friendly Instructions**:
  - **Goal**: Implement a Hyperledger Fabric chaincode in Go that can be called by other chaincodes to enforce compliance rules.
  - **Chaincode (`gatekeeper.go`)**:
    1.  **`CheckCompliance(senderAddress string, receiverAddress string)` function**:
        - This function will be the primary entry point.
        - It must query the `kycattestation` chaincode to retrieve the attestations for both the `senderAddress` and `receiverAddress`.
        - **Logic**:
          - `senderAttestation = GetAttestation(senderAddress)`
          - `receiverAttestation = GetAttestation(receiverAddress)`
          - Return `true` if both attestations are valid, active, and not expired.
          - Return `false` and an error message if either attestation is missing, invalid, or revoked.
    2.  **Emergency Pause Functionality**:
        - Implement a contract-level pausable feature (similar to OpenZeppelin's Pausable).
        - Add `pause()` and `unpause()` functions, callable only by an authorized administrator role.
        - The `CheckCompliance` function must immediately return `false` if the contract is paused.
    3.  **Event Logging**:
        - Emit a `ComplianceCheckResult` event for every check, logging the sender, receiver, and the boolean result.
- **Acceptance Criteria**:
  - [ ] A `gatekeeper.go` chaincode is created with the specified functions and logic.
  - [ ] Unit tests are written in Go to cover all logic paths, including valid, invalid, and paused states.
  - [ ] The chaincode is successfully deployed to the local Hyperledger Fabric network.
  - [ ] An integration test from the NestJS backend successfully calls the `CheckCompliance` function and receives the correct boolean response.
  - [ ] The emergency `pause()` and `unpause()` functions are tested and verified to work as expected.
- **Success Metrics**:
  - The chaincode provides a reliable, gas-efficient, and secure method for enforcing on-chain transaction compliance, forming the core of the MVP's enforcement module. 