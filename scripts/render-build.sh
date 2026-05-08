#!/usr/bin/env bash
set -e

echo "=== Render build script ==="

echo "--- Installing pnpm 9.15.4 ---"
npm install -g pnpm@9.15.4

echo "--- Installing dependencies (no-frozen-lockfile, tolerating ignored builds) ---"
pnpm install --no-frozen-lockfile --config.strict-dep-builds=false --config.dangerously-allow-all-builds=true || {
  echo "pnpm install exited non-zero, retrying without strict checks..."
  pnpm install --no-frozen-lockfile --ignore-scripts || true
}

echo "--- Rebuilding esbuild explicitly ---"
pnpm rebuild esbuild || true

echo "--- Verifying vite is installed ---"
if [ ! -f "artifacts/karaoke-app/node_modules/.bin/vite" ]; then
  echo "vite missing in karaoke-app — running install again without lockfile freeze"
  pnpm install --no-frozen-lockfile --ignore-scripts
  pnpm rebuild esbuild || true
fi

echo "--- Building karaoke-app ---"
pnpm --filter @workspace/karaoke-app run build

echo "--- Building api-server ---"
pnpm --filter @workspace/api-server run build

echo "=== Build complete ==="
