- **Priority**: P1 (Critical for MVP)
- **Estimate**: S (3-5 days)
- **Type**: Feature Implementation
- **Dependencies**: `P1-SMC-001-gatekeeper-contract-development.md`
- **Description**: Implement an on-chain address blacklisting system that allows an authorized administrator to block specific wallet addresses from transacting. This system is a critical component for complying with sanctions and lawful orders.
- **AI-Friendly Instructions**:
  - **Goal**: Extend the Hyperledger Fabric chaincode to include a dynamically managed blacklist.
  - **Chaincode (`blacklist.go` or extend `gatekeeper.go`)**:
    1.  **Data Structure**:
        - Create a mapping or a state entry to store blacklisted addresses. `mapping(address => bool) private isBlacklisted;` is the Solidity concept; implement the equivalent in Go using the chaincode state API.
    2.  **`addToBlacklist(addressToBlock string)` function**:
        - Callable only by an authorized administrator.
        - Adds the given address to the blacklist in the chaincode state.
        - Emits an `AddressBlacklisted` event with the address.
    3.  **`removeFromBlacklist(addressToUnblock string)` function**:
        - Callable only by an authorized administrator.
        - Removes the given address from the blacklist.
        - Emits an `AddressRemovedFromBlacklist` event with the address.
    4.  **`isAddressBlacklisted(addressToCheck string)` function**:
        - A public query function that returns `true` or `false`.
    5.  **Integration with Gatekeeper**:
        - The `CheckCompliance` function in the Gatekeeper chaincode must be updated.
        - Before checking for attestations, it must first call `isAddressBlacklisted` for both the sender and receiver.
        - If either address returns `true`, `CheckCompliance` must immediately fail.
- **Acceptance Criteria**:
  - [ ] The chaincode is updated with blacklist management functions.
  - [ ] Access control for the admin functions is implemented and tested.
  - [ ] The `CheckCompliance` function correctly blocks transactions involving blacklisted addresses.
  - [ ] Unit tests are created to verify adding, removing, and checking blacklisted addresses.
  - [ ] An integration test from the NestJS backend demonstrates that a transaction from a blacklisted address is successfully blocked.
- **Success Metrics**:
  - The platform has a functional, real-time mechanism to prevent sanctioned or illicit addresses from interacting with compliant tokens. 