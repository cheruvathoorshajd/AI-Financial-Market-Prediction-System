#!/usr/bin/env bash
# Redeploy Fluxus Fisci on the EC2 box: pull latest, rebuild, restart.
# Run this after the one-time setup, and again for every future update.
set -euo pipefail

APP="${APP:-/home/ec2-user/Fluxus_Fisci}"
cd "$APP"

echo "==> git pull"
git pull --ff-only

echo "==> backend deps"
cd "$APP/backend"
[ -d venv ] || python3.11 -m venv venv
./venv/bin/pip install -q --upgrade pip
./venv/bin/pip install -q -r requirements.txt

echo "==> frontend build (relative /api/v1 → same-origin via Caddy)"
cd "$APP/frontend"
npm ci
REACT_APP_API_URL=/api/v1 CI=false NODE_OPTIONS=--max-old-space-size=1024 npm run build

echo "==> restart services"
sudo systemctl restart fluxus-backend
sudo systemctl reload caddy 2>/dev/null || sudo systemctl restart caddy

echo "==> done — https://<your-domain> should be live"
