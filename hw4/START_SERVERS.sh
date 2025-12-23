#!/bin/bash

# Japan Trip Planner - Start Script

echo "🚀 Starting Japan Trip Planner..."

# Kill existing processes on ports 3000 and 5173
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start backend
echo "📦 Starting backend server..."
cd backend && npm run dev > ../backend.log 2>&1 &

# Wait a bit
sleep 3

# Start frontend
echo "📦 Starting frontend server..."
cd ../frontend && npm run dev > ../frontend.log 2>&1 &

# Wait for servers to start
sleep 5

echo ""
echo "✅ Servers started!"
echo ""
echo "📍 Backend:  http://localhost:3000"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "📊 Logs:"
echo "   - backend.log"
echo "   - frontend.log"
echo ""
echo "Press Ctrl+C to stop all servers"

# Open browser
open http://localhost:5173

# Wait for user interrupt
wait
