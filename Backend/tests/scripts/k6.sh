#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
set -a
[ -f .tokens.env ] && . ./.tokens.env
[ -f .env ] && . ./.env
set +a
exec k6 "$@"