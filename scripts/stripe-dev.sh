#!/bin/bash

# =============================================================================
# Stripe Development Helper
# =============================================================================
# Run this script to start Stripe webhook forwarding for development

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_PORT=${BACKEND_PORT:-3000}
WEBHOOK_ENDPOINT="/api/billing/stripe/webhook"

echo -e "${BLUE}🎧 Starting Stripe webhook listener...${NC}"
echo -e "${YELLOW}💡 Make sure your backend is running on port $BACKEND_PORT${NC}"
echo -e "${YELLOW}💡 Webhook endpoint: localhost:$BACKEND_PORT$WEBHOOK_ENDPOINT${NC}"
echo ""
echo -e "${YELLOW}📋 Copy the webhook signing secret (whsec_...) to your .env file:${NC}"
echo -e "${YELLOW}   STRIPE_WEBHOOK_SECRET=whsec_...${NC}"
echo ""

# Start listening for webhooks
stripe listen --forward-to localhost:$BACKEND_PORT$WEBHOOK_ENDPOINT

