#!/bin/bash

# Configuration script for Weave & Know AI Test Automation
echo "🔧 Configuring Weave & Know AI Test Automation Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo ""
echo "🤖 Which AI provider would you like to use?"
echo "1) OpenAI (GPT-4) - Recommended for production, requires API key"
echo "2) UI-TARS - Free, open source, specialized for UI automation"  
echo "3) Mock/Development - For testing without AI (limited functionality)"
echo ""
read -p "Enter your choice (1-3): " ai_choice

echo ""
echo "🌐 Browser configuration:"
echo "1) Headed mode (you can see the browser - good for debugging)"
echo "2) Headless mode (faster, no browser window - good for CI/CD)"
echo ""
read -p "Enter your choice (1-2): " browser_choice

# Set browser mode
if [ "$browser_choice" = "2" ]; then
    HEADLESS_MODE="true"
    SLOW_MO="0"
    print_info "Browser will run in headless mode"
else
    HEADLESS_MODE="false"
    SLOW_MO="100"
    print_info "Browser will run in headed mode with slow motion"
fi

# Configure AI provider
case $ai_choice in
    1)
        echo ""
        print_info "OpenAI Configuration Selected"
        echo "You'll need an OpenAI API key from: https://platform.openai.com/"
        echo ""
        read -p "Enter your OpenAI API key (or press Enter to configure later): " openai_key
        
        if [ -z "$openai_key" ]; then
            openai_key="your-openai-api-key-here"
            print_warning "You'll need to add your OpenAI API key later in backend/.env"
        else
            print_success "OpenAI API key configured"
        fi
        
        MODEL_PROVIDER="openai"
        ;;
    2)
        echo ""
        print_info "UI-TARS Configuration Selected"
        echo "Default endpoint: http://localhost:8000/v1"
        echo ""
        read -p "Enter UI-TARS endpoint (or press Enter for default): " uitars_endpoint
        
        if [ -z "$uitars_endpoint" ]; then
            uitars_endpoint="http://localhost:8000/v1"
        fi
        
        MODEL_PROVIDER="ui-tars"
        openai_key="not-required-for-uitars"
        print_info "UI-TARS endpoint: $uitars_endpoint"
        ;;
    3)
        MODEL_PROVIDER="mock"
        openai_key="mock-mode-no-key-needed"
        uitars_endpoint="mock-mode"
        print_info "Mock mode selected - limited functionality for testing"
        ;;
    *)
        print_error "Invalid choice. Using OpenAI as default."
        MODEL_PROVIDER="openai"
        openai_key="your-openai-api-key-here"
        ;;
esac

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "please-generate-a-random-jwt-secret")

# Create the .env file
ENV_FILE="backend/.env"
print_info "Creating $ENV_FILE..."

cat > "$ENV_FILE" << EOL
# ===========================================
# Weave & Know AI Test Automation Configuration
# Generated on $(date)
# ===========================================

# Server Configuration
# --------------------
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# AI Model Configuration
# ----------------------
MIDSCENE_MODEL_PROVIDER=$MODEL_PROVIDER
EOL

# Add provider-specific configuration
case $MODEL_PROVIDER in
    "openai")
        cat >> "$ENV_FILE" << EOL

# OpenAI Configuration
# -------------------
OPENAI_API_KEY=$openai_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
EOL
        ;;
    "ui-tars")
        cat >> "$ENV_FILE" << EOL

# UI-TARS Configuration
# --------------------
UI_TARS_ENDPOINT=$uitars_endpoint
UI_TARS_API_KEY=optional-if-required
EOL
        ;;
    "mock")
        cat >> "$ENV_FILE" << EOL

# Mock Configuration (for testing)
# --------------------------------
MOCK_RESPONSES=true
EOL
        ;;
esac

# Add common configuration
cat >> "$ENV_FILE" << EOL

# Browser Configuration
# ---------------------
DEFAULT_HEADLESS=$HEADLESS_MODE
BROWSER_TIMEOUT=30000
SLOW_MO=$SLOW_MO

# Storage Configuration
# --------------------
ARTIFACTS_PATH=./artifacts
DATABASE_PATH=./database/test-results.db

# Logging Configuration
# --------------------
LOG_LEVEL=info
DEBUG=midscene:*

# Security Configuration
# ----------------------
JWT_SECRET=$JWT_SECRET
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOL

print_success "Environment configuration created!"

# Show configuration summary
echo ""
echo "📋 Configuration Summary:"
echo "========================"
echo "AI Provider: $MODEL_PROVIDER"
echo "Browser Mode: $([ "$HEADLESS_MODE" = "true" ] && echo "Headless" || echo "Headed with debugging")"
echo "Backend Port: 3001"
echo "Frontend Port: 5173"

case $MODEL_PROVIDER in
    "openai")
        echo "OpenAI Model: gpt-4o"
        if [ "$openai_key" = "your-openai-api-key-here" ]; then
            print_warning "⚠️  Remember to add your OpenAI API key to backend/.env"
        fi
        ;;
    "ui-tars")
        echo "UI-TARS Endpoint: $uitars_endpoint"
        print_info "Make sure UI-TARS server is running on the configured endpoint"
        ;;
    "mock")
        print_warning "Mock mode - limited automation functionality"
        ;;
esac

echo ""
echo "🔧 Next Steps:"
echo "1. Edit backend/.env if you need to make changes"
echo "2. Run: ./start.sh"
echo "3. Open: http://localhost:5173"
echo "4. Go to Dashboard and test automation!"
echo ""

# Verify configuration
if [ "$MODEL_PROVIDER" = "openai" ] && [ "$openai_key" = "your-openai-api-key-here" ]; then
    print_warning "Configuration incomplete - add your OpenAI API key to start automating"
else
    print_success "Configuration complete - ready to start!"
fi

echo ""
print_info "For detailed configuration options, see: ENVIRONMENT_SETUP.md"

