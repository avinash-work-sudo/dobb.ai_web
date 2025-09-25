#!/bin/bash

echo "🚀 Starting Weave & Know AI Test Automation..."

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


