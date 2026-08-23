# Fluxus Fisci

*Latin: "the flow of the treasury."*

A calm, literate companion for reading the markets — built for **understanding** rather than **transacting**. It helps you see what's moving and *why*, with an AI layer that shows its work and is honest about the limits of what it knows.

> This repository began life as a generic AI stock tracker. It has been rebuilt into Fluxus Fisci as a portfolio flagship: a real, running product with a coherent point of view, a bespoke design system, and an AI layer that is genuinely defensible rather than a faked demo.

**🔗 Live:** <https://fluxus-fisci.cheruvathoor.com>  ·  **Case study:** [`case-study/`](case-study/) (also linked in-app)  ·  **Deploy guide:** [`DEPLOYMENT.md`](DEPLOYMENT.md)
*(Live demo: `demo@fluxusfisci.app` / `demo1234`, or the **Live demo** button.)*

---

## 1. The problem

Most consumer finance apps are dopamine machines: gamified, trade-pushing, red-and-green anxiety engines optimized for engagement. They also tend to overstate their intelligence — a threshold on a moving average gets dressed up as a "neural network," and a heuristic becomes a confident "Strong Buy" with a fabricated accuracy score.

That's two problems in one: it's stressful to use, and it's dishonest about what the software actually knows.

## 2. The product point of view

**Fluxus Fisci is the opposite.** One thesis runs through every decision:

> A financial tool should help you *understand*, not push you to *act*. The AI explains what's happening and why; it never tells you to buy or sell, and it's honest when it doesn't know.

That single position does three things at once:

- It's a real, defensible **design stance** — calm, instrument-like, literate.
- It sidesteps the **financial-advice liability** baked into the original app — this is about literacy and comprehension, not recommendations.
- It reframes the AI from a thin "buy/sell oracle" into a genuinely interesting design problem: **how do you present machine-generated insight so a person trusts it *appropriately* — neither blindly nor not at all?**

## 3. What it is

The surfaces, each designed with loading / empty / error / success states and responsive down to mobile:

- **Onboarding** — a rich landing that states what the product is for, not a wall of form fields.
- **Sign in / Register** — calm, single-window auth, fit-to-viewport (never clipped).
- **Dashboard** — your daily read: market backdrop, portfolio snapshot, watchlist, and today's movers.
- **Markets** — search by **ticker _or_ company name**, trending, and gainers/losers, each with a bespoke sparkline.
- **Asset detail** — price history (custom chart), key stats, and the signals reading.
- **Insights** — an **experimental LSTM outlook** that ranks assets by expected next-day return (reporting its own backtested lack of edge), plus a chat box you can ask — *"which stock does the model rank highest?"*, *"best performer next quarter?"* — that routes to the model's ranking and, for horizons it can't see, says so plainly and adds a labelled backward-looking trend.
- **News** (`/news`) — a finance-only feed (markets, earnings, economy) with topic filters, sentiment and ticker tags, and an honest live/snapshot badge.
- **Portfolio** — **editable** holdings, allocation, and P&L over cost basis, calmly visualized.
- **Settings** — profile, password, watchlist, and session: a full account section.
- **Design system** (`/design-system`) — the token, type, and data-viz language in one place.
- **Case study** (`/case-study`) — a standalone, on-brand product-design write-up of this project, served with the app and linked from the landing header & footer.
- **404** — a standalone, on-brand not-found page.

### Signature interactions & novelties

