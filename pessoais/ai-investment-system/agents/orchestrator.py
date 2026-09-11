"""
Orquestrador — Chief Investment Officer IA.
Agrega sinais de todos os agentes e toma a decisão final.
"""
import json
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import List
import anthropic

from agents.base import AgentSignal
from agents.Technical import TechnicalAgent
from agents.fundamental import FundamentalAgent
from agents.sentiment import SentimentAgent
from agents.macro import MacroAgent
from config import config
from llm_pipeline import InvestmentLLMPipeline, ResearchBrief
from data.sources.macro import get_macro_snapshot
from research_context import build_influence_map, normalize_news

SYSTEM_PROMPT = """Você é o Chief Investment Officer (CIO) de um fundo quantitativo-fundamentalista.
Receberá os sinais de 4 analistas e deve tomar a DECISÃO FINAL.

Pesos padrão: técnico=25%, fundamentalista=35%, sentimento=20%, macro=20%

Processo:
1. Analise concordâncias e discordâncias
2. Reduza peso de analistas com confiança < 0.5
3. Nunca compre com confiança consolidada < 0.6
4. Gere tese clara com preço-alvo e stop-loss

Retorne APENAS JSON:
{
  "final_signal": "BUY|SELL|HOLD|AVOID",
  "consolidated_confidence": 0.0,
  "position_size_pct": 0.0,
  "price_target": 0.0,
  "stop_loss": 0.0,
  "time_horizon": "short|medium|long",
  "investment_thesis": "tese detalhada",
  "key_risks": ["risco1"],
  "catalysts": ["catalisador1"],
  "consensus_score": 0.0
}"""

@dataclass
class InvestmentDecision:
    asset: str
    final_signal: str
    consolidated_confidence: float
    position_size_pct: float
    price_target: float
    stop_loss: float
    time_horizon: str
    investment_thesis: str
    key_risks: list
    catalysts: list
    agent_signals: list
    consensus_score: float
    analysis_mode: str = "llm"
    validation_warnings: list = None
    research_context: dict = None

class Orchestrator:
    def __init__(self):
        self.technical = TechnicalAgent()
        self.fundamental = FundamentalAgent(config.brapi_token)
        self.sentiment = SentimentAgent()
        self.macro = MacroAgent()
        self.client = anthropic.Anthropic(api_key=config.anthropic_api_key)
        self.pipeline = InvestmentLLMPipeline(
            llm_call=self._call_consolidation_llm,
            max_position_pct=config.max_position_pct * 100,
        )

    def _call_consolidation_llm(self, prompt: str) -> str:
        response = self.client.messages.create(
            model=config.llm_model,
            max_tokens=1500,
            system="You are a careful investment research review engine.",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text

    def analyze(self, asset: str, data: dict = None) -> InvestmentDecision:
        data = data or {}

        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {
                "technical": executor.submit(self.technical.analyze, asset, data),
                "fundamental": executor.submit(self.fundamental.analyze, asset, data),
                "sentiment": executor.submit(self.sentiment.analyze, asset, data),
                "macro": executor.submit(self.macro.analyze, asset, data),
            }
            signals = {name: future.result() for name, future in futures.items()}

        signals_summary = {
            name: {
                "signal": sig.signal,
                "confidence": sig.confidence,
                "reasoning": sig.reasoning[:500],
                "data_points": sig.data_points,
            }
            for name, sig in signals.items()
        }

        try:
            from data.sources.market import MarketDataSource
            market = MarketDataSource(config.brapi_token)
            quote = market.get_stock_quote(asset)
            current_price = quote["price"]
        except:
            current_price = 0.0

        brief = ResearchBrief(
            asset=asset,
            objective=data.get("objective", "growth"),
            horizon=data.get("horizon", "medium"),
            risk_profile=data.get("risk_profile", "balanced"),
            data_sources=data.get("data_sources", []),
            evidence={"current_price": current_price, "signals": signals_summary},
            news=normalize_news(signals.get("sentiment").data_points.get("news", [])),
            influence_map=build_influence_map(asset, get_macro_snapshot()),
        )
        result = self.pipeline.run(brief, signals_summary)

        return InvestmentDecision(
            asset=asset,
            final_signal=result.final_signal,
            consolidated_confidence=result.consolidated_confidence,
            position_size_pct=min(result.position_size_pct / 100, config.max_position_pct),
            price_target=result.price_target,
            stop_loss=result.stop_loss,
            time_horizon=result.time_horizon,
            investment_thesis=result.investment_thesis,
            key_risks=result.key_risks,
            catalysts=result.catalysts,
            agent_signals=list(signals.values()),
            consensus_score=result.consensus_score,
            analysis_mode=result.mode,
            validation_warnings=result.validation_warnings,
            research_context={
                "news": brief.news,
                "influence_map": brief.influence_map,
                "generated_at": brief.generated_at,
            },
        )
