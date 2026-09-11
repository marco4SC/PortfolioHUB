from research_context import build_influence_map, normalize_news


def test_news_is_normalized_and_deduplicated():
    result = normalize_news(
        [
            {"title": "Oil rises", "published": "today", "summary": "x"},
            {"title": "Oil rises", "published": "today", "summary": "duplicate"},
            {"title": "", "published": "today"},
        ]
    )
    assert len(result) == 1
    assert result[0]["title"] == "Oil rises"


def test_influence_map_explains_asset_specific_channels():
    result = build_influence_map("PETR4", {"selic_meta": {"latest": 10.5}})
    assert "commodity prices" in result["exposure_themes"]
    assert "commodities" in result["transmission_channels"]
    assert result["limitations"]
