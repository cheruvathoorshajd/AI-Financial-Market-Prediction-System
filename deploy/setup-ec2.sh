#!/usr/bin/env bash
# One-time system bootstrap for a fresh Amazon Linux 2023 (t2/t3.micro).
# Installs swap (so the React build doesn't OOM on 1 GB RAM), Python 3.11, Node,
# and Caddy (+ its systemd unit). Run once, right after your first SSH in:
#   cd ~/Fluxus_Fisci && bash deploy/setup-ec2.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

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

echo "==> Caddy (auto-HTTPS) — official binary"
# NOTE: the @caddy/caddy COPR has no amazonlinux-2023 repo, so we install the
# official static binary instead (works on any distro).
case "$(uname -m)" in
  aarch64) CADDY_ARCH=arm64 ;;
  *)       CADDY_ARCH=amd64 ;;
esac
curl -fsSL -o /tmp/caddy "https://caddyserver.com/api/download?os=linux&arch=${CADDY_ARCH}"
sudo install -m 0755 /tmp/caddy /usr/bin/caddy
sudo mkdir -p /etc/caddy
# Install the systemd unit (runs as ec2-user so Caddy can read the build dir).
sudo cp "$SCRIPT_DIR/caddy.service" /etc/systemd/system/caddy.service
sudo systemctl daemon-reload

echo "==> Done."
echo "    node=$(node -v)  python=$(python3.11 --version)  caddy=$(caddy version | head -1)"
