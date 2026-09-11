"""Context builders for news and global influence analysis.

These functions create explainable, deterministic context for the LLM. They
do not predict geopolitical outcomes and do not convert a headline into an
automatic trade signal.
"""
from __future__ import annotations

from typing import Any


def build_influence_map(asset: str, macro_snapshot: dict[str, Any]) -> dict[str, Any]:
    asset = asset.upper()
    if asset in {"BTC", "ETH", "SOL"}:
        exposure = ["global liquidity", "US dollar", "real yields", "regulation", "risk appetite"]
        channels = {
            "global_liquidity": "Higher liquidity can support speculative assets; tightening can pressure valuations.",
            "usd_and_real_yields": "A stronger dollar or higher real yields can reduce demand for risk assets.",
            "regulation": "Policy changes may alter access, custody and market structure.",
        }
    elif asset in {"PETR4", "VALE3"}:
        exposure = ["commodity prices", "China demand", "US dollar", "global growth", "geopolitics"]
        channels = {
            "commodities": "Oil or iron ore prices affect revenue expectations and cyclicality.",
            "china_demand": "Chinese industrial activity can influence commodity demand and export expectations.",
            "usd_and_geopolitics": "Currency and geopolitical shocks can change margins, freight and risk premia.",
        }
    else:
        exposure = ["Brazilian rates", "domestic growth", "currency", "global risk appetite", "sector cycle"]
        channels = {
            "rates": "Higher local rates increase the discount rate and opportunity cost.",
            "growth": "Domestic activity affects revenue, credit quality and earnings expectations.",
            "global_risk": "External shocks can change flows into emerging markets.",
        }

    return {
        "asset": asset,
        "exposure_themes": exposure,
        "transmission_channels": channels,
        "macro_snapshot": macro_snapshot,
        "confidence": "contextual",
        "limitations": [
            "Influence paths are hypotheses, not causal proof.",
            "No geopolitical event is treated as certain without dated evidence.",
        ],
    }


def normalize_news(items: list[dict[str, Any]], max_items: int = 20) -> list[dict[str, Any]]:
    normalized = []
    seen: set[tuple[str, str]] = set()
    for item in items:
        title = str(item.get("title", "")).strip()
        if not title:
            continue
        key = (title.lower(), str(item.get("published", "")))
        if key in seen:
            continue
        seen.add(key)
        normalized.append(
            {
                "title": title[:240],
                "summary": str(item.get("summary", ""))[:600],
                "published": str(item.get("published", "")),
                "source": str(item.get("source", "unknown")),
                "link": str(item.get("link", "")),
            }
        )
        if len(normalized) >= max_items:
            break
    return normalized
