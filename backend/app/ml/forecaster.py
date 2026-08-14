"""
Experimental LSTM forecaster — a real, self-contained sequence model, kept honest.

A small PyTorch ``nn.LSTM`` is trained per symbol on its recent daily log-returns
and used to forecast the next day's return. Crucially, every result is evaluated
with a walk-forward holdout against the naive "tomorrow = today" baseline, and
carries those honest metrics (skill vs. naive, directional accuracy). The point
is not to pretend we can predict the market — the point is to run a genuine
learned model *and show the reader how little it actually beats a coin flip*.

It never emits buy/sell. It ranks a model's *outlook* for understanding, not as
advice. Data is the app's labelled snapshot series, so forecasts are
deterministic (a fixed seed makes them reproducible).
"""
from __future__ import annotations

import time
from typing import List, Optional

import numpy as np

from app.services.market_service import market_service

# --- Model / training hyper-parameters (small on purpose: little data) ---
SEQ_LEN = 20
HIDDEN = 24
EPOCHS = 180
LR = 0.01
SEED = 7
_CACHE_TTL = 3600  # snapshot data is deterministic; cache forecasts for an hour.

DISCLAIMER = (
    "An experimental model's expectation, shown for understanding — not a "
    "prediction to act on and not financial advice. Note the skill-vs-naive "
    "figure: markets are near-random day to day, and this rarely beats a naive "
    "guess. Nothing here is a recommendation to buy or sell."
)

# symbol -> (timestamp, result dict)
_cache: dict[str, tuple[float, dict]] = {}
_torch = None  # lazily imported so a missing/partial install can't break startup


def _torch_mod():
    """Import torch on first use; return None if it isn't installed."""
    global _torch
    if _torch is None:
        try:
            import torch  # noqa: WPS433 (intentional lazy import)

            torch.manual_seed(SEED)
            torch.set_num_threads(1)
            _torch = torch
        except Exception as e:  # not installed / failed wheel
            print(f"Forecaster: torch unavailable ({e}); LSTM disabled.")
            _torch = False
    return _torch or None


def _build_model(torch):
    import torch.nn as nn

    class LSTMForecaster(nn.Module):
        def __init__(self) -> None:
            super().__init__()
            self.lstm = nn.LSTM(input_size=1, hidden_size=HIDDEN, num_layers=1, batch_first=True)
            self.head = nn.Linear(HIDDEN, 1)

        def forward(self, x):  # x: (batch, seq, 1)
            out, _ = self.lstm(x)
            return self.head(out[:, -1, :])  # last step -> next return

    return LSTMForecaster()


def _windows(series: np.ndarray, seq_len: int):
    """Return (X, y) sliding windows: X[i]=series[i:i+seq], y[i]=series[i+seq]."""
    xs, ys = [], []
    for i in range(len(series) - seq_len):
        xs.append(series[i : i + seq_len])
        ys.append(series[i + seq_len])
    return np.asarray(xs, dtype=np.float32), np.asarray(ys, dtype=np.float32)


