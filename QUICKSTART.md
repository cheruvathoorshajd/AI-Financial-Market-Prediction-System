# Quick start — Fluxus Fisci

Get it running in about five minutes. Neither API key is required — the app
falls back to labelled snapshot data and a heuristic reading without them.

## 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
python init_db.py                # creates tables + the demo account
python -m uvicorn app.main:app --reload --port 8000
```

Create `backend/.env`:

```properties
SECRET_KEY=change-me
DATABASE_URL=sqlite:///./test.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
ALPHA_VANTAGE_API_KEY=          # optional — real quotes; free at alphavantage.co
ANTHROPIC_API_KEY=              # optional — enables the natural-language AI reading
ANTHROPIC_MODEL=claude-opus-5   # optional
```

API: <http://localhost:8000> · docs at `/docs`.

## 2. Frontend

In a second terminal:

```bash
cd frontend
npm install                     # or: pnpm install
npm start
```

App: <http://localhost:3000>.

## 3. Sign in

Use the **Explore with the demo account** button, or:

```
Email:    demo@fluxusfisci.app
Password: demo1234
```

## Common issues

**Port already in use (8000):**
```bash
# Windows
netstat -ano | findstr :8000 && taskkill /PID <PID> /F
# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

**Reset the database:**
```bash
cd backend && rm test.db && python init_db.py
```

**Module not found (frontend):** delete `node_modules` and reinstall.

## Commands

```bash
# backend tests
cd backend && pytest

# frontend typecheck / production build
cd frontend && npx tsc --noEmit
cd frontend && npm run build
```

See [README.md](README.md) for the product thesis, design rationale, and an
honest account of how the AI layer works.
