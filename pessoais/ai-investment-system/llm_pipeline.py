"""Structured LLM pipeline for investment research and decision review.

The pipeline keeps market data and model output separate, validates every LLM
response, and labels simulated/fallback decisions so they are never mistaken
for live recommendations.
"""
from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Mapping


ALLOWED_SIGNALS = {"BUY", "SELL", "HOLD", "AVOID", "REVIEW"}
REQUIRED_DECISION_FIELDS = {
    "final_signal",
    "consolidated_confidence",
    "position_size_pct",
    "investment_thesis",
    "key_risks",
    "catalysts",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_json_object(raw: str) -> dict[str, Any]:
    """Parse JSON returned by an LLM, including fenced JSON responses."""
    text = raw.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("LLM response did not contain a JSON object") from None
        value = json.loads(text[start : end + 1])
    if not isinstance(value, dict):
        raise ValueError("LLM response must be a JSON object")
    return value


@dataclass
class ResearchBrief:
    asset: str
    objective: str = "growth"
    horizon: str = "medium"
    risk_profile: str = "balanced"
    data_sources: list[str] = field(default_factory=list)
    evidence: dict[str, Any] = field(default_factory=dict)
    news: list[dict[str, Any]] = field(default_factory=list)
    influence_map: dict[str, Any] = field(default_factory=dict)
    generated_at: str = field(default_factory=utc_now)


@dataclass
class DecisionReview:
    asset: str
    final_signal: str
    consolidated_confidence: float
    position_size_pct: float
    investment_thesis: str
    key_risks: list[str]
    catalysts: list[str]
    time_horizon: str = "medium"
    price_target: float = 0.0
    stop_loss: float = 0.0
    consensus_score: float = 0.0
    review_required: bool = True
    mode: str = "simulation"
    pipeline_version: str = "1.0"
    generated_at: str = field(default_factory=utc_now)
    validation_warnings: list[str] = field(default_factory=list)


def validate_decision(
    raw: Mapping[str, Any],
    asset: str,
    *,
    mode: str = "llm",
    max_position_pct: float = 20.0,
) -> DecisionReview:
    """Normalize and validate model output before it reaches the API."""
    missing = REQUIRED_DECISION_FIELDS - set(raw)
    warnings: list[str] = []
    if missing:
        warnings.append(f"missing_fields:{','.join(sorted(missing))}")

    signal = str(raw.get("final_signal", "REVIEW")).upper()
    if signal not in ALLOWED_SIGNALS:
        warnings.append("invalid_signal")
        signal = "REVIEW"

    def bounded_float(key: str, default: float, minimum: float, maximum: float) -> float:
        try:
            value = float(raw.get(key, default))
        except (TypeError, ValueError):
            warnings.append(f"invalid_number:{key}")
            return default
        if value < minimum or value > maximum:
            warnings.append(f"out_of_range:{key}")
            return min(max(value, minimum), maximum)
        return value

    risks = raw.get("key_risks", [])
    catalysts = raw.get("catalysts", [])
    if not isinstance(risks, list):
        warnings.append("invalid_key_risks")
        risks = [str(risks)]
    if not isinstance(catalysts, list):
        warnings.append("invalid_catalysts")
        catalysts = [str(catalysts)]

    return DecisionReview(
        asset=asset.upper(),
        final_signal=signal,
        consolidated_confidence=bounded_float("consolidated_confidence", 0.0, 0.0, 1.0),
        position_size_pct=bounded_float("position_size_pct", 0.0, 0.0, max_position_pct),
        investment_thesis=str(raw.get("investment_thesis", "Insufficient evidence for a decision.")),
        key_risks=[str(item) for item in risks[:10]],
        catalysts=[str(item) for item in catalysts[:10]],
        time_horizon=str(raw.get("time_horizon", "medium")),
        price_target=bounded_float("price_target", 0.0, 0.0, float("inf")),
        stop_loss=bounded_float("stop_loss", 0.0, 0.0, float("inf")),
        consensus_score=bounded_float("consensus_score", 0.0, 0.0, 1.0),
        review_required=True,
        mode=mode,
        validation_warnings=warnings,
    )


class InvestmentLLMPipeline:
    """Runs the consolidation stage with an injectable LLM caller.

    Injecting ``llm_call`` makes the pipeline testable and supports providers
    other than Anthropic without coupling the business logic to an SDK.
    """

    def __init__(
        self,
        llm_call: Callable[[str], str] | None = None,
        max_position_pct: float = 20.0,
    ):
        self.llm_call = llm_call
        self.max_position_pct = max_position_pct

    def build_prompt(self, brief: ResearchBrief, signals: Mapping[str, Any]) -> str:
        return (
            "You are an investment research review engine. Use only the supplied "
            "evidence. Do not invent prices, facts, sources or returns. A HOLD or "
            "AVOID decision is valid. Return only JSON with keys: "
            "final_signal, consolidated_confidence, position_size_pct, "
            "price_target, stop_loss, time_horizon, investment_thesis, "
            "key_risks, catalysts, consensus_score.\n\n"
            f"RESEARCH BRIEF:\n{json.dumps(asdict(brief), ensure_ascii=False, indent=2)}\n\n"
            f"AGENT SIGNALS:\n{json.dumps(signals, ensure_ascii=False, indent=2, default=str)}\n\n"
            "NEWS AND GLOBAL INFLUENCE:\n"
            "Treat headlines as time-bound evidence, distinguish fact from "
            "interpretation, and explain transmission channels before assigning "
            "material impact.\n"
            f"{json.dumps({'news': brief.news, 'influence_map': brief.influence_map}, ensure_ascii=False, indent=2, default=str)}"
        )

    def run(self, brief: ResearchBrief, signals: Mapping[str, Any]) -> DecisionReview:
        if self.llm_call is None:
            return self._fallback(brief, signals, "llm_not_configured")
        try:
            result = parse_json_object(self.llm_call(self.build_prompt(brief, signals)))
            return validate_decision(
                result,
                brief.asset,
                mode="llm",
                max_position_pct=self.max_position_pct,
            )
        except (ValueError, TypeError, json.JSONDecodeError) as error:
            return self._fallback(brief, signals, f"llm_validation_failed:{error}")
        except (OSError, RuntimeError) as error:
            return self._fallback(brief, signals, f"llm_call_failed:{error}")

    def _fallback(
        self,
        brief: ResearchBrief,
        signals: Mapping[str, Any],
        reason: str,
    ) -> DecisionReview:
        valid_signals = [
            str(item.get("signal", "")).upper()
            for item in signals.values()
            if isinstance(item, Mapping)
        ]
        signal = "REVIEW" if not valid_signals else (
            "HOLD" if valid_signals.count("HOLD") >= len(valid_signals) / 2 else "REVIEW"
        )
        decision = validate_decision(
            {
                "final_signal": signal,
                "consolidated_confidence": 0.0,
                "position_size_pct": 0.0,
                "investment_thesis": "No validated LLM decision was available; human review is required.",
                "key_risks": ["Missing or unvalidated model output", "Incomplete evidence"],
                "catalysts": [],
                "time_horizon": brief.horizon,
            },
            brief.asset,
            mode="fallback",
            max_position_pct=self.max_position_pct,
        )
        decision.validation_warnings.append(reason)
        return decision
