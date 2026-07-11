#!/usr/bin/env bash
# Pre-release validation gauntlet (Phase 8 §8.11).
# Run from the repo root: pnpm validate:v1
# Include the Playwright e2e suite: RUN_E2E=1 pnpm validate:v1

set -euo pipefail

cd "$(dirname "$0")/.."

step() {
	echo ""
	echo "==> $1"
}

step "Install (frozen lockfile)"
pnpm install --frozen-lockfile

step "Validate manifest"
pnpm validate:manifest

step "Typecheck (pnpm -r check)"
pnpm -r check

step "Lint (eslint + prettier)"
pnpm lint

step "Unit tests (pnpm -r test)"
pnpm -r test

step "Build (pnpm -r build)"
pnpm -r build

step "Doctor (build CLI, run against this repo)"
pnpm --filter create-svelocity build
node packages/create-svelocity/dist/cli.js doctor

if [[ "${RUN_E2E:-0}" == "1" ]]; then
	step "E2E (Playwright, web)"
	pnpm --filter web test:e2e
else
	step "E2E skipped (set RUN_E2E=1 to include)"
fi

echo ""
echo "=================================================="
echo "  VALIDATE V1: PASS — all gates green"
echo "=================================================="
