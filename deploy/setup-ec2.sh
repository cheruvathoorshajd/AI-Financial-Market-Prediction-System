#!/usr/bin/env bash
# One-time system bootstrap for a fresh Amazon Linux 2023 (t2/t3.micro).
# Installs swap (so the React build doesn't OOM on 1 GB RAM), Python 3.11,
# Node, and Caddy. Run once, right after your first SSH in.
set -euo pipefail

echo "==> 2 GB swap (build headroom)"
if [ ! -f /swapfile ]; then
  sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "==> System packages"
sudo dnf update -y
sudo dnf install -y git python3.11 python3.11-pip nodejs npm

echo "==> Caddy (auto-HTTPS) via COPR"
sudo dnf install -y 'dnf-command(copr)'
sudo dnf copr enable -y @caddy/caddy
sudo dnf install -y caddy

echo "==> Done. node=$(node -v)  python=$(python3.11 --version)  caddy=$(caddy version | head -1)"