- **Compare assets** — put two or three assets side by side (price shape, the same labelled signals, an honest reading of each). Search by **name or ticker**; embedded inline under **Markets** (beside the search bar) and **Portfolio** (segmented with allocation, seeded from your largest holdings).
- **⌘K command palette** — search assets and jump to any page from the keyboard, app-wide.
- **Considered transitions** — a verdigris **wipe** over sign-in/out carrying a rotating, honestly-attributed financial quote; a **"flux-line" route-progress** bar between pages; and a **"Signed out" confirmation splash**. All gated behind `prefers-reduced-motion`.
- **Live demo mode** — the **Live demo** button drops you into a seeded account that _announces itself_: a demo indicator + "Create account" CTA in the nav, a one-time **guided tour** of the differentiators, and **read-only guards** (disabled in the UI _and_ enforced server-side with `403`) so the shared demo can't be hijacked — while holdings and watchlist stay editable to explore.
- **Editable, per-user data** — add/remove portfolio positions (with correct P/L over cost basis) and manage your watchlist; both persist per account.
- **Fully-fluid responsive** — a clamp-based type & spacing scale so the whole UI scales _continuously_ with the viewport, not only at breakpoints.
- **Consistent brand navigation** — the wordmark follows one rule everywhere: signed-in → Dashboard, signed-out → landing.

## 4. Design decisions & why — "Patina"

The direction is **Patina**: precise, quiet, instrument-like — the authority of well-made financial infrastructure (ledgers, fine measuring instruments, archival records) reinterpreted as something calm and human.

It deliberately avoids the three "AI-default" looks that read as machine-generated on sight: cream + high-contrast serif + terracotta; near-black + a single acid-green accent; and hairline-rule broadsheet columns.

| Decision | What | Why |
|---|---|---|
| **Palette** | Cool paper (`#F4F5F2`), deep ink-teal text, **verdigris** accent (`#2F6F63`), sparing treasury-gold | Light and calm, not the AI-default dark dashboard. Verdigris = patinated bronze — the "aged instrument" feeling. |
| **Semantics** | Muted verdigris (up) / clay (down), never neon green / alarm red | A finance tool shouldn't be an anxiety engine. Direction is carried by arrows + sign, never hue alone (colour-vision safe). |
| **Type** | **Fraunces** (display) + **IBM Plex Sans** (UI) + **IBM Plex Mono** (every figure) | A literate, human voice paired with an engineered, precise one. All numbers are tabular + lining — number typography is a first-class concern in a finance product. |
| **Data viz** | Bespoke Recharts + inline-SVG sparklines; a 6-colour categorical palette **validated for contrast & colour-vision separation** on the light surface | No default chart-library styling. Identity in charts is always carried by a labelled legend, never colour alone. |
| **Motion** | Figures ease into place; sections fade in; skeletons over spinners; a verdigris wipe over auth, a flux-line route-progress bar, and a sign-out confirmation splash | Motion aids comprehension of *change* and of *navigation*. All of it is gated behind `prefers-reduced-motion`. |
| **States** | Every screen designed for loading / empty / error / success | The original had none. Errors say what happened and how to fix it; empty screens invite action in the product's voice. |
| **Signature** | The **AI transparency panel** | Boldness is spent in one place — see §5. |

Full reference, rendered live: **`/design-system`** in the running app.

## 5. How the AI actually works (the honest part)

This is the crux, and it is built to be **real, functional, transparent, and honest.** There are two distinct kinds of "intelligence" here, and the app labels each as exactly what it is:

### a. Transparent heuristics & their reading — `backend/app/ml/signals.py` · `insights_service.py`
Plain, auditable arithmetic over the price history: momentum, price-vs-50-day-average, annualised volatility, RSI(14), and range position. These are **heuristics, and the UI says so** — never dressed up as a model or a prediction. They are the observable *facts* the assistant reasons over, surfaced in the transparency panel as "what it looked at," with their real values. The natural-language narrative (summary, reasoning, limits) is then composed **deterministically** from those exact numbers — no language model, nothing invented — and labelled **"Signals reading."** It explains; it never says buy, sell, or hold.

### b. An experimental forecaster — `backend/app/ml/forecaster.py`
A small **PyTorch LSTM**, trained per-symbol on daily log-returns, produces the `/insights` **outlook** (assets ranked by expected next-day return) and the per-asset **forecast**. It is labelled **"Experimental · LSTM,"** and its honesty is louder than its numbers: every result carries a **walk-forward backtest** reporting skill-vs-naive error and directional accuracy, and the verdict is blunt when it earns it — *"no reliable edge over a naive guess."* It never emits a buy / sell / hold, and it degrades to a labelled **"model unavailable"** when PyTorch isn't installed (see §6). This is the thesis applied to the hardest case: a genuine machine prediction, presented so you trust it *only* as much as it deserves.

