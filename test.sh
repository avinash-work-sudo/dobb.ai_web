#!/bin/bash

# Quick test script for AI automation system
echo "🧪 AI Automation System - Quick Test Script"
echo "============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo ""
print_info "Step 1: Testing server connectivity..."

# Test backend health
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend server is running on port 3001"
else
    print_error "Backend server not responding. Try: ./start.sh"
    exit 1
fi

# Test frontend
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    print_success "Frontend server is running on port 5173"
else
    print_warning "Frontend server not responding. Check if it's starting up..."
fi

echo ""
print_info "Step 2: Testing automation API..."

# Test automation endpoint
RESPONSE=$(curl -s -X POST http://localhost:3001/api/automation/run \
  -H "Content-Type: application/json" \
  -d '{"task": "Navigate to https://example.com", "framework": "playwright", "options": {"headless": true}}' \
  2>/dev/null)

if echo "$RESPONSE" | grep -q "executionId"; then
    print_success "Automation API is working!"
    EXECUTION_ID=$(echo "$RESPONSE" | grep -o '"executionId":"[^"]*"' | cut -d'"' -f4)
    print_info "Test execution ID: $EXECUTION_ID"
else
    print_warning "Automation API test incomplete. Try manual testing in browser."
fi

echo ""
print_info "Step 3: Testing frameworks..."

# Check if Playwright is available
if cd backend && node -e "require('playwright')" 2>/dev/null; then
    print_success "Playwright is installed"
else
    print_warning "Playwright may need installation: cd backend && npx playwright install"
fi

# Check if Puppeteer is available  
if cd backend && node -e "require('puppeteer')" 2>/dev/null; then
    print_success "Puppeteer is installed"
else
    print_warning "Puppeteer installation may be incomplete"
fi

cd ..

echo ""
print_info "Step 4: Manual testing guide..."
echo ""
echo "🌐 Open in browser: http://localhost:5173"
echo "📋 Navigate to: Dashboard"
echo "🤖 Try these test cases:"
echo ""
echo "   Beginner Tests:"
echo "   • 'Navigate to https://example.com'"
echo "   • 'Go to Google'"
echo "   • 'Visit https://httpbin.org'"
echo ""
echo "   Intermediate Tests:"
echo "   • 'Navigate to Google and search for artificial intelligence'"
echo "   • 'Go to GitHub and click on Explore'"
echo "   • 'Visit news.ycombinator.com and click on the first story'"
echo ""
echo "   Advanced Tests:"
echo "   • 'Navigate to a demo shopping site, browse products'"
echo "   • 'Go to a form testing site and fill out a contact form'"
echo "   • 'Visit Wikipedia, search for React, and click on the first result'"
echo ""

print_info "Step 5: What to expect..."
echo ""
echo "✅ Success indicators:"
echo "   • Browser window opens (if headless=false)"
echo "   • Real-time progress updates in the UI"
echo "   • Screenshots appear in the results"
echo "   • HTML report is generated"
echo "   • No error messages"
echo ""
echo "❌ Potential issues:"
echo "   • 'Browser automation fails' - Run: cd backend && npx playwright install"
echo "   • 'AI model not responding' - Check .env configuration"
echo "   • 'WebSocket errors' - Refresh the browser page"
echo "   • 'Timeout errors' - Try simpler tasks first"
echo ""

echo "🎉 Ready to test! Open http://localhost:5173 and click Dashboard!"
echo ""
print_info "For detailed testing scenarios, see: TESTING_GUIDE.md"

