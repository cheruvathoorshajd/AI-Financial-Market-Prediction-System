# Deploying Fluxus Fisci on AWS Free Tier

A single **EC2 t3.micro** runs the whole app: FastAPI (uvicorn behind systemd)
and the React production build + the case study, all served by **Caddy** with
automatic HTTPS on a free **DuckDNS** domain. SQLite lives on the instance disk.

```
                      Internet
                         │  https://<you>.duckdns.org
                    ┌────▼─────┐
                    │  Caddy   │  :443 (auto Let's Encrypt), :80 (redirect + ACME)
                    ├──────────┴──────────────────────────┐
        /api/* ─────▶ reverse_proxy 127.0.0.1:8000 (uvicorn, systemd)
        /*     ─────▶ file_server  frontend/build  (React SPA + /case-study)
                    └─────────────────────────────────────┘
                        SQLite: backend/test.db (on the EBS volume)
```

**Everything you need is in [`deploy/`](deploy/):** `setup-ec2.sh`,
`fluxus-backend.service`, `Caddyfile`, `deploy.sh`.

Costs (new AWS Free Tier — $200 credits over 6 months): a t3.micro 24/7
(~$7.50/mo) + 30 GB EBS (~$2.40/mo) ≈ **~$10/mo → ~$60 over 6 months**, well
under the $200 credit. DuckDNS + Caddy TLS are free. NOTE: this tier is
credit-capped and the account auto-closes after 6 months or when credits run out
unless you upgrade — set a Billing budget alarm (§9). Watch-outs in §9.

---

## 0. Before you start (on your laptop)

Push the latest code to GitHub — the instance clones from there:

```bash
git add -A
git commit -m "Deploy: AWS EC2 + Caddy config and docs"
git push        # to your Fluxus_Fisci repo
```

