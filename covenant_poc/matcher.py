"""Hybrid keyword + semantic matcher against the covenant master library."""

from __future__ import annotations

import json
import math
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

DATA_PATH = Path(__file__).resolve().parent / "data" / "master_data.json"

STOPWORDS = {
    "the", "and", "or", "of", "to", "a", "an", "in", "for", "on", "by", "with",
    "as", "at", "from", "that", "this", "such", "any", "all", "shall", "be",
    "is", "are", "was", "were", "been", "being", "its", "their", "his", "her",
    "not", "no", "under", "over", "other", "than", "into", "upon", "each",
    "which", "who", "whom", "will", "may", "must", "can", "including",
    "without", "limitation", "hereof", "thereof", "hereby", "herein",
    "between", "among", "per", "via", "etc", "ie", "eg",
}

ABBREVIATIONS = {
    "dscr": "debt service coverage ratio",
    "dsra": "debt service reserve account",
    "dsr": "debt service reserve",
    "tra": "trust and retention account escrow",
    "ppa": "power purchase agreement offtake",
    "plf": "plant load factor",
    "cuf": "capacity utilization factor",
    "om": "operation and maintenance",
    "kmp": "key managerial personnel",
    "facr": "fixed asset coverage ratio",
    "icr": "interest coverage ratio",
    "ebitda": "earnings before interest tax depreciation amortization",
    "mmra": "major maintenance reserve account",
    "irr": "inverter replacement reserve",
    "scada": "supervisory control and data acquisition",
    "kyc": "know your customer",
    "lei": "legal entity identifier",
    "ufce": "unhedged foreign currency exposure",
    "tnw": "tangible net worth",
    "tol": "total outside liabilities",
    "ltd": "long term debt",
    "td": "total debt",
    "drr": "debenture redemption reserve",
    "mis": "management information system",
    "esg": "environmental social governance",
    "ndc": "no due certificate",
    "roc": "registrar of companies charge filing",
}

WORD_RE = re.compile(r"[a-z0-9]+(?:[./&%-][a-z0-9]+)?", re.I)


def tokenize(text: str) -> list[str]:
    tokens = []
    for raw in WORD_RE.findall(text.lower()):
        tok = raw.replace("&", " ").strip(".-/")
        if not tok:
            continue
        if tok in STOPWORDS:
            continue
        if len(tok) <= 1:
            continue
        stemmed = _stem(tok)
        tokens.append(stemmed)
        if tok in ABBREVIATIONS:
            tokens.extend(tokenize(ABBREVIATIONS[tok]))
        elif stemmed in ABBREVIATIONS:
            tokens.extend(tokenize(ABBREVIATIONS[stemmed]))
    return tokens


def _stem(tok: str) -> str:
    if len(tok) > 4 and tok.endswith("s") and not tok.endswith(("ss", "us", "is")):
        return tok[:-1]
    return tok


def expand_query(text: str) -> str:
    extra = []
    for tok in WORD_RE.findall(text.lower()):
        key = _stem(tok.strip(".-/"))
        if key in ABBREVIATIONS:
            extra.append(ABBREVIATIONS[key])
        elif tok.strip(".-/") in ABBREVIATIONS:
            extra.append(ABBREVIATIONS[tok.strip(".-/")])
    if extra:
        return text + " " + " ".join(extra)
    return text


def phrase_present(haystack: str, phrase: str) -> bool:
    parts = [p for p in re.split(r"\s+", phrase.strip().lower()) if p]
    if not parts:
        return False
    esc = [re.escape(p) for p in parts]
    esc[-1] = esc[-1] + r"s?"
    pattern = r"\b" + r"[\s\-_/&]+".join(esc) + r"\b"
    return re.search(pattern, haystack) is not None


def token_coverage(query_tokens: set[str], phrase: str) -> float:
    pt = tokenize(phrase)
    if not pt:
        return 0.0
    hits = sum(1 for t in pt if t in query_tokens)
    return hits / len(pt)


def _keyword_weight(kw: str) -> float:
    words = [w for w in kw.split() if w]
    chars = len(kw.strip())
    if len(words) >= 3 or chars >= 18:
        return 1.0
    if len(words) == 2 or chars >= 8:
        return 0.86
    return 0.52



def levenshtein_ratio(a: str, b: str) -> float:
    if a == b:
        return 1.0
    if not a or not b:
        return 0.0
    if abs(len(a) - len(b)) > 18:
        return 0.0
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        curr = [i]
        for j, cb in enumerate(b, 1):
            ins, delete, sub = curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + (ca != cb)
            curr.append(min(ins, delete, sub))
        prev = curr
    dist = prev[-1]
    return 1.0 - dist / max(len(a), len(b))


