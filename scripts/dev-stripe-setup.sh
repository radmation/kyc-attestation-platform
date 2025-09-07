#!/bin/bash

# =============================================================================
# KYC Attestation Platform - Stripe Development Setup
# =============================================================================
# This script automates Stripe CLI setup for local development
# It handles installation, authentication, and webhook forwarding

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=${BACKEND_PORT:-3000}
WEBHOOK_ENDPOINT="/api/billing/stripe/webhook"
STRIPE_LISTEN_PORT=${STRIPE_LISTEN_PORT:-4242}

echo -e "${BLUE}🎯 KYC Platform - Stripe Development Setup${NC}"
echo "=============================================="

# Check if Stripe CLI is installed
check_stripe_cli() {
    if command -v stripe &> /dev/null; then
        echo -e "${GREEN}✅ Stripe CLI is already installed${NC}"
        stripe --version
        return 0
    else
        echo -e "${YELLOW}⚠️  Stripe CLI not found${NC}"
        return 1
    fi
}

# Install Stripe CLI
install_stripe_cli() {
    echo -e "${BLUE}📦 Installing Stripe CLI...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install stripe/stripe-cli/stripe
        else
            echo -e "${RED}❌ Homebrew not found. Please install manually: https://stripe.com/docs/stripe-cli${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - check if we're in WSL or native Linux
        if grep -qi microsoft /proc/version 2>/dev/null; then
            echo -e "${YELLOW}🐧 WSL detected - installing via curl...${NC}"
        else
            echo -e "${YELLOW}🐧 Linux detected - installing via curl...${NC}"
        fi
        
        # Download and install
        curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
        echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
        sudo apt update
        sudo apt install stripe
    else
        echo -e "${RED}❌ Unsupported OS. Please install manually: https://stripe.com/docs/stripe-cli${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Stripe CLI installed successfully!${NC}"
}

# Authenticate with Stripe
authenticate_stripe() {
    echo -e "${BLUE}🔐 Authenticating with Stripe...${NC}"
    
    # Check if already logged in
    if stripe config --list &> /dev/null; then
        echo -e "${GREEN}✅ Already authenticated with Stripe${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}Please log in to your Stripe account...${NC}"
    stripe login
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully authenticated with Stripe!${NC}"
    else
        echo -e "${RED}❌ Failed to authenticate with Stripe${NC}"
        exit 1
    fi
}

# Create environment configuration
setup_environment() {
    echo -e "${BLUE}📝 Setting up environment configuration...${NC}"
    
    # Check if .env exists in backend
    ENV_FILE="apps/backend/.env"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
        if [ -f "apps/backend/env.example" ]; then
            cp "apps/backend/env.example" "$ENV_FILE"
            echo -e "${GREEN}✅ Created .env from template${NC}"
        else
            echo -e "${RED}❌ No env.example found. Please create .env manually${NC}"
            return 1
        fi
    fi
    
    # Get webhook endpoint secret from Stripe CLI
    echo -e "${BLUE}🔑 Getting webhook endpoint secret...${NC}"
    
    # The webhook secret will be provided by stripe listen command
    echo -e "${YELLOW}💡 Webhook secret will be provided when you start the listener${NC}"
    echo -e "${YELLOW}💡 Make sure to update STRIPE_WEBHOOK_SECRET in your .env file${NC}"
}

# Create development helper script
create_dev_helper() {
    echo -e "${BLUE}🛠️  Creating development helper script...${NC}"
    
    cat > scripts/stripe-dev.sh << 'EOF'
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

EOF

    chmod +x scripts/stripe-dev.sh
    echo -e "${GREEN}✅ Created scripts/stripe-dev.sh${NC}"
}

# Create Docker Compose override for Stripe
create_docker_override() {
    echo -e "${BLUE}🐳 Creating Docker Compose override for Stripe...${NC}"
    
    cat > docker-compose.stripe.yml << 'EOF'
version: '3.8'

services:
  # Stripe CLI service for webhook forwarding
  stripe-cli:
    image: stripe/stripe-cli:latest
    container_name: kyc-stripe-cli
    depends_on:
      - backend
    command: >
      sh -c "
        echo 'Waiting for backend to be ready...' &&
        sleep 10 &&
        echo 'Starting Stripe webhook forwarding...' &&
        stripe listen --forward-to http://backend:3000/api/billing/stripe/webhook --skip-verify
      "
    environment:
      - STRIPE_API_KEY=${STRIPE_SECRET_KEY}
    volumes:
      - stripe_config:/root/.config/stripe
    networks:
      - kyc-network
    restart: unless-stopped
    profiles:
      - stripe-dev

volumes:
  stripe_config:

networks:
  kyc-network:
    external: true
EOF

    echo -e "${GREEN}✅ Created docker-compose.stripe.yml${NC}"
}

# Create testing helper
create_test_helper() {
    echo -e "${BLUE}🧪 Creating Stripe testing helper...${NC}"
    
    cat > scripts/test-stripe-webhooks.sh << 'EOF'
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
EOF

    chmod +x scripts/test-stripe-webhooks.sh
    echo -e "${GREEN}✅ Created scripts/test-stripe-webhooks.sh${NC}"
}

# Update package.json scripts
update_package_scripts() {
    echo -e "${BLUE}📦 Updating package.json scripts...${NC}"
    
    # Add npm scripts for Stripe development
    if [ -f "package.json" ]; then
        # Check if jq is available for JSON manipulation
        if command -v jq &> /dev/null; then
            # Add stripe development scripts
            jq '.scripts.stripe = "scripts/stripe-dev.sh" | .scripts["stripe:test"] = "scripts/test-stripe-webhooks.sh"' package.json > package.json.tmp && mv package.json.tmp package.json
            echo -e "${GREEN}✅ Added npm scripts: npm run stripe, npm run stripe:test${NC}"
        else
            echo -e "${YELLOW}⚠️  jq not found. Please manually add to package.json:${NC}"
            echo '    "stripe": "scripts/stripe-dev.sh",'
            echo '    "stripe:test": "scripts/test-stripe-webhooks.sh"'
        fi
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting Stripe development setup...${NC}"
    
    # Create scripts directory if it doesn't exist
    mkdir -p scripts
    
    # Check and install Stripe CLI
    if ! check_stripe_cli; then
        install_stripe_cli
    fi
    
    # Authenticate with Stripe
    authenticate_stripe
    
    # Setup environment
    setup_environment
    
    # Create helper scripts
    create_dev_helper
    create_docker_override
    create_test_helper
    update_package_scripts
    
    echo ""
    echo -e "${GREEN}🎉 Stripe development setup complete!${NC}"
    echo ""
    echo -e "${YELLOW}📚 Next steps:${NC}"
    echo "1. Add your Stripe API keys to apps/backend/.env:"
    echo "   STRIPE_SECRET_KEY=sk_test_..."
    echo "   STRIPE_PUBLISHABLE_KEY=pk_test_..."
    echo ""
    echo "2. Start your backend server:"
    echo "   cd apps/backend && npm run start:dev"
    echo ""
    echo "3. In another terminal, start Stripe webhook forwarding:"
    echo "   npm run stripe"
    echo "   # OR"
    echo "   scripts/stripe-dev.sh"
    echo ""
    echo "4. Copy the webhook secret (whsec_...) to your .env file"
    echo ""
    echo "5. Test webhooks:"
    echo "   npm run stripe:test"
    echo ""
    echo -e "${BLUE}🐳 For Docker development with Stripe:${NC}"
    echo "   docker-compose -f docker-compose.yml -f docker-compose.stripe.yml --profile stripe-dev up"
}

# Run main function
main "$@" 