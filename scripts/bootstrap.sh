#!/usr/bin/env bash
set -euo pipefail

show_help() {
  cat <<'USAGE'
Usage: bootstrap.sh [--skip-containers] [--ci]

Prepares the repository for local development by ensuring configuration files
exist and optionally starting supporting services defined in docker-compose.yml.

Options:
  --skip-containers   Do not attempt to start Docker services.
  --ci                Alias for --skip-containers, used by automation.
  -h, --help          Display this help message.
USAGE
}

SKIP_CONTAINERS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-containers)
      SKIP_CONTAINERS=true
      ;;
    --ci)
      SKIP_CONTAINERS=true
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
CONFIG_TEMPLATE="$ROOT_DIR/infrastructure/storage/config.example.yml"
CONFIG_FILE="$ROOT_DIR/infrastructure/storage/config.yml"

if [[ -f "$CONFIG_TEMPLATE" && ! -f "$CONFIG_FILE" ]]; then
  cp "$CONFIG_TEMPLATE" "$CONFIG_FILE"
  echo "Created infrastructure/storage/config.yml from template."
else
  echo "Configuration template already applied or missing."
fi

if [[ "$SKIP_CONTAINERS" == true ]]; then
  echo "Skipping Docker container startup."
  exit 0
fi

COMPOSE_CMD=""
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
fi

if [[ -z "$COMPOSE_CMD" ]]; then
  echo "Docker Compose is not installed; skipping container startup."
  exit 0
fi

echo "Pulling infrastructure images..."
$COMPOSE_CMD pull db redis kafka zookeeper >/dev/null 2>&1 || true

echo "Starting core infrastructure services (db, redis, kafka, zookeeper)..."
$COMPOSE_CMD up -d db redis zookeeper kafka

echo "Bootstrap complete. Use 'docker compose up' to start application containers."
