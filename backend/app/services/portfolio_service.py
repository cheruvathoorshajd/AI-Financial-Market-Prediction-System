"""
Portfolio service — computes holdings metrics, totals and allocation from a set
of lots ({symbol, shares, avgCost}) using current market prices (live or
snapshot). With no lots given it falls back to the seeded demo portfolio.
"""
from typing import List, Optional

from app.data import seed
from app.services.market_service import _aggregate_source


def get_portfolio(
    lots: Optional[List[dict]] = None, cash: Optional[float] = None
) -> dict:
    source_lots = seed.DEMO_HOLDINGS if lots is None else lots
    cash = seed.DEMO_CASH if cash is None else cash

    holdings = []
    sources = []
    invested_value = 0.0
    total_cost = 0.0
    day_change_value = 0.0

    for lot in source_lots:
        # Snapshot for the portfolio: a calm, always-populated "daily read" with
        # one deterministic as-of basis for the totals (never a flickering
        # live/snapshot mix). Reference snapshot data keeps the demo complete.
        quote = seed.snapshot_quote(str(lot["symbol"]).strip().upper())
        if not quote:
            # No quote for this symbol — surface it (flagged, and kept out of
            # every total) instead of silently dropping it. See finding B4.
            sym = str(lot["symbol"]).strip().upper()
            holdings.append({
                "symbol": sym,
                "name": sym,
                "sector": None,
                "shares": lot["shares"],
                "avgCost": round(lot["avgCost"], 2),
                "price": None,
                "dayChangePercent": None,
                "marketValue": None,
                "costBasis": round(lot["avgCost"] * lot["shares"], 2),
                "gain": None,
                "gainPercent": None,
                "spark": [],
                "weight": 0,
                "source": "unpriced",
                "priced": False,
            })
            continue
        sources.append(quote)
        price = quote["price"]
        shares = lot["shares"]
        market_value = price * shares
        cost_basis = lot["avgCost"] * shares
        gain = market_value - cost_basis
        day_change = quote.get("change", 0) * shares

        invested_value += market_value
        total_cost += cost_basis
        day_change_value += day_change

        holdings.append({
            "symbol": quote["symbol"],
            "name": quote.get("name", quote["symbol"]),
            "sector": quote.get("sector"),
            "shares": shares,
            "avgCost": round(lot["avgCost"], 2),
            "price": price,
            "dayChangePercent": quote.get("changePercent", 0),
            "marketValue": round(market_value, 2),
            "costBasis": round(cost_basis, 2),
            "gain": round(gain, 2),
            "gainPercent": round((gain / cost_basis) * 100, 2) if cost_basis else 0,
            "spark": seed.spark_series(quote["symbol"], points=30),
            "source": quote.get("source", "snapshot"),
            "priced": True,
        })

    total_value = invested_value + cash
    total_gain = invested_value - total_cost
    prev_invested = invested_value - day_change_value

    # Weights as % of invested value (unpriced holdings carry no weight).
    for h in holdings:
        h["weight"] = (
            round((h["marketValue"] / invested_value) * 100, 2)
            if h["marketValue"] is not None and invested_value
            else 0
        )

    holdings.sort(
        key=lambda h: h["marketValue"] if h["marketValue"] is not None else -1.0,
        reverse=True,
    )

    # Allocation by sector (unpriced holdings contribute nothing).
    sector_totals: dict = {}
    for h in holdings:
        if h["marketValue"] is None:
            continue
        key = h["sector"] or "Other"
        sector_totals[key] = sector_totals.get(key, 0) + h["marketValue"]
    allocation = [
        {"name": k, "value": round(v, 2)}
        for k, v in sorted(sector_totals.items(), key=lambda kv: kv[1], reverse=True)
    ]

    return {
        "totals": {
            "totalValue": round(total_value, 2),
            "investedValue": round(invested_value, 2),
            "cash": round(cash, 2),
            "totalCost": round(total_cost, 2),
            "totalGain": round(total_gain, 2),
            "totalGainPercent": round((total_gain / total_cost) * 100, 2) if total_cost else 0,
            "dayChange": round(day_change_value, 2),
            "dayChangePercent": round((day_change_value / prev_invested) * 100, 2) if prev_invested else 0,
        },
        "holdings": holdings,
        "allocation": allocation,
        "source": _aggregate_source(sources),
    }
