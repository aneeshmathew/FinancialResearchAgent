#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "Starting Autonomous Market & Financial Research Dashboard"
echo "=========================================================="

# Trap SIGINT to terminate all background child processes on Ctrl+C
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# Check if the sibling backend repository exists locally
if [ -d "../FinancialResearchAgent_Backend" ]; then
  echo "-> Detected local backend at ../FinancialResearchAgent_Backend"
  echo "-> Starting Backend API on http://localhost:8000..."
  (
    cd ../FinancialResearchAgent_Backend
    if [ -f ".venv/bin/activate" ]; then
      source .venv/bin/activate
    fi
    PYTHONPATH=. uvicorn app.main:app --reload --port 8000
  ) &
fi

# Start Next.js Frontend
echo "-> Starting Next.js Frontend on http://localhost:3000..."
npm run dev &

echo "=========================================================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000 (if local repo present)"
echo "Press Ctrl+C to stop all servers."
echo "=========================================================="

wait
