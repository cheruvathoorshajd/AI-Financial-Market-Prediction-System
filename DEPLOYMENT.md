# Deploying Fluxus Fisci on AWS (EC2 + your domain)

A single **EC2 t3.micro** runs the whole app: FastAPI (uvicorn behind systemd)
and the React production build + the case study, all served by **Caddy** with
automatic HTTPS on **`fluxus-fisci.cheruvathoor.com`**. SQLite lives on the instance disk.

```
                      Internet
                         │  https://fluxus-fisci.cheruvathoor.com
                    ┌────▼─────┐
                    │  Caddy   │  :443 (auto Let's Encrypt), :80 (redirect + ACME)
                    ├──────────┴──────────────────────────┐
        /api/* ─────▶ reverse_proxy 127.0.0.1:8000 (uvicorn, systemd)
        /*     ─────▶ file_server  frontend/build  (React SPA + /case-study)
                    └─────────────────────────────────────┘
                        SQLite: backend/test.db (on the EBS volume)
```

> Using a subdomain (`fluxus.`) keeps your apex `cheruvathoor.com` free for a
> personal site. To use the apex instead, swap `fluxus-fisci.cheruvathoor.com` →
> `cheruvathoor.com` everywhere below and create the DNS record on `@`.

**Everything you need is in [`deploy/`](deploy/):** `setup-ec2.sh`,
`fluxus-backend.service`, `Caddyfile`, `deploy.sh`.

**Costs (new AWS Free Tier — $200 credits / 6 months):** t3.micro 24/7 (~$7.50/mo)
+ 30 GB EBS (~$2.40/mo) ≈ **~$10/mo → ~$60 over 6 months**, well under the $200.
Your domain + Caddy TLS cost nothing extra. The account auto-closes after 6
months or when credits run out unless you upgrade — set a budget alarm (§9).

---

## 0. Before you start

- The code is **already on GitHub** (`main`) — nothing to push. The instance
  clones from `https://github.com/cheruvathoorshajd/Fluxus_Fisci.git`.
- You need: an **AWS account**, ownership of **`cheruvathoor.com`** (✓), and
  **access to its DNS** (your registrar or Cloudflare/Route 53).
- Turn off the leftover **Render** service first (Render dashboard → the service
  → Settings → Delete/Suspend, or Auto-Deploy → No) so it stops failing on pushes.

---

## 1. Launch the EC2 instance (AWS Console)

1. **EC2 → Launch instance.**
2. **Name:** `fluxus-fisci`.
3. **AMI:** *Amazon Linux 2023* (x86_64).
4. **Instance type:** `t3.micro`.
5. **Key pair:** *Create key pair* → type **RSA**, format **.pem** → download
   `fluxus-key.pem` (keep it; needed only if you SSH from your PC).