You'll need: an **AWS account**, and a free **DuckDNS** account
(<https://www.duckdns.org>, log in with GitHub/Google).

---

## 1. Launch the EC2 instance (AWS Console)

1. **EC2 → Launch instance.**
2. **Name:** `fluxus-fisci`.
3. **AMI:** *Amazon Linux 2023* (x86_64).
4. **Instance type:** `t3.micro` (or `t2.micro` — whichever your region lists as
   free-tier eligible).
5. **Key pair:** create/download one (e.g. `fluxus-key.pem`) — you'll SSH with it.
6. **Network settings → Edit → Security group**, allow inbound:
   - **SSH** `22` — *Source: My IP* (just you).
   - **HTTP** `80` — *Anywhere* (needed for the Let's Encrypt challenge + redirect).
   - **HTTPS** `443` — *Anywhere*.
7. **Storage:** 30 GB gp3 (free-tier max) is plenty.
8. **Launch.**

**Give it a stable IP** so DNS doesn't break on stop/start:
**EC2 → Elastic IPs → Allocate**, then **Associate** it with the instance.
(An Elastic IP is free *while associated with a running instance*.)

Note the Elastic IP — call it `<EIP>`.

---

## 2. Point your DuckDNS domain at the box

1. At <https://www.duckdns.org>, create a subdomain, e.g. `fluxusfisci`
   → your hostname is `fluxusfisci.duckdns.org`.
2. Set its **current IP** field to `<EIP>` and **update**.
3. Verify from your laptop: `nslookup fluxusfisci.duckdns.org` → returns `<EIP>`.

Because you're on an Elastic IP, the address is static — no updater needed.

---

## 3. SSH in and run the one-time setup

```bash
chmod 400 fluxus-key.pem
ssh -i fluxus-key.pem ec2-user@<EIP>
```

Clone the repo and run the bootstrap (swap + Python 3.11 + Node + Caddy):

```bash
git clone https://github.com/cheruvathoorshajd/Fluxus_Fisci.git
cd Fluxus_Fisci
bash deploy/setup-ec2.sh
```

---

## 4. Configure the backend

Create the production env file (git-ignored — it never leaves the box):

```bash
cd ~/Fluxus_Fisci/backend
cat > .env <<EOF
SECRET_KEY=$(python3.11 -c "import secrets; print(secrets.token_urlsafe(48))")
DATABASE_URL=sqlite:///./test.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["https://fluxusfisci.duckdns.org"]
ALPHA_VANTAGE_API_KEY=UP4DUV2FAQA27ENY,RVO2GXKWBOWIOQIE
FINNHUB_API_KEY=
EOF
```

> The app is on **snapshot data** for market views (always populated — ideal for
> a demo). The Alpha Vantage keys only power live **news** + individual live
> quotes. `FINNHUB_API_KEY` is optional (a free key gives a more reliable news
> feed). CORS is same-origin here, so the line above is belt-and-suspenders.

Create the venv, install deps (torch is intentionally excluded — the LSTM
forecaster degrades to "model unavailable" on 1 GB RAM), and seed the DB + demo
account:

```bash
python3.11 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
./venv/bin/python init_db.py          # creates test.db + demo@fluxusfisci.app
```

Install and start the backend service:

```bash
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
origin**, which Caddy proxies to the backend — no CORS, works on any domain.
The build lands in `frontend/build/` (including `build/case-study/`).

---

## 6. Configure Caddy (auto-HTTPS)

Edit the domain in the Caddyfile, install it, and start Caddy:

```bash
# put YOUR DuckDNS hostname into the config (replaces the placeholder):
DOMAIN=fluxusfisci.duckdns.org
sed -i "s|fluxusfisci.duckdns.org|$DOMAIN|g" ~/Fluxus_Fisci/deploy/Caddyfile

sudo cp ~/Fluxus_Fisci/deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
sudo systemctl reload caddy
```

Caddy will fetch a Let's Encrypt certificate on first request (needs port 80/443
open and the domain resolving to this box — both done above). Watch it:

```bash
sudo journalctl -u caddy -f      # look for "certificate obtained successfully"
```

---

## 7. Verify

From your laptop:

```bash
curl -sI  https://fluxusfisci.duckdns.org/            # 200, valid TLS
curl -s   https://fluxusfisci.duckdns.org/health      # {"status":"healthy"}
curl -sI  https://fluxusfisci.duckdns.org/case-study/index.html   # 200
```

Open **https://fluxusfisci.duckdns.org** in a browser:
- Landing page → **Live demo**, or sign in `demo@fluxusfisci.app` / `demo1234`.
- Dashboard/Markets/Portfolio/News populate (snapshot); **Case study** link works.

---

## 8. Updating later

Push changes from your laptop, then on the box:

```bash
cd ~/Fluxus_Fisci && bash deploy/deploy.sh
```

That pulls, reinstalls deps, rebuilds the frontend, and restarts backend + Caddy.

---

## 9. Notes, limits & teardown

- **Single instance / SQLite** — no autoscaling; perfect for a portfolio demo,
  not for production traffic. The DB persists on the EBS volume across restarts.
- **RAM (1 GB)** — the 2 GB swap from `setup-ec2.sh` is what lets `npm run build`
  finish. If a build still struggles, build locally and `scp -i key.pem -r
  frontend/build ec2-user@<EIP>:~/Fluxus_Fisci/frontend/` instead.
- **LSTM forecaster** — stays disabled (no `torch`), so `/insights` shows a
  labelled "model unavailable" for the outlook. Everything else works.
- **CORS origin** — `app/core/config.py` still hard-codes an old
  `ai-financial-market-prediction-system.vercel.app` origin; harmless here
  (same-origin), but worth cleaning up. Your real origin is set via
  `BACKEND_CORS_ORIGINS` in `.env`.
- **Free-tier care (new $200 / 6-month plan)** — a single t3.micro + 30 GB EBS
  runs ~$10/mo (~$60 over 6 months), well under $200. Keep the Elastic IP
  **associated** (an idle, unassociated EIP is billed). Set **Billing → Budgets**
  alarms (e.g. $50 and $150). The account **auto-closes after 6 months or when
  credits are exhausted** unless you upgrade — plan to migrate/upgrade before
  then if you want the demo to stay live. A **t3.small (2 GB)** is a fine upgrade
  (~$15/mo, still < $200) if you want more headroom or to enable torch/LSTM.
- **Teardown** — Terminate the instance, then **release** the Elastic IP so it
  doesn't accrue charges. Delete the DuckDNS record if you like.

---

## 10. Troubleshooting

| Symptom | Check |
|---|---|
| TLS never issued | Port 80 open? Domain resolves to `<EIP>`? `sudo journalctl -u caddy -f` |
| 502 on `/api/*` | `sudo systemctl status fluxus-backend`; `journalctl -u fluxus-backend -e` |
| Blank frontend | Did `npm run build` succeed? Is `frontend/build/index.html` present? |
| Build killed (OOM) | Confirm swap: `swapon --show`; or build locally and `scp` the `build/` dir |
| Build error `ERR_OSSL_EVP_UNSUPPORTED` | Newer Node + CRA: prefix the build with `NODE_OPTIONS=--openssl-legacy-provider` |
| API 404s in browser | Frontend built with `REACT_APP_API_URL=/api/v1`? Rebuild if not |
