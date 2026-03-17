#!/usr/bin/env bash
set -euo pipefail

MAIN_PORT="${PORT:-8080}"
PROCESSOR_PORT=8000
MOBILE_PORT=3001

echo "=== VocalShift starting production services ==="

# ── 1. Karaoke Processor (FastAPI + ML models) ────────────────────────────
echo "[1/3] Starting Karaoke Processor on port ${PROCESSOR_PORT}..."
PORT=${PROCESSOR_PORT} python3 artifacts/karaoke-processor/main.py &
PROCESSOR_PID=$!

# ── 2. Expo Mobile Web Server ─────────────────────────────────────────────
echo "[2/3] Starting Expo mobile web server on port ${MOBILE_PORT}..."
PORT=${MOBILE_PORT} BASE_PATH=/mobile/ \
  pnpm --filter @workspace/karaoke-mobile run serve &
MOBILE_PID=$!

# ── Wait until Karaoke Processor is healthy ───────────────────────────────
echo "Waiting for Karaoke Processor to become ready..."
MAX_WAIT=120
ELAPSED=0
until curl -sf "http://localhost:${PROCESSOR_PORT}/processor/health" > /dev/null 2>&1; do
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "ERROR: Karaoke Processor did not start within ${MAX_WAIT}s"
    kill $PROCESSOR_PID $MOBILE_PID 2>/dev/null || true
    exit 1
  fi
done
echo "Karaoke Processor is ready."

# ── 3. API Server (main gateway on $PORT) ────────────────────────────────
echo "[3/3] Starting API Server on port ${MAIN_PORT}..."
NODE_ENV=production PORT=${MAIN_PORT} \
  node artifacts/api-server/dist/index.cjs &
API_PID=$!

# ── Trap SIGTERM / SIGINT to gracefully shut down all children ─────────────
cleanup() {
  echo "Shutting down all services..."
  kill $PROCESSOR_PID $MOBILE_PID $API_PID 2>/dev/null || true
  wait $PROCESSOR_PID $MOBILE_PID $API_PID 2>/dev/null || true
  echo "All services stopped."
}
trap cleanup SIGTERM SIGINT

echo "=== All services running. PID: Processor=${PROCESSOR_PID}, Mobile=${MOBILE_PID}, API=${API_PID} ==="

# Wait for any process to exit; restart is handled by the vm runtime
wait -n $PROCESSOR_PID $MOBILE_PID $API_PID || true
echo "A service exited — initiating shutdown."
cleanup
