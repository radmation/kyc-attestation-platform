- **Priority**: P2 (High, follows backend completion)
- **Estimate**: M (1-2 weeks)
- **Type**: Feature Implementation (Frontend)
- **Dependencies**: All tasks in `02-smart-contracts/phase-1-enforcement-contracts`, and `P1-CPP-002-client-dashboard-account-management.md`.
- **Description**: Build the frontend UI for the Compliance Enforcement Dashboard. This is the primary interface where our clients (token issuers) will use the on-chain compliance tools like blacklisting and freezing addresses.
- **AI-Friendly Instructions**:
  - **Goal**: Create an intuitive and secure UI within the client portal for managing on-chain compliance actions.
  - **Frontend Implementation**:
    1.  **Create a new page at `/compliance`**: This page will be accessible from the main portal navigation created in `P1-CPP-002`.
    2.  **Blacklist Management Component**:
        - Display a table of all currently blacklisted addresses.
        - Include a form with an input field and an "Add to Blacklist" button. This form should call the backend API that triggers the `addToBlacklist` smart contract function.
        - Each entry in the table should have a "Remove" button that calls the backend API to trigger the `removeFromBlacklist` function.
    3.  **Freeze Management Component**:
        - Display a table of all currently frozen addresses.
        - Include a form with an input field and a "Freeze Address" button. This will call the backend API that triggers the `freezeAddress` smart contract function.
        - Each entry in the table should have an "Unfreeze" button that calls the backend to trigger `unfreezeAddress`.
    4.  **State Management**:
        - Use React state management (e.g., Context or a dedicated library) to handle loading states, errors, and updating the UI after a transaction is confirmed on the blockchain.
    5.  **Security**:
        - All actions must be restricted to users with the appropriate admin role. The UI should hide or disable controls for users without the correct permissions.
- **Acceptance Criteria**:
  - [ ] A client admin can navigate to the `/compliance` page.
  - [ ] The dashboard correctly displays the current lists of blacklisted and frozen addresses.
  - [ ] An admin can successfully add and remove an address from the blacklist via the UI.
  - [ ] An admin can successfully freeze and unfreeze an address via the UI.
  - [ ] The UI provides clear feedback to the user on the status of their on-chain transactions (e.g., "pending," "confirmed," "failed").
- **Success Metrics**:
  - A compliance officer can perform a critical enforcement action (like blacklisting an address) in under 30 seconds through the UI. 