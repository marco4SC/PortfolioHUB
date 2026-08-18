"""Technical-analysis agent that calculates indicators and interprets them via an LLM."""
import json

import numpy as np
import pandas as pd

from agents.base import AgentSignal, BaseAgent
from data.sources.market import MarketDataSource

SYSTEM_PROMPT = """You are a technical analyst specializing in financial markets.
Interpret the supplied indicators, identify confluences and divergences, evaluate
volume context, and respond only with valid JSON containing signal, confidence,
reasoning, and key_levels. HOLD is a valid response; do not force a signal."""


def compute_indicators(df: pd.DataFrame) -> dict:
    close, high, low, volume = df["close"], df["high"], df["low"], df["volume"]
    indicators = {}

    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / loss
    indicators["rsi_14"] = round(float((100 - 100 / (1 + rs)).iloc[-1]), 2)

    ema12, ema26 = close.ewm(span=12).mean(), close.ewm(span=26).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9).mean()
    histogram = macd_line - signal_line
    indicators["macd"] = round(float(macd_line.iloc[-1]), 4)
    indicators["macd_signal"] = round(float(signal_line.iloc[-1]), 4)
    indicators["macd_histogram"] = round(float(histogram.iloc[-1]), 4)
    indicators["macd_cross"] = (
        "bullish" if macd_line.iloc[-1] > signal_line.iloc[-1] and macd_line.iloc[-2] <= signal_line.iloc[-2]
        else "bearish" if macd_line.iloc[-1] < signal_line.iloc[-1] and macd_line.iloc[-2] >= signal_line.iloc[-2]
        else "neutral"
    )

    sma20, std20 = close.rolling(20).mean(), close.rolling(20).std()
    bb_upper, bb_lower = sma20 + 2 * std20, sma20 - 2 * std20
    indicators["bb_upper"] = round(float(bb_upper.iloc[-1]), 2)
    indicators["bb_lower"] = round(float(bb_lower.iloc[-1]), 2)
    indicators["bb_pct"] = round(float(((close - bb_lower) / (bb_upper - bb_lower)).iloc[-1]), 3)
    indicators["bb_squeeze"] = float(std20.iloc[-1]) < float(std20.rolling(50).mean().iloc[-1])

    for period in [9, 21, 50, 200]:
        if len(close) >= period:
            indicators[f"sma_{period}"] = round(float(close.rolling(period).mean().iloc[-1]), 2)
            indicators[f"ema_{period}"] = round(float(close.ewm(span=period).mean().iloc[-1]), 2)

    current = float(close.iloc[-1])
    indicators["price_vs_sma50"] = round((current / indicators.get("sma_50", current) - 1) * 100, 2)
    indicators["price_vs_sma200"] = round((current / indicators.get("sma_200", current) - 1) * 100, 2)
    indicators["golden_cross"] = indicators.get("sma_50", 0) > indicators.get("sma_200", 0)
    avg_vol = float(volume.rolling(20).mean().iloc[-1])
    indicators["volume_ratio"] = round(float(volume.iloc[-1]) / avg_vol, 2) if avg_vol > 0 else 1.0
    indicators["obv_trend"] = "up" if float((volume * close.diff().apply(np.sign)).cumsum().diff(5).iloc[-1]) > 0 else "down"

    tr = pd.concat([high - low, (high - close.shift()).abs(), (low - close.shift()).abs()], axis=1).max(axis=1)
    indicators["atr_14"] = round(float(tr.rolling(14).mean().iloc[-1]), 2)
    indicators["atr_pct"] = round(float(indicators["atr_14"] / current * 100), 2)
    indicators["current_price"] = round(current, 2)
    return indicators


class TechnicalAgent(BaseAgent):
    def __init__(self):
        super().__init__("TechnicalAgent", SYSTEM_PROMPT)
        self.market = MarketDataSource()

    def analyze(self, asset: str, data: dict = None) -> AgentSignal:
        df = self.market.get_stock_history(asset, period="6mo") if data is None or "history" not in data else data["history"]
        if df.empty:
            return AgentSignal(self.name, asset, "HOLD", 0.0, "Sem dados históricos", {})

        indicators = compute_indicators(df)
        prompt = f"Analise os indicadores técnicos para {asset}:\n\n{json.dumps(indicators, indent=2)}\n\nRetorne o JSON."
        try:
            result = json.loads(self._call_llm(prompt).strip().strip("```json").strip("```").strip())
            return AgentSignal(
                agent_name=self.name, asset=asset, signal=result["signal"],
                confidence=float(result["confidence"]), reasoning=result["reasoning"],
                data_points={"indicators": indicators, "key_levels": result.get("key_levels", {})},
            )
        except Exception as error:
            return AgentSignal(self.name, asset, "HOLD", 0.0, f"Erro: {error}", indicators)