**Confidence is honest, too.** There is no fabricated "87% accurate." Confidence is a *qualitative* level (low / tentative / moderate) derived from how much the signals agree with each other, shown with its rationale.

**What was removed:** the original app's `Strong Buy / Hold / Sell` recommendations, its "confidence scores," and a dead `TensorFlow` LSTM (`predictor.py`) that was never wired to any route but whose presence let the UI label a threshold heuristic as an "LSTM Neural Network." All gone. (The LSTM shipped now — §5b — is a *real* trained model wired to real routes; and, unlike that old label, it is honest about having no reliable edge.)

### Capability notes, in one line each
- **Heuristic (labelled):** momentum / MA / volatility / RSI / range signals, the qualitative confidence, and the deterministic "Signals reading" narrative composed from them.
- **Forecast (experimental):** a per-symbol PyTorch LSTM behind `/insights` outlook & forecast, with a walk-forward backtest and a blunt "no reliable edge" verdict; degrades to "model unavailable" without PyTorch.
- **External API:** market quotes from Alpha Vantage (free tier, ~25 req/day) with a graceful, clearly-labelled snapshot fallback — every response carries a `source: "live" | "snapshot" | "mixed"` field that the UI surfaces honestly.
- **News (external, optional):** finance headlines via a degrading chain — Finnhub → Alpha Vantage `NEWS_SENTIMENT` → labelled snapshot — each response tagged with its `source` and `provider`, so the feed works with no key and upgrades automatically with either.
- **Not present:** any language model, any proprietary model, any confident price target, any recommendation. The one predictive model (the experimental LSTM) reports its own lack of edge rather than pretending to have one.

## 6. Architecture & stack

```
backend/   FastAPI + SQLAlchemy (SQLite)
  app/ml/         signals.py (heuristics) · insights_service.py (deterministic signals reading) · forecaster.py (experimental LSTM)
  app/services/   market_service.py (Alpha Vantage + snapshot) · news_service.py (Finnhub/AV/snapshot) · portfolio_service.py
  app/api/        auth · users · market · portfolio · insights · news · watchlist
  tests/          signals · grounding + outlook routing · portfolio math · news · forecaster (torch-gated) · app-boot smoke
frontend/  React 18 + TypeScript (strict) + Tailwind + Recharts + react-query
  src/lib/        tokens · queries (data hooks) · format · errors · demo · useSignOut
  src/context/    AuthContext · TransitionContext (the wipe + sign-out splash)
  src/components/ ui/ (primitives) · charts/ · market/CompareSection · insights/InsightPanel (the signature) + OutlookBoard
                  · layout/ · CommandPalette (⌘K) · DemoTour · RouteProgress
  src/pages/      Onboarding · Login · Register · Dashboard · Markets · AssetDetail · Insights
                  · News · Portfolio · Settings · DesignSystem · NotFound
  public/case-study/   the built case study, served at /case-study
deploy/    setup-ec2.sh · caddy.service · Caddyfile · deploy.sh   (AWS EC2 + Caddy)
.github/   workflows/deploy.yml   (push-to-deploy CI)
case-study/  standalone product-design case study (source; mirrored into public/)
DEPLOYMENT.md   full AWS deploy walkthrough
```

Secrets stay **server-side** — the Alpha Vantage key never enters the client bundle (the only client env var is the API base URL).

**Auth token storage.** The JWT is kept in `localStorage` so the SPA can attach it as a bearer header. That trades a small XSS exposure (an injected script could read it) for simplicity; the app renders no untrusted HTML (no `dangerouslySetInnerHTML` anywhere), so there is no injection sink today. An `httpOnly` cookie would be stronger and is the natural next step beyond a portfolio demo.

**Experimental LSTM.** The next-day forecaster (`/insights` outlook & per-asset forecast) needs PyTorch, which is intentionally left out of the default deploy — it OOMs a 1 GB box. It is imported lazily, so those views degrade to a labelled "model unavailable" when torch is absent. Run `pip install torch` to enable it locally; on the AWS deploy it runs on a **t3.small (2 GB)+** box, switched on via a `backend/.enable-ml` marker (see §8).

