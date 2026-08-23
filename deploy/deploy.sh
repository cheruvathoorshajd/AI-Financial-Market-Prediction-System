#!/usr/bin/env bash
# Redeploy Fluxus Fisci on the EC2 box: pull latest, rebuild, restart.
# Run this after the one-time setup, and again for every future update.
set -euo pipefail

APP="${APP:-/home/ec2-user/Fluxus_Fisci}"
cd "$APP"

echo "==> sync to origin/main (hard reset — discards any local drift; .env/db are git-ignored so untouched)"
git fetch origin
git reset --hard origin/main

echo "==> backend deps"
cd "$APP/backend"
[ -d venv ] || python3.11 -m venv venv
./venv/bin/pip install -q --upgrade pip
./venv/bin/pip install -q -r requirements.txt

# Optional ML extras (torch → experimental LSTM outlook). Installed only on boxes
# that opted in with a backend/.enable-ml marker (needs >=2 GB RAM, e.g. t3.small).
# The marker is git-ignored, so it persists across deploys and never lands in the repo.
if [ -f .enable-ml ]; then
  echo "==> ML extras (torch/LSTM) — .enable-ml present"
  ./venv/bin/pip install -q -r requirements-ml.txt
fi

echo "==> frontend build (relative /api/v1 → same-origin via Caddy)"
cd "$APP/frontend"
npm ci
REACT_APP_API_URL=/api/v1 CI=false NODE_OPTIONS=--max-old-space-size=1024 npm run build

echo "==> restart services"
sudo systemctl restart fluxus-backend
sudo systemctl reload caddy 2>/dev/null || sudo systemctl restart caddy

echo "==> done — https://<your-domain> should be live"
