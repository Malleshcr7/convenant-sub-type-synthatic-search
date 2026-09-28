import { createServerFn } from "@tanstack/react-start";
import { env } from "@/lib/env.server";
import { getLibrary } from "./matcher";
import type { MatchHit, MatchResult } from "./types";

type AiInput = {
  clause: string;
  geminiKey?: string;
};

type AiJson = {
  unmatched?: boolean;
  suggestedSubtype?: string | null;
  matches?: { id?: string; subtype?: string; score?: number; reason?: string }[];
};

function libraryBrief() {
  return getLibrary().map((c) => ({
    id: c.id,
    subtype: c.subtype,
    category: c.category,
    covenantType: c.covenantType,
    nature: c.nature,
    criticality: c.criticality,
    keywords: c.keywordsRaw,
  }));
}

function buildPrompt(clause: string): string {
  return `You are a project-finance covenant classifier.

Given a clause excerpt from a Facility Agreement, pick the best matching covenant subtypes from the LIBRARY. Only use subtypes that exist in the library. Score 0-1.

If nothing in the library is a reasonable match, set unmatched=true and suggest a new subtype name.

Return JSON only:
{
  "unmatched": false,
  "suggestedSubtype": null,
  "matches": [
    { "id": "COV-015", "subtype": "DSCR", "score": 0.91, "reason": "Clause imposes a DSCR test" }
  ]
}

Return 1-3 matches, highest score first.

CLAUSE:
"""${clause.slice(0, 6000)}"""

LIBRARY:
${JSON.stringify(libraryBrief())}`;
}

function parseJson(text: string): AiJson {
  let raw = (text || "").trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  return JSON.parse(raw) as AiJson;
}

function enrich(ai: AiJson, provider: string): MatchResult {
  const byId = new Map(getLibrary().map((c) => [c.id, c]));
  const byName = new Map(getLibrary().map((c) => [c.subtype.trim().toLowerCase(), c]));
  const matches: MatchHit[] = [];
  for (const item of ai.matches ?? []) {
    const cov =
      (item.id ? byId.get(item.id) : undefined) ??
      byName.get((item.subtype ?? "").trim().toLowerCase());
    if (!cov) continue;
    const score = Math.max(0, Math.min(1, Number(item.score) || 0));
    matches.push({
      id: cov.id,
      subtype: cov.subtype,
      category: cov.category,
      covenantType: cov.covenantType,
      nature: cov.nature,
      criticality: cov.criticality,
      assignedTo: cov.assignedTo,
      maker: cov.maker,
      checker: cov.checker,
      keywords: cov.keywords,
      matchedKeywords: [],
      reason: item.reason ?? "",
      scores: {
        keyword: null,
        semantic: null,
        fuzzy: null,
        hybrid: Math.round(score * 10000) / 10000,
        ai: Math.round(score * 10000) / 10000,
      },
    });
  }
  matches.sort((a, b) => b.scores.hybrid - a.scores.hybrid);
  const unmatched = Boolean(ai.unmatched) || matches.length === 0;
  return {
    ok: true,
    source: "ai",
    provider,
    unmatched,
    suggestedSubtype: ai.suggestedSubtype ?? null,
    matches: matches.slice(0, 3),
    bestScore: matches[0]?.scores.hybrid ?? 0,
    threshold: 0.55,
    needsAi: false,
    confident: !unmatched && (matches[0]?.scores.hybrid ?? 0) >= 0.55,
  };
}

async function callGemini(clause: string, apiKey: string, model: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(clause) }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const payload = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return enrich(parseJson(text), "gemini");
}

async function callXai(clause: string, apiKey: string) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.1,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: buildPrompt(clause) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`xAI ${res.status}`);
  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = payload.choices?.[0]?.message?.content ?? "";
  return enrich(parseJson(text), "xai");
}

export const classifyWithAi = createServerFn({ method: "POST" })
  .validator((input: AiInput) => {
    const clause = (input?.clause ?? "").trim();
    if (clause.length < 12) throw new Error("Clause is too short.");
    return {
      clause: clause.slice(0, 8000),
      geminiKey: (input.geminiKey ?? "").trim().slice(0, 200),
    };
  })
  .handler(async ({ data }): Promise<MatchResult> => {
    const geminiKey = data.geminiKey || env("GEMINI_API_KEY") || "";
    const model = env("GEMINI_MODEL") || "gemini-2.0-flash";
    const xaiKey = env("XAI_API_KEY") || "";
    const errors: string[] = [];

    if (geminiKey) {
      try {
        return await callGemini(data.clause, geminiKey, model);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Gemini failed");
      }
    }
    if (xaiKey) {
      try {
        return await callXai(data.clause, xaiKey);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "xAI failed");
      }
    }

    return {
      ok: false,
      error:
        "No AI provider available. Paste a Gemini API key, or the environment must have an xAI key.",
      matches: [],
      bestScore: 0,
      threshold: 0.55,
      confident: false,
      needsAi: true,
      source: "ai",
      unmatched: true,
      provider: errors.join(" · ") || undefined,
    };
  });
