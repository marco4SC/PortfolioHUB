import pytest

from market_scan import scan_watchlist


class FakeMarket:
    def get_stock_quote(self, ticker):
        if ticker == "INVALID":
            raise RuntimeError("provider rejected ticker")
        return {"ticker": ticker, "price": 10.0, "change_pct": 1.2}


def test_scan_returns_partial_results_and_provider_errors():
    result = scan_watchlist(FakeMarket(), ["petr4", "INVALID", "PETR4"])

    assert result["scanned"] == ["PETR4", "INVALID"]
    assert result["successful"] == 1
    assert result["failed"] == 1
    assert result["orders_placed"] is False


def test_scan_rejects_empty_watchlist():
    with pytest.raises(ValueError, match="At least one ticker"):
        scan_watchlist(FakeMarket(), [])


def test_scan_rejects_oversized_watchlist():
    with pytest.raises(ValueError, match="Maximum"):
        scan_watchlist(FakeMarket(), ["PETR4"] * 21)
