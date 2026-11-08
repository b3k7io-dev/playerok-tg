#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi
if [ -z "$BOT_TOKEN" ] || [ "$BOT_TOKEN" = "YOUR_BOT_TOKEN" ]; then
  echo "BOT_TOKEN не задан. Создайте .env с BOT_TOKEN=..." >&2
  exit 1
fi
python bot.py
