# Integration Guides

This directory contains comprehensive integration guides for all external services used by the KYC Attestation Platform.

## Available Integration Guides

### 🔐 [iDenfy KYC Integration](./IDENFY_INTEGRATION_GUIDE.md)
Complete guide for integrating with iDenfy's identity verification services:
- API configuration and authentication
- Webhook handling and signature verification
- KYC verification flow implementation
- Status mapping and error handling
- Testing with sandbox environment

### 💳 [Stripe Billing Integration](./STRIPE_INTEGRATION_GUIDE.md)
Comprehensive guide for Stripe payment and subscription management:
- Subscription billing setup and configuration
- Stripe Checkout and Customer Portal integration
- Webhook handling for payment events
- Grace period and billing automation
- Database schema for billing management

## Quick Reference

| Service | Purpose | Configuration Required |
|---------|---------|----------------------|
| **iDenfy** | Identity verification and KYC processing | API keys, webhook secret, environment setup |
| **Stripe** | Payment processing and subscription billing | API keys, webhook secret, product/price creation |

## Environment Variables

### iDenfy Configuration
```bash
IDENFY_API_ACCESS_KEY="your_api_key_here"
IDENFY_API_SECRET_KEY="your_secret_key_here"
IDENFY_WEBHOOK_SECRET="your_webhook_secret_here"
IDENFY_ENVIRONMENT="sandbox" # or "production"
```

### Stripe Configuration
```bash
STRIPE_SECRET_KEY="sk_test_..." # or sk_live_
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..." # or pk_live_
```

## Development Setup

1. **iDenfy Setup**: Follow the [iDenfy Integration Guide](./IDENFY_INTEGRATION_GUIDE.md) for complete setup instructions
2. **Stripe Setup**: Follow the [Stripe Integration Guide](./STRIPE_INTEGRATION_GUIDE.md) for billing system configuration

## Production Considerations

### Security
- Always use production API keys in production environments
- Implement proper webhook signature verification for all services
- Store API keys securely using environment variables or secrets management
- Use HTTPS for all webhook endpoints

### Monitoring
- Monitor webhook delivery success rates
- Set up alerts for payment failures and KYC verification issues
- Log all external API interactions for debugging and audit purposes

### Compliance
- Ensure webhook endpoints are properly secured and rate-limited
- Implement proper error handling and retry logic for external service failures
- Maintain audit logs for all compliance-related operations

## Support

For technical support with integrations:
- **iDenfy Issues**: Refer to iDenfy documentation or contact their support team
- **Stripe Issues**: Refer to Stripe documentation or contact their support team
- **Platform Issues**: Check the troubleshooting sections in each integration guide 