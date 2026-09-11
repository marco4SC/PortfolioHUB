import pandas as pd

from portfolio.risk import Portfolio, Position, RiskManager


def test_portfolio_value_and_drawdown():
    portfolio = Portfolio(
        cash=100.0,
        positions={
            "PETR4": Position(
                asset="PETR4", quantity=10, avg_price=20, current_price=25,
                stop_loss=18, target_price=30,
            )
        },
        peak_value=400.0,
    )

    assert portfolio.total_invested == 250
    assert portfolio.total_value == 350
    assert portfolio.drawdown_pct == -12.5


def test_risk_manager_detects_stop_and_sizes_position():
    portfolio = Portfolio(
        cash=1_000.0,
        positions={
            "VALE3": Position(
                asset="VALE3", quantity=1, avg_price=70, current_price=60,
                stop_loss=65, target_price=80,
            )
        },
    )
    manager = RiskManager(portfolio, max_position_pct=0.2)

    assert manager.check_stops() == ["VALE3"]
    assert manager.position_size(confidence=1.0, signal_strength=1.0, available_cash=1_000) == 212


def test_var_returns_lower_tail_return_with_enough_observations():
    manager = RiskManager(Portfolio(cash=100))
    returns = pd.Series([-0.04] * 3 + [-0.01] * 27)

    assert manager.var_95(returns) == -0.04