6. **Network settings → Edit → Security group** — allow inbound:
   - **SSH** `22` — Source **My IP**.
   - **HTTP** `80` — Source **Anywhere** (required for the Let's Encrypt challenge).
   - **HTTPS** `443` — Source **Anywhere**.
7. **Storage:** 30 GB gp3.
8. **Launch instance.**

**Give it a stable IP:** **EC2 → Elastic IPs → Allocate**, then **Actions →
Associate** it with the `fluxus-fisci` instance. Note this IP — referred to below
as **`<EIP>`**. (An Elastic IP is free while associated with a running instance.)

---

## 2. Point cheruvathoor.com at the box (DNS)

`cheruvathoor.com` uses **Namecheap BasicDNS** (nameservers
`dns1/dns2.registrar-servers.com`), so DNS records are managed at **Namecheap**.
Zoho only handles your **email** — its MX records are untouched, and adding a
subdomain A record does not affect email.

**Namecheap (your setup):** Namecheap → **Domain List** → **cheruvathoor.com** →
**Manage** → **Advanced DNS** → **Host Records** → **Add New Record**:

| Field | Value |
|---|---|
| **Type** | **A Record** |
| **Host** | **`fluxus-fisci`** — the label only; Namecheap appends `.cheruvathoor.com` |
| **Value** | **`<EIP>`** (your Elastic IP) |
| **TTL** | Automatic (or 5 min) |

Save it (green ✓). Leave the existing `@` / `www` records and the Zoho **MX**/TXT
records exactly as they are.

<details>
<summary>Other DNS hosts (only if you ever move DNS off Namecheap)</summary>

- **Cloudflare:** DNS → Add record → **A**, Name `fluxus-fisci`, IPv4 `<EIP>`,
  **Proxy status = DNS only (grey cloud)** — proxied breaks Caddy's cert challenge.
- **Route 53:** Hosted zone → Create record → name `fluxus-fisci`, type **A**,
  value `<EIP>`.
</details>

**Verify it resolves before continuing** (from your PC, PowerShell):

```powershell
nslookup fluxus-fisci.cheruvathoor.com     # must return <EIP>
```

Namecheap usually propagates in a few minutes (up to ~30). Wait until it
returns `<EIP>`.

---

## 3. Connect to the instance and run the one-time setup

**Easiest (no key hassle) — EC2 Instance Connect:** EC2 → Instances → select
`fluxus-fisci` → **Connect** → **EC2 Instance Connect** tab → **Connect**. A
terminal opens in your browser as `ec2-user`. Skip to the clone step below.

**Or SSH from Windows (PowerShell):**
```powershell
# fix key permissions once (Windows refuses world-readable keys)
icacls "$HOME\Downloads\fluxus-key.pem" /inheritance:r
icacls "$HOME\Downloads\fluxus-key.pem" /grant:r "$($env:USERNAME):(R)"
ssh -i "$HOME\Downloads\fluxus-key.pem" ec2-user@<EIP>
```
(If `ssh` isn't found, install *OpenSSH Client* via Windows *Optional Features*,
or use PuTTY with a `.ppk` converted from the `.pem`.)

**Once connected**, clone and bootstrap (installs swap + Python 3.11 + Node + Caddy):

```bash
git clone https://github.com/cheruvathoorshajd/Fluxus_Fisci.git
cd Fluxus_Fisci
bash deploy/setup-ec2.sh
```

---

## 4. Configure and start the backend

Create the production env file (git-ignored — stays on the box):

```bash
cd ~/Fluxus_Fisci/backend
cat > .env <<EOF
SECRET_KEY=$(python3.11 -c "import secrets; print(secrets.token_urlsafe(48))")
DATABASE_URL=sqlite:///./test.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["https://fluxus-fisci.cheruvathoor.com"]
ALPHA_VANTAGE_API_KEY=UP4DUV2FAQA27ENY,RVO2GXKWBOWIOQIE
FINNHUB_API_KEY=
EOF
```

> Market views use **snapshot data** (always populated — ideal for a demo). The
> Alpha Vantage keys power live **news** + individual live quotes; `FINNHUB_API_KEY`
> is optional. CORS is same-origin behind Caddy, so the origin line is just
> belt-and-suspenders.

Create the venv, install deps (no `torch` — the LSTM outlook shows "model
unavailable"; everything else works), seed the DB + demo account, and start the
service:

```bash
python3.11 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
./venv/bin/python init_db.py          # creates test.db + demo@fluxusfisci.app

sudo cp ~/Fluxus_Fisci/deploy/fluxus-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fluxus-backend
curl -s http://127.0.0.1:8000/health          # -> {"status":"healthy",...}
```

---

## 5. Build the frontend

```bash
cd ~/Fluxus_Fisci/frontend
npm ci
REACT_APP_API_URL=/api/v1 CI=false NODE_OPTIONS=--max-old-space-size=1024 npm run build
```

`REACT_APP_API_URL=/api/v1` makes the app call the API **relative to its own
origin** (Caddy proxies it to the backend) — no CORS. The build lands in
`frontend/build/` (including `build/case-study/`).

---

## 6. Configure Caddy (auto-HTTPS)

The committed `deploy/Caddyfile` already targets `fluxus-fisci.cheruvathoor.com`. If you
chose a different hostname, set it here; otherwise this is a no-op:

```bash
DOMAIN=fluxus-fisci.cheruvathoor.com
sed -i "s|fluxus-fisci.cheruvathoor.com|$DOMAIN|g" ~/Fluxus_Fisci/deploy/Caddyfile

sudo cp ~/Fluxus_Fisci/deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
sudo systemctl reload caddy
```

Caddy fetches a real Let's Encrypt certificate on the first request (needs ports
80/443 open and the A record resolving to this box — both done in §1–2). Watch it:

```bash
sudo journalctl -u caddy -f      # look for "certificate obtained successfully"
```

---

## 7. Verify

From your PC:

```powershell
curl.exe -sI  https://fluxus-fisci.cheruvathoor.com/                       # 200, valid TLS
curl.exe -s   https://fluxus-fisci.cheruvathoor.com/health                 # {"status":"healthy"}
curl.exe -sI  https://fluxus-fisci.cheruvathoor.com/case-study/index.html  # 200
```

Open **https://fluxus-fisci.cheruvathoor.com**:
- Landing → **Live demo**, or sign in `demo@fluxusfisci.app` / `demo1234`.
- Dashboard / Markets / Portfolio / News populate (snapshot); the **Case study**
  link (header/footer/landing) opens `/case-study`.

---

## 8. Updating later

Commit + push from your PC, then on the box:

```bash
cd ~/Fluxus_Fisci && bash deploy/deploy.sh
```

That pulls, reinstalls deps, rebuilds the frontend, and restarts backend + Caddy.

---

## 9. Notes, limits & teardown

- **Single instance / SQLite** — great for a portfolio demo, not production
  traffic. The DB persists on the EBS volume across restarts (it re-seeds if you
  delete `backend/test.db` and re-run `init_db.py`).
- **RAM (1 GB)** — the 2 GB swap from `setup-ec2.sh` lets `npm run build` finish.
  If a build still gets killed, build on your PC and upload it:
  `scp -i fluxus-key.pem -r frontend/build ec2-user@<EIP>:~/Fluxus_Fisci/frontend/`.
- **LSTM forecaster** — disabled (no `torch`), so `/insights` shows a labelled
  "model unavailable" for the outlook; everything else works.
- **CORS** — env-driven (`BACKEND_CORS_ORIGINS` in `.env`); no stale origins in
  `config.py`. Same-origin here anyway.
- **Free-tier care ($200 / 6-month plan)** — ~$10/mo (~$60 over 6 months), well
  under $200. Keep the Elastic IP **associated** (an idle, unassociated EIP is
  billed). Set **Billing → Budgets** alarms (e.g. $50 and $150). The account
  **auto-closes after 6 months or when credits run out** unless you upgrade to a
  paid plan. A **t3.small (2 GB, ~$15/mo)** is a fine upgrade for more headroom.
- **Teardown** — Terminate the instance, **release** the Elastic IP, and delete
  the `fluxus-fisci` DNS A record.

---

## 10. Troubleshooting

| Symptom | Check |
|---|---|
| `nslookup` doesn't return `<EIP>` | DNS not propagated yet, or record is on the wrong host — wait / re-check the A record. On Cloudflare set it to **DNS only (grey cloud)**. |
| TLS never issued | Ports 80 **and** 443 open? Domain resolves to `<EIP>`? `sudo journalctl -u caddy -f`. |
| `curl` shows cert/hostname error | You started Caddy before DNS resolved — `sudo systemctl restart caddy` once `nslookup` is correct. |
| 502 on `/api/*` | `sudo systemctl status fluxus-backend`; `journalctl -u fluxus-backend -e`. |
| Blank frontend | Did `npm run build` succeed? Is `frontend/build/index.html` present? |
| Build killed (OOM) | `swapon --show` (expect 2 GB); or build locally and `scp` the `build/` dir. |
| Build error `ERR_OSSL_EVP_UNSUPPORTED` | Prefix build with `NODE_OPTIONS=--openssl-legacy-provider`. |
| API 404s in browser | Frontend built with `REACT_APP_API_URL=/api/v1`? Rebuild if not. |
| SSH "UNPROTECTED KEY" (Windows) | Run the `icacls` commands in §3, or use EC2 Instance Connect. |
