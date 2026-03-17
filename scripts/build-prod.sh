#!/usr/bin/env bash
set -euo pipefail

echo "=== VocalShift production build ==="

echo "[1/3] Building React web app..."
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/karaoke-app run build

echo "[2/3] Building Expo mobile web app..."
EXPO_PUBLIC_DOMAIN="${REPLIT_INTERNAL_APP_DOMAIN:-$REPLIT_DEV_DOMAIN}" \
  pnpm --filter @workspace/karaoke-mobile run build

echo "[3/3] Compiling API server..."
pnpm --filter @workspace/api-server run build

echo "=== Build complete ==="
