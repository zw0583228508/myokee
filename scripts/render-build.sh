#!/usr/bin/env bash
set -e

echo "=== Render build script ==="

# CRITICAL: force install of devDependencies (vite, esbuild, tsx, etc).
# Render sets NODE_ENV=production which makes pnpm skip devDependencies.
# We override here for the install phase only — runtime NODE_ENV stays production.
export NODE_ENV=development
export NPM_CONFIG_PRODUCTION=false

echo "--- Installing pnpm 9.15.4 ---"
npm install -g pnpm@9.15.4

echo "--- Installing dependencies (incl. devDependencies, no-frozen-lockfile) ---"
pnpm install --no-frozen-lockfile --prod=false --config.strict-dep-builds=false --config.dangerously-allow-all-builds=true || {
  echo "pnpm install exited non-zero, retrying with --ignore-scripts..."
  pnpm install --no-frozen-lockfile --prod=false --ignore-scripts || true
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
