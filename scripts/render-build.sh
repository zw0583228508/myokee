#!/usr/bin/env bash
set -e

echo "=== Render build script ==="

echo "--- Installing pnpm 9.15.4 ---"
npm install -g pnpm@9.15.4

echo "--- Installing dependencies (tolerating ignored builds) ---"
pnpm install --config.strict-dep-builds=false --config.dangerously-allow-all-builds=true || {
  echo "pnpm install exited non-zero (likely ignored builds), continuing..."
}

echo "--- Rebuilding esbuild explicitly ---"
pnpm rebuild esbuild || true

echo "--- Building karaoke-app ---"
pnpm --filter @workspace/karaoke-app run build

echo "--- Building api-server ---"
pnpm --filter @workspace/api-server run build

echo "=== Build complete ==="
