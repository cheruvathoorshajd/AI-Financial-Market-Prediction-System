# Fluxus Fisci

*Latin: "the flow of the treasury."*

A calm, literate companion for reading the markets — built for **understanding** rather than **transacting**. It helps you see what's moving and *why*, with an AI layer that shows its work and is honest about the limits of what it knows.

> This repository began life as a generic AI stock tracker. It has been rebuilt into Fluxus Fisci as a portfolio flagship: a real, running product with a coherent point of view, a bespoke design system, and an AI layer that is genuinely defensible rather than a faked demo.

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
- **Asset detail** — price history (custom chart), key stats, and the AI reading.
- **Insights** — a grounded assistant you can ask questions of.
- **Portfolio** — **editable** holdings, allocation, and P&L over cost basis, calmly visualized.
- **Settings** — profile, password, watchlist, and session: a full account section.
- **Design system** (`/design-system`) — the token, type, and data-viz language in one place.
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

This is the crux, and it is built to be **real, functional, transparent, and honest.** There are three distinct kinds of "intelligence" here, and the app labels each as exactly what it is:

### a. Transparent heuristics — `backend/app/ml/signals.py`
Plain, auditable arithmetic over the price history: momentum, price-vs-50-day-average, annualised volatility, RSI(14), and range position. These are **heuristics, and the UI says so.** They are never dressed up as a model or a prediction. They are the observable *facts* the assistant reasons over — and in the transparency panel, they're surfaced as "what it looked at," with their real values.

### b. A grounded LLM call — `backend/app/ml/insights_service.py`
When an `ANTHROPIC_API_KEY` is configured, the natural-language narrative (summary, reasoning, limits) is written by a **real Anthropic API call** (`claude-opus-5` by default), grounded *strictly* in the heuristic numbers computed in (a). The system prompt forbids it from inventing prices/news, forbids buy/sell/hold recommendations, and instructs it to be explicit about uncertainty. The narrative is labelled **"AI reading."**

### c. An honest fallback — same file
With **no key** (or on any API/SDK/network error), the assistant degrades gracefully to a deterministic explanation composed from the same signals, labelled **"Signals reading."** Nothing is faked; the app tells you which path produced the words you're reading.

**Confidence is honest, too.** There is no fabricated "87% accurate." Confidence is a *qualitative* level (low / tentative / moderate) derived from how much the signals agree with each other, shown with its rationale.

**What was removed:** the original app's `Strong Buy / Hold / Sell` recommendations, its "confidence scores," and a dead `TensorFlow` LSTM (`predictor.py`) that was never wired to any route but whose presence let the UI label a threshold heuristic as an "LSTM Neural Network." All gone.

### Capability notes, in one line each
- **LLM (real):** the insights narrative and free-form Q&A, when a key is set. Anthropic Messages API.
- **Heuristic (labelled):** momentum / MA / volatility / RSI / range signals, and the qualitative confidence.
- **External API:** market quotes from Alpha Vantage (free tier, ~25 req/day) with a graceful, clearly-labelled snapshot fallback — every response carries a `source: "live" | "snapshot"` field that the UI surfaces honestly.
- **Not present:** any trained/proprietary model, any prediction of future price, any recommendation.

## 6. Architecture & stack

```
backend/   FastAPI + SQLAlchemy (SQLite)
  app/ml/         signals.py (heuristics) · insights_service.py (grounded LLM + fallback)
  app/services/   market_service.py (Alpha Vantage + snapshot) · portfolio_service.py
  app/api/        auth · users · market · portfolio · insights · watchlist
  tests/          signals · grounding fallback · portfolio math
frontend/  React 18 + TypeScript (strict) + Tailwind + Recharts + react-query
  src/lib/        tokens · queries (data hooks) · format · errors · demo · useSignOut
  src/context/    AuthContext · TransitionContext (the wipe + sign-out splash)
  src/components/ ui/ (primitives) · charts/ · market/CompareSection · insights/InsightPanel (the signature)
                  · layout/ · CommandPalette (⌘K) · DemoTour · RouteProgress
  src/pages/      Onboarding · Login · Register · Dashboard · Markets · AssetDetail · Insights
                  · Portfolio · Settings · DesignSystem · NotFound
```

Secrets stay **server-side** — the Anthropic and Alpha Vantage keys never enter the client bundle (the only client env var is the API base URL).

**Auth token storage.** The JWT is kept in `localStorage` so the SPA can attach it as a bearer header. That trades a small XSS exposure (an injected script could read it) for simplicity; the app renders no untrusted HTML (no `dangerouslySetInnerHTML` anywhere), so there is no injection sink today. An `httpOnly` cookie would be stronger and is the natural next step beyond a portfolio demo.

**Experimental LSTM.** The next-day forecaster (`/insights` outlook & per-asset forecast) needs PyTorch, which is intentionally left out of the free-tier deploy — it OOMs the build. It is imported lazily, so those views degrade to a labelled "model unavailable" when torch is absent; run `pip install torch` locally to enable them.

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
ANTHROPIC_API_KEY=your_key_or_leave_unset       # optional — enables the LLM narrative
ANTHROPIC_MODEL=claude-opus-5                    # optional — e.g. claude-sonnet-5 for lower cost
```
Neither API key is required to run — the app falls back to labelled snapshot data and a heuristic reading.

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

## 8. Testing

```bash
cd backend && pytest              # signals, AI grounding fallback, portfolio math
cd frontend && npx tsc --noEmit   # TypeScript strict typecheck
```

## 9. Honest capability notes (summary)

Nothing here predicts the market. The app computes transparent technical signals, optionally has a language model *explain* them in plain English (grounded only in those numbers), and is explicit — in the UI and in this document — about what is a heuristic, what is an API call, and what is an LLM call. **It is for understanding, not recommendations. Nothing in it is financial advice.**

---

*Designed & built by Dennis Sharon.*