def _train_and_forecast(closes: List[float]) -> Optional[dict]:
    """Train the LSTM on the return series; return forecast + honest backtest."""
    torch = _torch_mod()
    if torch is None:
        return None

    arr = np.asarray(closes, dtype=np.float64)
    if len(arr) < SEQ_LEN + 25:  # need enough for windows + a real holdout
        return None

    last_price = float(arr[-1])
    rets = np.diff(np.log(arr))  # stationary log-returns

    # Number of sliding windows (== len(X) after _windows); size the holdout
    # first so the scaling below can exclude it.
    n_windows = len(rets) - SEQ_LEN
    if n_windows < 30:
        return None

    # Walk-forward: last ~15% of windows are an out-of-sample holdout.
    test_n = max(12, int(n_windows * 0.15))

    # Scale from the TRAINING returns only. Using the full series (incl. the
    # holdout) would leak holdout statistics into the model and flatter the
    # backtest — rets[:-test_n] are the returns the training windows are fit on.
    scale = float(rets[:-test_n].std()) or 1e-6
    norm = (rets / scale).astype(np.float32)  # scale for stable training

    X, y = _windows(norm, SEQ_LEN)
    x_tr, y_tr = X[:-test_n], y[:-test_n]
    x_te, y_te = X[-test_n:], y[-test_n:]

    torch.manual_seed(SEED)
    model = _build_model(torch)
    opt = torch.optim.Adam(model.parameters(), lr=LR)
    loss_fn = torch.nn.MSELoss()

    xt = torch.from_numpy(x_tr).unsqueeze(-1)  # (N, seq, 1)
    yt = torch.from_numpy(y_tr).unsqueeze(-1)
    model.train()
    for _ in range(EPOCHS):
        opt.zero_grad()
        loss = loss_fn(model(xt), yt)
        loss.backward()
        opt.step()

    model.eval()
    with torch.no_grad():
        pred_te = model(torch.from_numpy(x_te).unsqueeze(-1)).squeeze(-1).numpy()

    # --- Honest backtest, in real return space (undo the scaling) ---
    pred_ret = pred_te * scale
    true_ret = y_te * scale
    model_mae = float(np.mean(np.abs(pred_ret - true_ret)))
    naive_mae = float(np.mean(np.abs(true_ret)))  # naive: predict "no change"
    skill = (naive_mae - model_mae) / naive_mae if naive_mae else 0.0

    mask = np.abs(true_ret) > 1e-5
    directional = (
        float(np.mean(np.sign(pred_ret[mask]) == np.sign(true_ret[mask]))) if mask.any() else 0.0
    )
    resid_std = float(np.std(pred_ret - true_ret)) or scale

    # --- Forecast the next step from the most recent window ---
    with torch.no_grad():
        last_win = torch.from_numpy(norm[-SEQ_LEN:]).reshape(1, SEQ_LEN, 1)
        next_ret = float(model(last_win).item()) * scale

    if not np.isfinite(next_ret):
        return None

    forecast_price = last_price * float(np.exp(next_ret))
    band_low = last_price * float(np.exp(next_ret - resid_std))
    band_high = last_price * float(np.exp(next_ret + resid_std))
    forecast_pct = (float(np.exp(next_ret)) - 1.0) * 100.0

    has_edge = skill > 0.05 and directional > 0.55
    return {
        "forecast_return_pct": round(forecast_pct, 2),
        "forecast_price": round(forecast_price, 2),
        "band_low": round(band_low, 2),
        "band_high": round(band_high, 2),
        "last_price": round(last_price, 2),
        "horizon": "next trading day",
        "backtest": {
            "model_mae_pct": round(model_mae * 100, 3),
            "naive_mae_pct": round(naive_mae * 100, 3),
            "skill_vs_naive_pct": round(skill * 100, 1),
            "directional_accuracy": round(directional, 3),
            "test_points": int(test_n),
        },
        "verdict": "a marginal edge over a naive guess"
        if has_edge
        else "no reliable edge over a naive guess",
    }


def forecast_symbol(symbol: str) -> Optional[dict]:
    """Forecast a single symbol (cached). None if torch is missing or data too thin."""
    symbol = symbol.upper()
    now = time.time()
    cached = _cache.get(symbol)
    if cached and now - cached[0] < _CACHE_TTL:
        return cached[1]

    quote = market_service.get_stock_price(symbol, allow_live=False)
    if not quote:
        return None
    hist = market_service.get_stock_history(symbol, "6mo")
    closes = [h["close"] for h in hist.get("history", [])]
    core = _train_and_forecast(closes)
    if core is None:
        return None

    result = {
        "symbol": quote["symbol"],
        "name": quote.get("name", quote["symbol"]),
        "model": "LSTM",
        "source": hist.get("source", "snapshot"),
        "disclaimer": DISCLAIMER,
        **core,
    }
    _cache[symbol] = (now, result)
    return result


def ranked_outlook(limit: int = 8) -> dict:
    """
    Run the forecaster across the trending universe and rank by the model's
    expected next-day return. Includes an aggregate honesty read (average skill
    vs. naive) so the ranking is never mistaken for a reliable prediction.
    """
    universe = ["NVDA", "AAPL", "TSLA", "PLTR", "MSFT", "AMZN", "META", "AMD"][:limit]
    rows: List[dict] = []
    skills: List[float] = []
    for sym in universe:
        f = forecast_symbol(sym)
        if not f:
            continue
        skills.append(f["backtest"]["skill_vs_naive_pct"])
        rows.append(
            {
                "symbol": f["symbol"],
                "name": f["name"],
                "last_price": f["last_price"],
                "forecast_return_pct": f["forecast_return_pct"],
                "forecast_price": f["forecast_price"],
                "directional_accuracy": f["backtest"]["directional_accuracy"],
                "skill_vs_naive_pct": f["backtest"]["skill_vs_naive_pct"],
            }
        )

    rows.sort(key=lambda r: r["forecast_return_pct"], reverse=True)
    avg_skill = round(float(np.mean(skills)), 1) if skills else 0.0
    available = _torch_mod() is not None
    return {
        "model": "LSTM",
        "available": available and bool(rows),
        "horizon": "next trading day",
        "ranked": rows,
        "avg_skill_vs_naive_pct": avg_skill,
        "honesty": (
            "Ranked by an LSTM's expected next-day return on labelled snapshot data. "
            "On average this model barely beats — often trails — a naive 'no change' "
            "guess, which is exactly what you'd expect from near-random daily moves. "
            "Read it as a demonstration, not a signal to act on."
        ),
        "disclaimer": DISCLAIMER,
    }
