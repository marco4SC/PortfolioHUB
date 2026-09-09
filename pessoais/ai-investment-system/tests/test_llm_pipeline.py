from llm_pipeline import (
    InvestmentLLMPipeline,
    ResearchBrief,
    parse_json_object,
    validate_decision,
)


def test_parse_json_object_accepts_markdown_fence():
    assert parse_json_object("```json\n{\"final_signal\":\"HOLD\"}\n```")["final_signal"] == "HOLD"


def test_validate_decision_bounds_position_and_marks_invalid_signal():
    result = validate_decision(
        {
            "final_signal": "YOLO",
            "consolidated_confidence": 2,
            "position_size_pct": 99,
            "investment_thesis": "Review",
            "key_risks": ["concentration"],
            "catalysts": [],
        },
        "petr4",
        max_position_pct=20,
    )

    assert result.asset == "PETR4"
    assert result.final_signal == "REVIEW"
    assert result.consolidated_confidence == 1
    assert result.position_size_pct == 20
    assert "invalid_signal" in result.validation_warnings


def test_pipeline_falls_back_to_review_when_llm_returns_invalid_json():
    pipeline = InvestmentLLMPipeline(llm_call=lambda _: "not json")
    result = pipeline.run(ResearchBrief(asset="VALE3"), {"technical": {"signal": "BUY"}})

    assert result.mode == "fallback"
    assert result.final_signal == "REVIEW"
    assert result.review_required is True
    assert any("llm_validation_failed" in warning for warning in result.validation_warnings)


def test_pipeline_validates_structured_llm_result():
    response = (
        '{"final_signal":"BUY","consolidated_confidence":0.8,'
        '"position_size_pct":12,"investment_thesis":"Evidence review",'
        '"key_risks":["macro"],"catalysts":["earnings"],"consensus_score":0.7}'
    )
    result = InvestmentLLMPipeline(llm_call=lambda _: response).run(
        ResearchBrief(asset="ITUB4"), {}
    )

    assert result.mode == "llm"
    assert result.final_signal == "BUY"
    assert result.position_size_pct == 12
