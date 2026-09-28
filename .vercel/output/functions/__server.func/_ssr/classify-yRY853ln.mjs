import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { t as getLibrary } from "./matcher-BuQWFhkh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/classify-yRY853ln.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function libraryBrief() {
	return getLibrary().map((c) => ({
		id: c.id,
		subtype: c.subtype,
		category: c.category,
		covenantType: c.covenantType,
		nature: c.nature,
		criticality: c.criticality,
		keywords: c.keywordsRaw
	}));
}
function buildPrompt(clause) {
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
"""${clause.slice(0, 6e3)}"""

LIBRARY:
${JSON.stringify(libraryBrief())}`;
}
function parseJson(text) {
	let raw = (text || "").trim();
	if (raw.startsWith("```")) raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
	return JSON.parse(raw);
}
function enrich(ai, provider) {
	const byId = new Map(getLibrary().map((c) => [c.id, c]));
	const byName = new Map(getLibrary().map((c) => [c.subtype.trim().toLowerCase(), c]));
	const matches = [];
	for (const item of ai.matches ?? []) {
		const cov = (item.id ? byId.get(item.id) : void 0) ?? byName.get((item.subtype ?? "").trim().toLowerCase());
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
				hybrid: Math.round(score * 1e4) / 1e4,
				ai: Math.round(score * 1e4) / 1e4
			}
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
		threshold: .55,
		needsAi: false,
		confident: !unmatched && (matches[0]?.scores.hybrid ?? 0) >= .55
	};
}
async function callGemini(clause, apiKey, model) {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [{ parts: [{ text: buildPrompt(clause) }] }],
			generationConfig: {
				temperature: .1,
				maxOutputTokens: 1200,
				responseMimeType: "application/json"
			}
		})
	});
	if (!res.ok) throw new Error(`Gemini ${res.status}`);
	return enrich(parseJson((await res.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? ""), "gemini");
}
async function callXai(clause, apiKey) {
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .1,
			max_tokens: 1200,
			response_format: { type: "json_object" },
			messages: [{
				role: "system",
				content: "Return valid JSON only."
			}, {
				role: "user",
				content: buildPrompt(clause)
			}]
		})
	});
	if (!res.ok) throw new Error(`xAI ${res.status}`);
	return enrich(parseJson((await res.json()).choices?.[0]?.message?.content ?? ""), "xai");
}
var classifyWithAi_createServerFn_handler = createServerRpc({
	id: "f8be139d2f1d11753afcfa0d6c267a1518311c5e2f4d53e1f5fba78118e3f68a",
	name: "classifyWithAi",
	filename: "src/lib/covenant/classify.ts"
}, (opts) => classifyWithAi.__executeServer(opts));
var classifyWithAi = createServerFn({ method: "POST" }).validator((input) => {
	const clause = (input?.clause ?? "").trim();
	if (clause.length < 12) throw new Error("Clause is too short.");
	return {
		clause: clause.slice(0, 8e3),
		geminiKey: (input.geminiKey ?? "").trim().slice(0, 200)
	};
}).handler(classifyWithAi_createServerFn_handler, async ({ data }) => {
	const geminiKey = data.geminiKey || (process.env.GEMINI_API_KEY ?? "").trim();
	const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
	const xaiKey = (process.env.XAI_API_KEY ?? "").trim();
	const errors = [];
	if (geminiKey) try {
		return await callGemini(data.clause, geminiKey, model);
	} catch (err) {
		errors.push(err instanceof Error ? err.message : "Gemini failed");
	}
	if (xaiKey) try {
		return await callXai(data.clause, xaiKey);
	} catch (err) {
		errors.push(err instanceof Error ? err.message : "xAI failed");
	}
	return {
		ok: false,
		error: "No AI provider available. Paste a Gemini API key, or the environment must have an xAI key.",
		matches: [],
		bestScore: 0,
		threshold: .55,
		confident: false,
		needsAi: true,
		source: "ai",
		unmatched: true,
		provider: errors.join(" · ") || void 0
	};
});
//#endregion
export { classifyWithAi_createServerFn_handler };
