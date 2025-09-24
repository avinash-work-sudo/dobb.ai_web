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
