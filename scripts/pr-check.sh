#!/usr/bin/env bash
set -uo pipefail

# ============================================================
# AIQUAA PR Safety Check
# Run before opening a PR: pnpm pr-check
# ============================================================

FAILURES=0
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

step() { echo ""; echo "━━━ $1 ━━━"; }
ok()   { echo "  ✓ PASS: $1"; }
err()  { echo "  ✗ FAIL: $1"; FAILURES=$((FAILURES+1)); }
run()  {
  local label="$1"; shift
  local start=$SECONDS
  if "$@"; then
    echo "  ✓ PASS [$((SECONDS - start))s]: $label"
  else
    echo "  ✗ FAIL [$((SECONDS - start))s]: $label"
    FAILURES=$((FAILURES+1))
  fi
}

step "1. SECURITY AUDIT"
pnpm audit --audit-level=high || true

step "2. LINT"
run "lint" pnpm lint

step "3. TYPE CHECK"
run "type-check" pnpm type-check

step "4. UNIT TESTS + COVERAGE"
run "allpairs-core" pnpm --filter @aiquaa/allpairs-core test:cov
run "backend"        pnpm --filter @aiquaa/backend test:cov
run "frontend"       pnpm --filter @aiquaa/frontend test:cov

step "5. CONTRACT TESTS"
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  run "contracts" pnpm test:contract
else
  echo "  SKIP: Docker no disponible — iniciar Docker Desktop para incluir contract tests"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$FAILURES" -eq 0 ]; then
  echo "  ✓ TODO BIEN — listo para abrir PR"
  exit 0
else
  echo "  ✗ $FAILURES FALLO(S) — corregir antes del PR"
  exit 1
fi
