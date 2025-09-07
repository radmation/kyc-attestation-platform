- **Priority**: P1 (Critical for MVP)
- **Estimate**: L (2-3 weeks)
- **Type**: Feature Implementation (Backend & Frontend)
- **Description**: Implement the full client onboarding and billing lifecycle. This includes creating a self-service signup flow for new companies and integrating with Stripe for subscription management, including handling payment failures and a grace period.
- **AI-Friendly Instructions**:
  - **Goal**: Allow a new token issuer to sign up for the platform, select a subscription plan, and pay for it using Stripe, with robust handling for payment failures.
  - **Backend Implementation**:
    1.  **Stripe Integration (`stripe.service.ts`)**:
        - Use the official `stripe` Node.js library.
        - Create Stripe Products and Prices in the Stripe Dashboard for "Starter" and "Professional" plans.
        - **`createCheckoutSession(client, priceId)`**: Create a Stripe Checkout session for a new subscription.
        - **Webhook Handler (`stripe.controller.ts`)**: Create a dedicated webhook endpoint to receive events from Stripe.
          - Secure the endpoint using Stripe's webhook signing secrets.
          - Handle `checkout.session.completed` to provision the client's account and save the `stripeCustomerId`.
          - Handle `invoice.payment_succeeded` to update the client's billing status to `ACTIVE`.
          - Handle `invoice.payment_failed`:
            - Update the client's status to `PAST_DUE`.
            - Record the date of the failure and calculate the `gracePeriodEndsAt` (21 days from failure).
            - Trigger the first reminder email.
          - Handle `customer.subscription.deleted`: Mark the subscription as `CANCELED` in our DB.
    2.  **Grace Period Logic (Cron Job)**:
        - Create a daily cron job (`billing.scheduler.ts`).
        - The job will query for clients with a `PAST_DUE` status.
        - If `now() > gracePeriodEndsAt`, change the client's status to `SUSPENDED` and lock them out of the compliance tools.
        - Send reminder emails at specific intervals (e.g., 7, 14, and 20 days into the grace period).
  - **Frontend Implementation**:
    1.  **Pricing Page**:
        - Create a page that displays the different subscription plans and their features.
        - A "Sign Up" button for a plan should call the backend to create a checkout session and redirect the user to the Stripe Checkout page.
    2.  **Billing Management Page**:
        - In the client's account settings, create a "Billing" section.
        - Implement a Stripe Customer Portal button to allow clients to manage their payment methods and view invoices.
    3.  **Dashboard Warnings**:
        - If the logged-in client's status is `PAST_DUE`, display a persistent, prominent warning banner across the top of the dashboard.
        - The banner should state their payment has failed and include the `gracePeriodEndsAt` date.
- **Acceptance Criteria**:
  - [ ] A new client can navigate from a pricing page to Stripe Checkout and successfully subscribe.
  - [ ] The backend correctly handles Stripe webhooks for successful and failed payments.
  - [ ] When a payment fails, the client's status is updated, a grace period is set, and a reminder email is sent.
  - [ ] The frontend displays a clear warning banner to clients in their grace period.
  - [ ] A client can manage their subscription via the Stripe Customer Portal.
- **Success Metrics**:
  - The entire client onboarding and payment flow is 100% self-service, requiring no manual intervention. - **Started**: Sun Sep  7 12:04:37 PDT 2025
- **Last Update**: Sun Sep  7 12:04:37 PDT 2025 - Started implementation
