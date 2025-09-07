#!/bin/bash

# =============================================================================
# Stripe Webhook Testing Helper
# =============================================================================
# Test different Stripe webhook events

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 Stripe Webhook Testing${NC}"
echo "========================"
echo ""

# Function to trigger and explain events
trigger_event() {
    local event=$1
    local description=$2
    
    echo -e "${YELLOW}🎯 Triggering: $event${NC}"
    echo -e "   $description"
    stripe trigger $event
    echo ""
    sleep 2
}

echo -e "${YELLOW}Available test scenarios:${NC}"
echo "1. Complete checkout session (successful subscription)"
echo "2. Failed payment (triggers grace period)"
echo "3. Successful payment (clears grace period)"
echo "4. Subscription canceled"
echo "5. All billing flow events"
echo ""

read -p "Choose a scenario (1-5): " choice

case $choice in
    1)
        trigger_event "checkout.session.completed" "Simulates successful subscription signup"
        ;;
    2)
        trigger_event "invoice.payment_failed" "Simulates failed recurring payment"
        ;;
    3)
        trigger_event "invoice.payment_succeeded" "Simulates successful payment"
        ;;
    4)
        trigger_event "customer.subscription.deleted" "Simulates subscription cancellation"
        ;;
    5)
        echo -e "${BLUE}🚀 Running complete billing flow test...${NC}"
        trigger_event "checkout.session.completed" "1. Customer signs up"
        trigger_event "invoice.payment_succeeded" "2. First payment succeeds"
        trigger_event "invoice.payment_failed" "3. Next payment fails"
        trigger_event "invoice.payment_succeeded" "4. Customer updates payment and succeeds"
        ;;
    *)
        echo -e "${YELLOW}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Webhook testing completed!${NC}"
echo -e "${YELLOW}💡 Check your application logs to see the webhook processing${NC}"
