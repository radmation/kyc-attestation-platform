#!/bin/bash

# =============================================================================
# KYC Attestation Platform - Development Environment Setup
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to setup environment file
setup_env() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f "apps/backend/.env" ]; then
        if [ -f "apps/backend/env.example" ]; then
            cp apps/backend/env.example apps/backend/.env
            print_success "Created .env file from template"
        else
            print_warning "No env.example found, creating basic .env file"
            cat > apps/backend/.env << EOF
# Platform Configuration
PLATFORM_DOMAIN="https://identhor.com"
API_VERSION="v1"
PORT=3000
NODE_ENV="development"

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"

# iDenfy Configuration
IDENFY_API_ACCESS_KEY="your_idenfy_api_access_key_here"
IDENFY_API_SECRET_KEY="your_idenfy_api_secret_key_here"
IDENFY_WEBHOOK_SECRET="your_idenfy_webhook_secret_here"
IDENFY_ENVIRONMENT="sandbox"
IDENFY_BASE_URL="https://ivs.idenfy.com"

# Ngrok Configuration
ENABLE_NGROK="false"
NGROK_AUTH_TOKEN="your_ngrok_auth_token_here"
NGROK_REGION="us"
NGROK_SUBDOMAIN=""

# JWT Configuration
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS Configuration
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,https://identhor.com"
EOF
        fi
    else
        print_warning ".env file already exists"
    fi
}

# Function to setup ngrok
setup_ngrok() {
    print_status "Setting up ngrok for development webhook exposure..."
    
    # Check if ngrok is installed
    if ! command_exists ngrok; then
        print_warning "ngrok is not installed. Installing ngrok..."
        
        # Detect OS and install ngrok
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
            echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
            sudo apt update && sudo apt install ngrok
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install ngrok/ngrok/ngrok
        else
            print_error "Unsupported OS. Please install ngrok manually from https://ngrok.com/download"
            return 1
        fi
    fi
    
    print_success "ngrok is available"
    
    # Check if ngrok auth token is configured
    if [ -z "$NGROK_AUTH_TOKEN" ]; then
        print_warning "NGROK_AUTH_TOKEN not set. Please configure it in your .env file"
        print_status "You can get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    else
        print_success "ngrok auth token is configured"
    fi
}

# Function to start development services
start_dev_services() {
    print_status "Starting development services..."
    
    # Start core services (backend + database)
    print_status "Starting core services..."
    docker-compose up -d backend db redis
    
    # Start development services if ngrok is enabled
    if [ "$ENABLE_NGROK" = "true" ]; then
        print_status "Starting ngrok for webhook exposure..."
        docker-compose --profile development up -d ngrok
        
        # Wait for ngrok to start and get the public URL
        sleep 5
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null || echo "ngrok not ready")
        
        if [ "$NGROK_URL" != "ngrok not ready" ]; then
            print_success "ngrok is running at: $NGROK_URL"
            print_status "Update your iDenfy webhook URLs to use this ngrok URL:"
            print_status "  KYC: $NGROK_URL/api/v1/kyc/webhook/idenfy"
            print_status "  AML: $NGROK_URL/api/v1/aml/webhook/idenfy"
            print_status "  Documents: $NGROK_URL/api/v1/documents/webhook/idenfy"
        else
            print_warning "ngrok may not be ready yet. Check http://localhost:4040 for status"
        fi
    fi
    
    # Start email testing service
    print_status "Starting Mailhog for email testing..."
    docker-compose --profile development up -d mailhog
    
    print_success "Development services started"
}

# Function to show development URLs
show_dev_urls() {
    echo ""
    echo "============================================================================="
    echo "🚀 Development Environment URLs"
    echo "============================================================================="
    echo "Backend API:     http://localhost:3000/api/v1"
    echo "API Docs:        http://localhost:3000/api/docs"
    echo "Database:        localhost:5432"
    echo "Redis:           localhost:6379"
    echo "Mailhog (SMTP):  localhost:1025"
    echo "Mailhog (Web):   http://localhost:8025"
    
    if [ "$ENABLE_NGROK" = "true" ]; then
        echo "ngrok Web UI:    http://localhost:4040"
        echo "ngrok API:       http://localhost:4041"
    fi
    
    echo ""
    echo "============================================================================="
    echo "📋 Next Steps"
    echo "============================================================================="
    echo "1. Update apps/backend/.env with your actual configuration values"
    echo "2. Configure iDenfy webhooks using the ngrok URLs above"
    echo "3. Run 'npm install' in the project root to install dependencies"
    echo "4. Run 'npm run build' to build the backend"
    echo "5. Access the API documentation at http://localhost:3000/api/docs"
    echo ""
}

# Function to stop development services
stop_dev_services() {
    print_status "Stopping development services..."
    docker-compose down
    print_success "Development services stopped"
}

# Function to show logs
show_logs() {
    print_status "Showing logs for development services..."
    docker-compose logs -f
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup          Setup development environment (default)"
    echo "  start          Start development services"
    echo "  stop           Stop development services"
    echo "  logs           Show service logs"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Setup and start development environment"
    echo "  $0 start        # Start services only"
    echo "  $0 stop         # Stop services only"
    echo "  $0 logs         # Show logs"
}

# Main script logic
main() {
    print_status "Setting up KYC Attestation Platform development environment..."
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Setup environment
    setup_env
    setup_ngrok
    
    # Start services
    start_dev_services
    
    # Show URLs and next steps
    show_dev_urls
    
    print_success "Development environment setup complete!"
}

# Parse command line arguments
case "${1:-setup}" in
    "setup")
        main
        ;;
    "start")
        start_dev_services
        ;;
    "stop")
        stop_dev_services
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 