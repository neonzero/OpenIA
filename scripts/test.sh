#!/usr/bin/env bash
set -euo pipefail

show_help() {
  cat <<'USAGE'
Usage: test.sh [--ci]

Runs lightweight validation checks used for CI and local development.
  --ci    Enable CI-friendly defaults (skip Docker-based checks that require services).
  -h      Display this help message.
USAGE
}

CI_MODE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ci)
      CI_MODE=true
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      show_help
      exit 1
      ;;
  esac
  shift
done

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "==> Checking shell scripts syntax"
bash -n "$ROOT_DIR/scripts/bootstrap.sh"
bash -n "$ROOT_DIR/scripts/test.sh"

echo "==> Compiling Python storage stubs"
if command -v python3 >/dev/null 2>&1; then
  python3 -m compileall "$ROOT_DIR/infrastructure/storage"
else
  echo "python3 is not available; skipping Python compilation."
fi

echo "==> Validating docker-compose configuration"
COMPOSE_CMD=""
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
fi

if [[ -n "$COMPOSE_CMD" ]]; then
  if [[ "$CI_MODE" == true ]]; then
    $COMPOSE_CMD config -q
  else
    $COMPOSE_CMD config
  fi
else
  echo "Docker Compose not found; skipping Compose validation."
fi

echo "==> Dry-run database migrations"
PSQL_BIN=$(command -v psql 2>/dev/null || true)
if [[ -n "${DATABASE_URL:-}" && -n "$PSQL_BIN" ]]; then
  for migration in "$ROOT_DIR"/infrastructure/migrations/*.sql; do
    echo "Checking $migration"
    "$PSQL_BIN" "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration" >/dev/null
  done
else
  echo "DATABASE_URL not set or psql unavailable; skipped migration execution."
fi

echo "All checks completed."
