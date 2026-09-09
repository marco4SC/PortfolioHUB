"""Safe batch market scan for a bounded watchlist.

This module reads public market data only. It never places orders and treats
individual provider failures as partial results instead of hiding them.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from data.sources.market import MarketDataSource


def scan_watchlist(
    market: MarketDataSource,
    tickers: list[str],
    *,
    max_assets: int = 20,
) -> dict[str, Any]:
    normalized = list(dict.fromkeys(ticker.strip().upper() for ticker in tickers if ticker.strip()))
    if not normalized:
        raise ValueError("At least one ticker is required")
    if len(normalized) > max_assets:
        raise ValueError(f"Maximum of {max_assets} assets per scan")

    quotes: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    for ticker in normalized:
        try:
            quotes.append(market.get_stock_quote(ticker))
        except Exception as error:
            errors.append({"ticker": ticker, "error": str(error)})

    return {
        "provider": "brapi.dev",
        "source_type": "public_market_data",
        "scan_mode": "quotes_only",
        "orders_placed": False,
        "scanned": normalized,
        "successful": len(quotes),
        "failed": len(errors),
        "quotes": quotes,
        "errors": errors,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
