"""Meaning-based fallback using Gemini (if keyed) or xAI Grok."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

from matcher import get_matcher


def _library_brief() -> list[dict[str, str]]:
    out = []
    for cov in get_matcher().covenants:
        out.append(
            {
                "id": cov["id"],
                "subtype": cov["subtype"],
                "category": cov.get("category", ""),
                "covenantType": cov.get("covenantType", ""),
                "nature": cov.get("nature", ""),
                "criticality": cov.get("criticality", ""),
                "keywords": cov.get("keywordsRaw", ""),
            }
        )
    return out


def _prompt(clause: str) -> str:
    library = json.dumps(_library_brief(), ensure_ascii=False)
    return f"""You are a project-finance covenant classifier.

Given a clause excerpt from a Facility Agreement, pick the best matching covenant subtypes from the LIBRARY. Only use subtypes that exist in the library. Score 0-1.

If nothing in the library is a reasonable match, set unmatched=true and suggest a new subtype name.

Return JSON only, shape:
{{
  "unmatched": false,
  "suggestedSubtype": null,
  "matches": [
    {{
      "id": "COV-015",
      "subtype": "DSCR",
      "score": 0.91,
      "reason": "Clause imposes a DSCR test of 1.10"
    }}
  ]
}}

Return 1-3 matches, highest score first.

CLAUSE:
\"\"\"{clause[:6000]}\"\"\"

LIBRARY:
{library}
"""


def _parse_json(text: str) -> dict[str, Any]:
    raw = (text or "").strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw.replace("json\n", "", 1)
    start = raw.find("{")
    end = raw.rfind("}")
    if start >= 0 and end > start:
        raw = raw[start : end + 1]
    return json.loads(raw)


def _enrich(ai: dict[str, Any]) -> dict[str, Any]:
    by_id = {c["id"]: c for c in get_matcher().covenants}
    by_name = {c["subtype"].strip().lower(): c for c in get_matcher().covenants}
    matches = []
    for item in ai.get("matches") or []:
        cov = None
        if item.get("id") in by_id:
            cov = by_id[item["id"]]
        elif str(item.get("subtype", "")).strip().lower() in by_name:
            cov = by_name[str(item["subtype"]).strip().lower()]
        if not cov:
            continue
        score = float(item.get("score") or 0)
        score = max(0.0, min(1.0, score))
        matches.append(
            {
                "id": cov["id"],
                "subtype": cov["subtype"],
                "category": cov.get("category", ""),
                "covenantType": cov.get("covenantType", ""),
                "nature": cov.get("nature", ""),
                "criticality": cov.get("criticality", ""),
                "assignedTo": cov.get("assignedTo", ""),
                "maker": cov.get("maker", ""),
                "checker": cov.get("checker", ""),
                "keywords": cov.get("keywords") or [],
                "matchedKeywords": [],
                "reason": str(item.get("reason") or ""),
                "scores": {
                    "keyword": None,
                    "semantic": None,
                    "fuzzy": None,
                    "hybrid": round(score, 4),
                    "ai": round(score, 4),
                },
            }
        )
    matches.sort(key=lambda m: m["scores"]["hybrid"], reverse=True)
    unmatched = bool(ai.get("unmatched")) or not matches
    return {
        "ok": True,
        "source": "ai",
        "unmatched": unmatched,
        "suggestedSubtype": ai.get("suggestedSubtype"),
        "matches": matches[:3],
        "needsAi": False,
        "confident": (not unmatched) and bool(matches) and matches[0]["scores"]["hybrid"] >= 0.55,
    }


def _gemini(clause: str, api_key: str, model: str) -> dict[str, Any]:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    body = {
        "contents": [{"parts": [{"text": _prompt(clause)}]}],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1200,
            "responseMimeType": "application/json",
        },
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=45) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    text = (
        payload.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
    )
    return _enrich(_parse_json(text))


def _xai(clause: str, api_key: str) -> dict[str, Any]:
    body = {
        "model": "grok-4.5",
        "temperature": 0.1,
        "max_tokens": 1200,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": "Return valid JSON only."},
            {"role": "user", "content": _prompt(clause)},
        ],
    }
    req = urllib.request.Request(
        "https://api.x.ai/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=45) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    text = payload.get("choices", [{}])[0].get("message", {}).get("content", "")
    return _enrich(_parse_json(text))


def ai_match(clause: str, gemini_key: str | None = None) -> dict[str, Any]:
    gemini_key = (gemini_key or os.environ.get("GEMINI_API_KEY") or "").strip()
    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    xai_key = (os.environ.get("XAI_API_KEY") or "").strip()

    errors = []
    if gemini_key:
        try:
            result = _gemini(clause, gemini_key, model)
            result["provider"] = "gemini"
            return result
        except Exception as exc:  # noqa: BLE001
            errors.append(f"Gemini: {exc}")
    if xai_key:
        try:
            result = _xai(clause, xai_key)
            result["provider"] = "xai"
            return result
        except Exception as exc:  # noqa: BLE001
            errors.append(f"xAI: {exc}")

    return {
        "ok": False,
        "source": "ai",
        "error": "No AI provider available. Add a Gemini API key, or use the injected xAI key.",
        "detail": errors,
        "matches": [],
        "needsAi": True,
        "confident": False,
        "unmatched": True,
    }
