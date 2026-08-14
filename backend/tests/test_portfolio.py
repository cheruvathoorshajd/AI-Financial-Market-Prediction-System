"""Portfolio math must be internally consistent."""
from app.services.portfolio_service import get_portfolio


def test_portfolio_totals_are_consistent():
    p = get_portfolio()
    t = p["totals"]

    # Total value = invested value + cash.
    assert round(t["totalValue"], 2) == round(t["investedValue"] + t["cash"], 2)

    # Per-holding gain = market value - cost basis, and totals reconcile.
    invested = round(sum(h["marketValue"] for h in p["holdings"]), 2)
    cost = round(sum(h["costBasis"] for h in p["holdings"]), 2)
    assert invested == round(t["investedValue"], 2)
    assert round(t["totalGain"], 2) == round(invested - cost, 2)

    for h in p["holdings"]:
        assert round(h["gain"], 2) == round(h["marketValue"] - h["costBasis"], 2)

    # Weights sum to ~100% of invested value.
    assert abs(sum(h["weight"] for h in p["holdings"]) - 100) < 1.0