class CovenantMatcher:
    def __init__(self, master_path: Path | None = None) -> None:
        path = master_path or DATA_PATH
        payload = json.loads(path.read_text(encoding="utf-8"))
        self.covenants: list[dict[str, Any]] = payload["covenants"]
        self.docs: list[list[str]] = []
        self.idf: dict[str, float] = {}
        self._prepare()

    def _prepare(self) -> None:
        n = len(self.covenants)
        df: Counter[str] = Counter()
        for cov in self.covenants:
            blob = " ".join(
                [
                    cov.get("subtype", ""),
                    cov.get("category", ""),
                    cov.get("covenantType", ""),
                    cov.get("nature", ""),
                    cov.get("criticality", ""),
                    cov.get("keywordsRaw", ""),
                    " ".join(cov.get("keywords") or []),
                ]
            )
            toks = tokenize(blob)
            self.docs.append(toks)
            df.update(set(toks))
        self.idf = {t: math.log((n + 1) / (c + 1)) + 1.0 for t, c in df.items()}
        self.doc_vecs = [self._tfidf(toks) for toks in self.docs]

    def _tfidf(self, tokens: list[str]) -> dict[str, float]:
        tf = Counter(tokens)
        if not tf:
            return {}
        length = len(tokens)
        vec = {t: (c / length) * self.idf.get(t, 1.0) for t, c in tf.items()}
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return {t: v / norm for t, v in vec.items()}

    @staticmethod
    def _cosine(a: dict[str, float], b: dict[str, float]) -> float:
        if not a or not b:
            return 0.0
        if len(a) > len(b):
            a, b = b, a
        return sum(v * b.get(k, 0.0) for k, v in a.items())

    def _keyword_score(self, query: str, query_tokens: set[str], cov: dict[str, Any]) -> tuple[float, list[str]]:
        hits: list[tuple[str, float]] = []
        keywords = cov.get("keywords") or []
        q = query.lower()

        subtype = cov.get("subtype", "")
        if phrase_present(q, subtype.lower()):
            hits.append((subtype, 1.0))
        else:
            cov_ratio = token_coverage(query_tokens, subtype)
            if cov_ratio >= 0.6:
                hits.append((subtype, 0.72 * cov_ratio))

        for kw in keywords:
            if not kw:
                continue
            if phrase_present(q, kw):
                hits.append((kw, _keyword_weight(kw)))
                continue
            cov_ratio = token_coverage(query_tokens, kw)
            if cov_ratio >= 0.7:
                hits.append((kw, 0.55 * cov_ratio * _keyword_weight(kw)))

        if not hits:
            return 0.0, []

        # Unique keyword credit, with diminishing returns for many weak hits.
        seen = {}
        for name, score in sorted(hits, key=lambda x: -x[1]):
            key = name.lower()
            if key not in seen:
                seen[key] = score
        values = list(seen.values())
        denom = max(len(keywords), 1)
        raw = sum(values) / denom
        best = max(values)
        score = min(1.0, 0.55 * best + 0.45 * min(1.0, raw * 1.35))
        matched = [k for k, s in seen.items() if s >= 0.5]
        return score, matched[:8]

    def _title_fuzzy(self, query: str, cov: dict[str, Any]) -> float:
        subtype = cov.get("subtype", "").lower()
        q = query.lower()
        if not subtype:
            return 0.0
        if subtype in q:
            return 1.0
        # Compare against a shortened window of the query.
        window = q[:280]
        return max(0.0, levenshtein_ratio(subtype, window) * 0.4)

    def match(
        self,
        text: str,
        top_k: int = 8,
        threshold: float = 0.38,
    ) -> dict[str, Any]:
        query = (text or "").strip()
        if len(query) < 12:
            return {
                "ok": False,
                "error": "Paste a longer clause (at least a sentence).",
                "matches": [],
                "needsAi": False,
            }

        expanded = expand_query(query)
        q_tokens_list = tokenize(expanded)
        q_token_set = set(q_tokens_list)
        q_vec = self._tfidf(q_tokens_list)

        ranked: list[dict[str, Any]] = []
        for idx, cov in enumerate(self.covenants):
            kw_score, matched_kw = self._keyword_score(expanded, q_token_set, cov)
            sem_score = self._cosine(q_vec, self.doc_vecs[idx])
            fuzzy = self._title_fuzzy(expanded, cov)
            hybrid = 0.50 * kw_score + 0.38 * sem_score + 0.12 * fuzzy
            if hybrid < 0.04 and kw_score < 0.08:
                continue
            ranked.append(
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
                    "matchedKeywords": matched_kw,
                    "scores": {
                        "keyword": round(kw_score, 4),
                        "semantic": round(sem_score, 4),
                        "fuzzy": round(fuzzy, 4),
                        "hybrid": round(hybrid, 4),
                    },
                }
            )

        ranked.sort(key=lambda r: r["scores"]["hybrid"], reverse=True)
        top = ranked[: max(1, top_k)]
        best = top[0]["scores"]["hybrid"] if top else 0.0
        confident = best >= threshold
        return {
            "ok": True,
            "queryLength": len(query),
            "librarySize": len(self.covenants),
            "matches": top,
            "bestScore": round(best, 4),
            "threshold": threshold,
            "confident": confident,
            "needsAi": not confident,
            "source": "library",
        }


_matcher: CovenantMatcher | None = None


def get_matcher() -> CovenantMatcher:
    global _matcher
    if _matcher is None:
        _matcher = CovenantMatcher()
    return _matcher


def match_text(text: str, top_k: int = 8, threshold: float = 0.38) -> dict[str, Any]:
    return get_matcher().match(text, top_k=top_k, threshold=threshold)


if __name__ == "__main__":
    raw = " ".join(sys.argv[1:]).strip()
    if not raw:
        raw = sys.stdin.read()
    result = match_text(raw)
    print(json.dumps(result, indent=2))
