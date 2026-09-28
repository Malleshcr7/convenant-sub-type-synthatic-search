"""Streamlit workbench: paste a clause, rank covenant subtypes."""

from __future__ import annotations

import json
import os
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

from llm import ai_match
from matcher import get_matcher, match_text

load_dotenv(Path(__file__).resolve().parent / ".env")

st.set_page_config(page_title="Covenant Scout", page_icon="⌘", layout="wide")

SAMPLES = json.loads(
    (Path(__file__).resolve().parent / "data" / "samples.json").read_text(encoding="utf-8")
)
LIBRARY = get_matcher().covenants

st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Outfit:wght@400;500;600&display=swap');
html, body, [class*="css"] { font-family: Outfit, system-ui, sans-serif; }
.stApp { background: #efe8dc; color: #161410; }
section[data-testid="stSidebar"] { background: #e7dfd1; }
h1, h2, h3 { font-family: Fraunces, Georgia, serif; letter-spacing: -0.03em; }
div[data-testid="stMetricValue"] { font-variant-numeric: tabular-nums; }
.block-container { padding-top: 1.6rem; max-width: 1200px; }
textarea { font-size: 0.95rem !important; line-height: 1.5 !important; }
.scout-kicker { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6b6560; font-weight: 600; }
.hit { display:inline-block; border:1px solid #d8d0c4; padding:2px 8px; border-radius:999px; font-size:0.72rem; margin:2px 4px 2px 0; color:#2f4a56; }
</style>
""",
    unsafe_allow_html=True,
)

if "clause" not in st.session_state:
    st.session_state.clause = SAMPLES[0]["text"]

st.markdown('<div class="scout-kicker">Clause screening</div>', unsafe_allow_html=True)
st.title("Covenant Scout")
st.caption(
    "Paste a Facility Agreement chunk. Hybrid keyword + semantic search ranks the "
    f"{len(LIBRARY)} subtypes in the Covenant Matrix. Weak library hits fall through to Gemini / Grok."
)

with st.sidebar:
    st.subheader("Settings")
    top_k = st.slider("Top matches", 3, 12, 8)
    threshold = st.slider("AI fallback threshold", 0.20, 0.70, 0.38, 0.01)
    force_ai = st.checkbox("Always ask AI (even if library is confident)", value=False)
    gemini_key = st.text_input(
        "Gemini API key (optional)",
        type="password",
        value=os.environ.get("GEMINI_API_KEY", ""),
        help="Used only for meaning-based fallback. Leave blank to use xAI if available.",
    )
    st.divider()
    st.subheader("Library")
    st.write(f"{len(LIBRARY)} covenant subtypes")
    q = st.text_input("Filter library")
    shown = [
        c
        for c in LIBRARY
        if not q
        or q.lower() in c["subtype"].lower()
        or q.lower() in (c.get("keywordsRaw") or "").lower()
    ]
    st.caption(f"{len(shown)} shown")
    for c in shown[:40]:
        st.markdown(f"**{c['subtype']}**  \n{c['covenantType']} · {c['nature']} · {c['criticality']}")

col_in, col_out = st.columns([1.05, 1], gap="large")

with col_in:
    labels = [s["title"] for s in SAMPLES]
    pick = st.selectbox("Load a Facility Agreement sample", ["— paste your own —"] + labels)
    if pick != "— paste your own —":
        sample = next(s for s in SAMPLES if s["title"] == pick)
        st.session_state.clause = sample["text"]
        if sample.get("expected"):
            st.caption(f"Expected library hit: {sample['expected']}")

    clause = st.text_area(
        "Clause text",
        height=280,
        key="clause",
        placeholder="Paste a covenant clause or definition from the Facility Agreement…",
    )
    run = st.button("Match subtypes", type="primary", use_container_width=True)

with col_out:
    if run:
        library_result = match_text(clause, top_k=top_k, threshold=threshold)
        if not library_result.get("ok"):
            st.warning(library_result.get("error", "Could not match."))
        else:
            st.metric("Best hybrid score", f"{library_result['bestScore']*100:.0f}")
            if library_result["confident"]:
                st.success("Library match is confident. AI fallback not required.")
            else:
                st.info("Library confidence is below threshold. Meaning-based AI will run.")

            for i, m in enumerate(library_result["matches"], 1):
                s = m["scores"]
                st.markdown(f"### {i}. {m['subtype']}")
                st.caption(
                    f"{m['category']} · {m['covenantType']} · {m['nature']} · {m['criticality']}"
                )
                c1, c2, c3, c4 = st.columns(4)
                c1.metric("Hybrid", f"{s['hybrid']*100:.0f}")
                c2.metric("Keyword", f"{s['keyword']*100:.0f}")
                c3.metric("Semantic", f"{s['semantic']*100:.0f}")
                c4.metric("Fuzzy", f"{s['fuzzy']*100:.0f}")
                if m.get("matchedKeywords"):
                    chips = "".join(f'<span class="hit">{k}</span>' for k in m["matchedKeywords"])
                    st.markdown(chips, unsafe_allow_html=True)
                st.divider()

            should_ai = force_ai or library_result["needsAi"]
            if should_ai:
                with st.spinner("Asking Gemini / Grok to read the clause…"):
                    ai = ai_match(clause, gemini_key=gemini_key or None)
                if not ai.get("ok"):
                    st.error(ai.get("error", "AI fallback failed."))
                    if ai.get("detail"):
                        st.caption(" · ".join(map(str, ai["detail"])))
                else:
                    provider = ai.get("provider", "ai")
                    st.markdown(f"### AI reading ({provider})")
                    if ai.get("unmatched"):
                        st.warning("No library subtype is a clean fit.")
                        if ai.get("suggestedSubtype"):
                            st.write(f"Suggested new subtype: **{ai['suggestedSubtype']}**")
                    for m in ai.get("matches") or []:
                        st.markdown(f"**{m['subtype']}** — {m['scores']['hybrid']*100:.0f}")
                        if m.get("reason"):
                            st.write(m["reason"])
    else:
        st.write("Results appear here after you match a clause.")
        st.caption("Tip: start with a sample, then paste your own chunk from the agreement.")
