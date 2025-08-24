#!/bin/bash

# ngrok Testing Script
# This script helps test ngrok functionality and verify the tunnel is working

set -e

echo "🧪 ngrok Testing Script"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "error" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "info" ]; then
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

# Check if ngrok is running
check_ngrok_running() {
    echo -e "\n${BLUE}🔍 Checking if ngrok is running...${NC}"
    
    if pgrep -f "ngrok" > /dev/null; then
        print_status "success" "ngrok process is running"
        return 0
    else
        print_status "error" "ngrok process is not running"
        return 1
    fi
}

# Check ngrok dashboard
check_ngrok_dashboard() {
    echo -e "\n${BLUE}🌐 Checking ngrok dashboard...${NC}"
    
    if curl -s http://localhost:4040 > /dev/null; then
        print_status "success" "ngrok dashboard is accessible at http://localhost:4040"
        echo -e "${BLUE}   Open http://localhost:4040 in your browser to see tunnel status${NC}"
        return 0
    else
        print_status "error" "ngrok dashboard is not accessible at http://localhost:4040"
        return 1
    fi
}

# Get ngrok public URL
get_ngrok_url() {
    echo -e "\n${BLUE}🔗 Getting ngrok public URL...${NC}"
    
    # Try to get URL from ngrok API
    if curl -s http://localhost:4040/api/tunnels > /dev/null; then
        local url=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$url" ]; then
            print_status "success" "ngrok public URL: $url"
            echo "$url" > .ngrok_url
            return 0
        else
            print_status "warning" "Could not extract ngrok URL from API response"
            return 1
        fi
    else
        print_status "error" "Could not access ngrok API"
        return 1
    fi
}

# Test public access
test_public_access() {
    local url=$1
    if [ -z "$url" ]; then
        print_status "error" "No ngrok URL provided for testing"
        return 1
    fi
    
    echo -e "\n${BLUE}🌍 Testing public access to ngrok tunnel...${NC}"
    
    # Test basic connectivity
    if curl -s --max-time 10 "$url" > /dev/null; then
        print_status "success" "ngrok tunnel is publicly accessible"
        return 0
    else
        print_status "error" "ngrok tunnel is not publicly accessible"
        return 1
    fi
}

# Test backend health endpoint
test_backend_health() {
    local url=$1
    if [ -z "$url" ]; then
        print_status "error" "No ngrok URL provided for testing"
        return 1
    fi
    
    echo -e "\n${BLUE}🏥 Testing backend health endpoint...${NC}"
    
    local health_url="$url/api/health"
    if curl -s --max-time 10 "$health_url" > /dev/null; then
        print_status "success" "Backend health endpoint is accessible: $health_url"
        return 0
    else
        print_status "error" "Backend health endpoint is not accessible: $health_url"
        return 1
    fi
}

# Test webhook endpoint
test_webhook_endpoint() {
    local url=$1
    if [ -z "$url" ]; then
        print_status "error" "No ngrok URL provided for testing"
        return 1
    fi
    
    echo -e "\n${BLUE}🔗 Testing webhook endpoint...${NC}"
    
    local webhook_url="$url/api/v1/webhooks/idenfy"
    if curl -s --max-time 10 "$webhook_url" > /dev/null; then
        print_status "success" "Webhook endpoint is accessible: $webhook_url"
        return 0
    else
        print_status "error" "Webhook endpoint is not accessible: $webhook_url"
        return 1
    fi
}

# Test with sample webhook
test_sample_webhook() {
    local url=$1
    if [ -z "$url" ]; then
        print_status "error" "No ngrok URL provided for testing"
        return 1
    fi
    
    echo -e "\n${BLUE}📡 Testing sample webhook delivery...${NC}"
    
    local webhook_url="$url/api/v1/webhooks/idenfy"
    local sample_payload='{"type":"TEST","timestamp":"2024-01-15T10:30:00Z","message":"Test webhook"}'
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "X-Test-Webhook: true" \
        -d "$sample_payload" \
        --max-time 10 \
        "$webhook_url")
    
    if [ $? -eq 0 ]; then
        print_status "success" "Sample webhook delivered successfully"
        echo -e "${BLUE}   Response: $response${NC}"
        return 0
    else
        print_status "error" "Failed to deliver sample webhook"
        return 1
    fi
}

# Main testing function
main() {
    echo -e "\n${BLUE}🚀 Starting ngrok testing...${NC}"
    
    local tests_passed=0
    local total_tests=0
    
    # Test 1: Check if ngrok is running
    total_tests=$((total_tests + 1))
    if check_ngrok_running; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Test 2: Check ngrok dashboard
    total_tests=$((total_tests + 1))
    if check_ngrok_dashboard; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Test 3: Get ngrok URL
    total_tests=$((total_tests + 1))
    if get_ngrok_url; then
        tests_passed=$((tests_passed + 1))
        local ngrok_url=$(cat .ngrok_url 2>/dev/null || echo "")
        
        # Test 4: Test public access
        total_tests=$((total_tests + 1))
        if test_public_access "$ngrok_url"; then
            tests_passed=$((tests_passed + 1))
        fi
        
        # Test 5: Test backend health
        total_tests=$((total_tests + 1))
        if test_backend_health "$ngrok_url"; then
            tests_passed=$((tests_passed + 1))
        fi
        
        # Test 6: Test webhook endpoint
        total_tests=$((total_tests + 1))
        if test_webhook_endpoint "$ngrok_url"; then
            tests_passed=$((tests_passed + 1))
        fi
        
        # Test 7: Test sample webhook
        total_tests=$((total_tests + 1))
        if test_sample_webhook "$ngrok_url"; then
            tests_passed=$((tests_passed + 1))
        fi
    fi
    
    # Summary
    echo -e "\n${BLUE}📊 Test Summary${NC}"
    echo "=================="
    echo -e "${GREEN}Tests Passed: $tests_passed${NC}"
    echo -e "${RED}Tests Failed: $((total_tests - tests_passed))${NC}"
    echo -e "${BLUE}Total Tests: $total_tests${NC}"
    
    if [ $tests_passed -eq $total_tests ]; then
        echo -e "\n${GREEN}🎉 All tests passed! ngrok is working correctly.${NC}"
        echo -e "${BLUE}   Your ngrok URL is: $(cat .ngrok_url 2>/dev/null || echo 'Not available')${NC}"
        echo -e "${BLUE}   Use this URL for iDenfy webhook configuration.${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
        echo -e "${BLUE}   Make sure ngrok is running and your backend is accessible.${NC}"
    fi
    
    # Cleanup
    rm -f .ngrok_url
}

# Run main function
main "$@" 