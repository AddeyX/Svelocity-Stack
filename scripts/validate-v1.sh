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
	if [[ -z "${PUBLIC_CONVEX_URL:-}" ]]; then
		echo "RUN_E2E=1 requires a live Convex backend." >&2
		echo "Start one:  CONVEX_AGENT_MODE=anonymous pnpm --filter @svelocity/backend dev" >&2
		echo "Then:       PUBLIC_CONVEX_URL=http://127.0.0.1:3210 RUN_E2E=1 pnpm validate:v1" >&2
		exit 1
	fi
	results_file="$(mktemp -t playwright-results.XXXXXX.json)"
	PLAYWRIGHT_JSON_OUTPUT_FILE="$results_file" CI=1 pnpm --filter web test:e2e
	# tasks.spec.ts self-skips without a reachable backend; a skipped suite must
	# not count as a green gate (mirrors the CI anti-silent-skip guard).
	RESULTS_FILE="$results_file" node - <<-'EOF'
		const { readFileSync } = require('node:fs');
		const report = JSON.parse(readFileSync(process.env.RESULTS_FILE, 'utf8'));
		const { expected = 0, unexpected = 0, flaky = 0, skipped = 0 } = report.stats ?? {};
		const executed = expected + unexpected + flaky;
		console.log(`Playwright stats: expected=${expected} unexpected=${unexpected} flaky=${flaky} skipped=${skipped}`);
		if (executed === 0 || skipped > 0) {
			console.error('E2E suite did not fully execute — gate failed.');
			process.exit(1);
		}
	EOF
else
	step "E2E skipped (set RUN_E2E=1 to include)"
fi

echo ""
echo "=================================================="
echo "  VALIDATE V1: PASS — all gates green"
echo "=================================================="