## 7. Running it locally

**Prerequisites:** Python 3.11+ and Node 18+.

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
python init_db.py                # creates tables + a demo account
python -m uvicorn app.main:app --reload --port 8000
```
Create `backend/.env` (git-ignored):
```properties
SECRET_KEY=change-me
DATABASE_URL=sqlite:///./test.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
ALPHA_VANTAGE_API_KEY=your_key_or_leave_unset   # https://www.alphavantage.co/support/#api-key
FINNHUB_API_KEY=your_key_or_leave_unset          # optional — preferred source for the news feed (free at finnhub.io)
```
No key is required to run — the app falls back to labelled snapshot data (quotes _and_ news), and the reading is always the deterministic signals narrative. A Finnhub key gives the news feed a reliable live source without spending the tiny Alpha Vantage quota.

### Frontend
```bash
cd frontend
npm install                      # installs from the committed package-lock.json
npm start                        # http://localhost:3000
```
`frontend/.env`:
```properties
REACT_APP_API_URL=http://localhost:8000/api/v1
```

**Demo account:** `demo@fluxusfisci.app` / `demo1234` — or the **Live demo** button on the landing / sign-in, which starts the self-announcing, guided demo mode (see §3). The demo account is read-only for profile & password (enforced server-side) so it stays working for everyone; its holdings and watchlist remain editable.

## 8. Deployment (AWS)

Live at **<https://fluxus-fisci.cheruvathoor.com>** — a single **AWS EC2** instance serves the React production build **and** the FastAPI API from one origin behind **Caddy** (automatic Let's Encrypt HTTPS). SQLite lives on the instance disk.

- **One box, same-origin.** Caddy serves `frontend/build` (SPA + `/case-study`) and reverse-proxies `/api/*` → uvicorn (systemd) on `:8000`, so the browser makes same-origin calls — **no CORS**.
- **Domain & TLS.** A subdomain of my own domain (`fluxus-fisci.cheruvathoor.com`, Namecheap DNS → the instance's Elastic IP); Caddy obtains and auto-renews the certificate.
- **Data.** Market views run on the deterministic **snapshot** (always populated — ideal for a demo); live **news** flows via Finnhub / Alpha Vantage when a key is set.
- **LSTM outlook.** Off by default (torch OOMs 1 GB); enabled on **t3.small (2 GB)+** via a git-ignored `backend/.enable-ml` marker that makes `deploy.sh` install `requirements-ml.txt` (CPU torch).
- **Push-to-deploy.** `.github/workflows/deploy.yml` typechecks on every push to `main`, then SSHes in and runs `deploy/deploy.sh` (hard-reset to `main` → rebuild → restart) — push → live in ~2–3 min, the same convenience as a managed PaaS.

Everything needed is in **[`deploy/`](deploy/)** (`setup-ec2.sh`, `caddy.service`, `Caddyfile`, `deploy.sh`); the full step-by-step (EC2 launch, Elastic IP, DNS, Caddy, enabling the LSTM) is in **[`DEPLOYMENT.md`](DEPLOYMENT.md)**. Running cost ≈ **$10–15/mo**, comfortably inside the AWS Free Tier credit.

## 9. Testing

```bash
cd backend && pytest              # signals · insights + outlook routing · portfolio math · news · forecaster (torch-gated)
cd frontend && npx tsc --noEmit   # TypeScript strict typecheck
```

## 10. Honest capability notes (summary)

Nothing here *reliably* predicts the market — and the one model that tries says so itself. The app computes transparent technical signals, *explains* them in plain English composed deterministically from those same numbers, and includes an experimental LSTM forecaster that publishes its own backtested lack of edge. It is explicit — in the UI and in this document — about what is a heuristic, what is an API call, and what is an experimental forecast. **It is for understanding, not recommendations. Nothing in it is financial advice.**

---

*Designed & built by Dennis Sharon.*
