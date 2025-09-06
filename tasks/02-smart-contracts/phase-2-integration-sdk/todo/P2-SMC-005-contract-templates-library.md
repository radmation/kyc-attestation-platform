- **Priority**: P2 (High)
- **Estimate**: S (3-5 days)
- **Type**: Content Creation
- **Dependencies**: All tasks in `phase-1-enforcement-contracts`
- **Description**: Create a library of pre-built, compliance-ready smart contract templates that developers can use as a starting point for their own token projects, significantly lowering the barrier to entry for building compliant assets.
- **AI-Friendly Instructions**:
  - **Goal**: Provide developers with secure, well-documented, and easy-to-use smart contract examples that already have our compliance features integrated.
  - **Repository Structure (`/templates/contracts`)**:
    1.  **Create a `README.md`**:
        - Explain the purpose of the templates.
        - Provide a guide on how to use them with a development framework like Hardhat or Truffle.
    2.  **ERC20 Template (`CompliantERC20.sol`)**:
        - Create a standard ERC20 contract.
        - Import a `IComplianceGatekeeper` interface.
        - In the `_beforeTokenTransfer` hook, add a `require()` statement that calls `gatekeeper.checkCompliance(from, to)`.
        - The address of the gatekeeper contract should be settable in the constructor.
    3.  **ERC721 Template (`CompliantERC721.sol`)**:
        - Create a standard ERC721 contract.
        - Apply the same `_beforeTokenTransfer` hook and compliance check logic as the ERC20 template.
- **Acceptance Criteria**:
  - [ ] A `/templates/contracts` directory is created.
  - [ ] An ERC20 template with the integrated compliance check is present.
  - [ ] An ERC721 template with the integrated compliance check is present.
  - [ ] A `README.md` file explains how to use the templates.
  - [ ] The templates are well-commented and follow Solidity best practices.
- **Success Metrics**:
  - The templates reduce the time required for a developer to create a new compliant token by over 80%.
  - The templates are clear and easy to understand for developers with intermediate Solidity knowledge. 