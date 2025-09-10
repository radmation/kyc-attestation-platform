- **Priority**: P1 (Critical for MVP)
- **Estimate**: M (1-2 weeks)
- **Type**: Feature Implementation (Frontend)
- **Dependencies**: `P1-CPP-001-client-onboarding-billing.md`
- **Description**: Build the main frontend dashboard for our clients (token issuers). This includes the core layout, navigation, and the UI components for managing their account and team members. This task does not include the compliance tools themselves, which will be a separate task.
- **AI-Friendly Instructions**:
  - **Goal**: Create a secure, intuitive, and professional-looking portal for our clients to manage their accounts.
  - **Frontend Implementation**:
    1.  **Authenticated Layout**:
        - Create a new layout component for the authenticated client portal.
        - This layout should include a persistent sidebar for navigation and a header.
    2.  **Navigation**:
        - The sidebar should include links to: "Dashboard", "Compliance", "Team", and "Settings".
    3.  **Dashboard Page (`/dashboard`)**:
        - For now, this can be a welcome page with placeholder widgets for future content (e.g., "Verified Users," "On-Chain Activity").
    4.  **Team Management Page (`/team`)**:
        - This page will be the UI for the existing `P0-INF-007-user-invitation-system.md` backend task.
        - **Functionality**:
          - Display a table of current team members with their roles.
          - An "Invite Member" form (email and role selection) that calls the `POST /invitations` endpoint.
          - An option to revoke pending invitations or remove existing members.
    5.  **Settings Page (`/settings`)**:
        - This page will contain sub-sections for "Profile" and "Billing".
        - The "Billing" section should contain the Stripe Customer Portal integration from `P1-CPP-001`.
        - The "Profile" section will be the UI for the `P0-INF-008-white-labeling-api.md` backend task, allowing clients to upload their logo and set a theme color.
- **Acceptance Criteria**:
  - [ ] A logged-in client user is presented with a professional dashboard layout.
  - [ ] The navigation allows the user to access all main sections of the portal.
  - [ ] An admin can successfully invite a new team member via the UI.
  - [ ] An admin can manage their billing subscription via the Stripe Customer Portal.
  - [ ] An admin can update their company's branding via the settings page.
- **Success Metrics**:
  - The client portal provides all the necessary tools for an issuer to manage their account without needing to contact support. - **Started**: Tue Sep  9 18:42:45 PDT 2025
- **Last Update**: Tue Sep  9 18:56:57 PDT 2025 - Completed and moved to review
- **Completed**: Tue Sep  9 18:56:57 PDT 2025
- [Date] - Moved to review/
