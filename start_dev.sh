#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "Starting Autonomous Market & Financial Research Dashboard"
echo "=========================================================="

# Trap SIGINT to kill background processes on Ctrl+C
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# 1. Start FastAPI Backend
echo "-> Starting Backend API on http://localhost:8000..."
cd backend
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Start Next.js Frontend
echo "-> Starting Next.js Frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "=========================================================="
echo "Backend:  http://localhost:8000 (Docs: http://localhost:8000/docs)"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop all servers."
echo "=========================================================="

wait
