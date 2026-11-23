#!/usr/bin/env bash
# Start the Teleios production server (standalone build) on port 3000.
# Self-heals: regenerates SESSION_SECRET in .env if the sandbox recycle wiped it.
# Assumes the standalone build already exists (run `npm run build` after code changes).
set -u
cd /home/z/my-project

grep -q "^SESSION_SECRET=" .env 2>/dev/null || echo "SESSION_SECRET=$(openssl rand -base64 48)" >> .env

pkill -f "standalone/server.js" 2>/dev/null
sleep 1

set -a; . ./.env; set +a
nohup env NODE_ENV=production PORT=3000 bun .next/standalone/server.js > server.log 2>&1 &

for i in $(seq 1 10); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)
  [ "$code" = "200" ] && { echo "server ready on http://localhost:3000 (HTTP $code)"; exit 0; }
  sleep 2
done
echo "server did not become ready — check server.log"; tail -5 server.log; exit 1
