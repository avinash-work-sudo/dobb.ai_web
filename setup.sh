#!/bin/bash

echo "🚀 Setting up dobb.ai AI Test Automation..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js $(node -v) detected"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Set up backend
echo "📦 Setting up backend..."
cd backend

# Install backend dependencies
npm install
if [ $? -eq 0 ]; then
    print_status "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install
if [ $? -eq 0 ]; then
    print_status "Playwright browsers installed"
else
    print_warning "Playwright browser installation failed, but continuing..."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p artifacts/screenshots
mkdir -p artifacts/reports
mkdir -p database
print_status "Directories created"

# Create environment file from example
if [ ! -f .env ]; then
    echo "⚙️  Creating environment configuration..."
    cat > .env << EOL
# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Midscene Configuration
MIDSCENE_MODEL_PROVIDER=ui-tars
MIDSCENE_MODEL_ENDPOINT=your-ui-tars-endpoint
OPENAI_API_KEY=your-openai-key-if-using-openai

# Browser Configuration
DEFAULT_HEADLESS=false
BROWSER_TIMEOUT=30000

# Storage Configuration
ARTIFACTS_PATH=./artifacts
DATABASE_PATH=./database/test-results.db
EOL
    print_status "Environment file created (.env)"
    print_warning "Please edit backend/.env with your API keys and endpoints"
else
    print_status "Environment file already exists"
fi

cd ..

# Create start script
echo "📝 Creating startup scripts..."
cat > start.sh << 'EOL'
#!/bin/bash

echo "🚀 Starting dobb.ai AI Test Automation..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Kill existing processes on ports 3001 and 5173
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start backend
print_info "Starting backend server on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
print_info "Starting frontend server on port 5173..."
npm run dev &
FRONTEND_PID=$!

# Wait a bit and check if processes are running
sleep 5

if kill -0 $BACKEND_PID 2>/dev/null; then
    print_status "Backend server started (PID: $BACKEND_PID)"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

if kill -0 $FRONTEND_PID 2>/dev/null; then
    print_status "Frontend server started (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend server failed to start"
    exit 1
fi

print_status "🎉 Setup complete!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo "❤️  Health:   http://localhost:3001/health"
echo ""
print_info "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap 'echo ""; echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
wait
EOL

chmod +x start.sh
print_status "Startup script created (start.sh)"

# Create development script
cat > dev.sh << 'EOL'
#!/bin/bash

# Development mode with additional logging
export DEBUG=midscene:*
export NODE_ENV=development

echo "🔧 Starting in development mode with debug logging..."

# Start backend with nodemon for auto-reload
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start frontend
npm run dev &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
wait
EOL

chmod +x dev.sh
print_status "Development script created (dev.sh)"

# Summary
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. Run './start.sh' to start both servers"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "🔧 Available commands:"
echo "  ./start.sh  - Start production mode"
echo "  ./dev.sh    - Start development mode"
echo ""
echo "📚 Documentation:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  See backend/README.md"
echo ""
print_status "Happy automating! 🤖"


