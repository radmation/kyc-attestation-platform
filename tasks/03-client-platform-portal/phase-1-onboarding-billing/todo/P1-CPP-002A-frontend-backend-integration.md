- **Priority**: P1 (Critical for MVP - Integration Gap)
- **Estimate**: S (3-5 days)
- **Type**: Integration & Testing
- **Dependencies**: `P1-CPP-002-client-dashboard-account-management.md`, `P0-INF-007-user-invitation-system.md`, `P0-INF-008-white-labeling-api.md`
- **Description**: Integrate and test the frontend UI components created in P1-CPP-002 with the actual backend APIs. This task addresses the critical gap between frontend and backend implementation to ensure end-to-end functionality works properly.
- **AI-Friendly Instructions**:
  - **Goal**: Verify and fix the integration between the client dashboard frontend and backend APIs, ensuring all features work end-to-end.
  - **Integration Tasks**:
    1. **Team Management Integration**:
        - Verify the `POST /invitations` endpoint exists and works correctly.
        - Test the frontend team management UI calls to `/invitations` endpoint.
        - Ensure proper error handling and validation messages are displayed.
        - Verify role-based permissions work correctly.
    2. **White-labeling Integration**:
        - Verify the branding/white-labeling API endpoints exist (logo upload, theme colors).
        - Test the settings page UI can successfully upload logos and save theme colors.
        - Ensure uploaded assets are properly served and displayed.
    3. **Billing Integration Verification**:
        - Test that the Stripe Customer Portal button works correctly.
        - Verify billing status warnings appear properly based on account status.
        - Ensure grace period logic displays correct dates and warnings.
    4. **Authentication & Authorization**:
        - Verify all API calls include proper authentication headers.
        - Test that role-based access controls work (admin vs regular user permissions).
        - Ensure JWT tokens are properly handled and refreshed.
    5. **Error Handling & UX**:
        - Implement proper loading states for all API calls.
        - Add error handling with user-friendly error messages.
        - Ensure form validation works on both frontend and backend.
    6. **End-to-End Testing**:
        - Test the complete user flow: login → navigate dashboard → invite team member → update branding → manage billing.
        - Verify all features work across different user roles and account statuses.
- **Acceptance Criteria**:
  - [ ] Team management UI successfully invites users and displays team members.
  - [ ] Settings page successfully uploads logos and saves theme colors, with changes reflected in the UI.
  - [ ] Billing management works end-to-end with proper status warnings.
  - [ ] All API calls have proper error handling and loading states.
  - [ ] Role-based permissions work correctly throughout the application.
  - [ ] Complete user workflows can be executed without errors.
- **Success Metrics**:
  - All frontend UI components successfully communicate with backend APIs without integration issues.
  - A token issuer can complete all account management tasks through the UI without backend errors. 