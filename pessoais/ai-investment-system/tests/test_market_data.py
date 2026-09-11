from unittest.mock import Mock, patch

from data.sources.market import MarketDataSource


def test_stock_quote_is_cached():
    response = Mock()
    response.json.return_value = {
        "results": [{
            "regularMarketPrice": 31.5,
            "regularMarketChangePercent": 1.2,
            "regularMarketVolume": 100,
            "marketCap": 200,
        }]
    }
    source = MarketDataSource()

    with patch("data.souces.market.requests.get", return_value=response) as get:
        first = source.get_stock_quote("PETR4")
        second = source.get_stock_quote("PETR4")

    assert first["ticker"] == "PETR4"
    assert first == second
    get.assert_called_once()
