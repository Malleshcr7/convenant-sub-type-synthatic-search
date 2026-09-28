import master from "@/data/master-data.json";
import type { CovenantRecord, MatchHit, MatchResult } from "./types";

const STOPWORDS = new Set([
  "the", "and", "or", "of", "to", "a", "an", "in", "for", "on", "by", "with",
  "as", "at", "from", "that", "this", "such", "any", "all", "shall", "be",
  "is", "are", "was", "were", "been", "being", "its", "their", "his", "her",
  "not", "no", "under", "over", "other", "than", "into", "upon", "each",
  "which", "who", "whom", "will", "may", "must", "can", "including",
  "without", "limitation", "hereof", "thereof", "hereby", "herein",
  "between", "among", "per", "via", "etc", "ie", "eg",
]);

const ABBREVIATIONS: Record<string, string> = {
  dscr: "debt service coverage ratio",
  dsra: "debt service reserve account",
  dsr: "debt service reserve",
  tra: "trust and retention account escrow",
  ppa: "power purchase agreement offtake",
  plf: "plant load factor",
  cuf: "capacity utilization factor",
  om: "operation and maintenance",
  kmp: "key managerial personnel",
  facr: "fixed asset coverage ratio",
  icr: "interest coverage ratio",
  ebitda: "earnings before interest tax depreciation amortization",
  mmra: "major maintenance reserve account",
  irr: "inverter replacement reserve",
  scada: "supervisory control and data acquisition",
  kyc: "know your customer",
  lei: "legal entity identifier",
  ufce: "unhedged foreign currency exposure",
  tnw: "tangible net worth",
  tol: "total outside liabilities",
  ltd: "long term debt",
  td: "total debt",
  drr: "debenture redemption reserve",
  mis: "management information system",
  esg: "environmental social governance",
  ndc: "no due certificate",
  roc: "registrar of companies charge filing",
};

const WORD_RE = /[a-z0-9]+(?:[./&%-][a-z0-9]+)?/gi;

function stem(tok: string): string {
  if (tok.length > 4 && tok.endsWith("s") && !/(ss|us|is)$/.test(tok)) {
    return tok.slice(0, -1);
  }
  return tok;
}

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const matches = text.toLowerCase().match(WORD_RE) ?? [];
  for (const raw of matches) {
    const tok = raw.replace("&", " ").replace(/^[.\-/]+|[.\-/]+$/g, "");
    if (!tok || STOPWORDS.has(tok) || tok.length <= 1) continue;
    const stemmed = stem(tok);
    tokens.push(stemmed);
    const expansion = ABBREVIATIONS[tok] ?? ABBREVIATIONS[stemmed];
    if (expansion) tokens.push(...tokenize(expansion));
  }
  return tokens;
}

function expandQuery(text: string): string {
  const extra: string[] = [];
  const matches = text.toLowerCase().match(WORD_RE) ?? [];
  for (const raw of matches) {
    const key = stem(raw.replace(/^[.\-/]+|[.\-/]+$/g, ""));
    const orig = raw.replace(/^[.\-/]+|[.\-/]+$/g, "");
    if (ABBREVIATIONS[key]) extra.push(ABBREVIATIONS[key]);
    else if (ABBREVIATIONS[orig]) extra.push(ABBREVIATIONS[orig]);
  }
  return extra.length ? `${text} ${extra.join(" ")}` : text;
}

function phrasePresent(haystack: string, phrase: string): boolean {
  const parts = phrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!parts.length) return false;
  const esc = parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  esc[esc.length - 1] = `${esc[esc.length - 1]}s?`;
  const pattern = new RegExp(`\\b${esc.join("[\\s\\-_/&]+")}\\b`, "i");
  return pattern.test(haystack);
}

function tokenCoverage(queryTokens: Set<string>, phrase: string): number {
  const pt = tokenize(phrase);
  if (!pt.length) return 0;
  let hits = 0;
  for (const t of pt) if (queryTokens.has(t)) hits += 1;
  return hits / pt.length;
}

function keywordWeight(kw: string): number {
  const words = kw.split(/\s+/).filter(Boolean);
  const chars = kw.trim().length;
  if (words.length >= 3 || chars >= 18) return 1;
  if (words.length === 2 || chars >= 8) return 0.86;
  return 0.52;
}

function levenshteinRatio(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  if (Math.abs(a.length - b.length) > 18) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const curr = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      curr.push(Math.min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost));
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]!;
  }
  const dist = prev[b.length]!;
  return 1 - dist / Math.max(a.length, b.length);
}

function tfidf(
  tokens: string[],
  idf: Map<string, number>,
): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  if (!tf.size) return new Map();
  const length = tokens.length;
  const vec = new Map<string, number>();
  let norm = 0;
  for (const [t, c] of tf) {
    const v = (c / length) * (idf.get(t) ?? 1);
    vec.set(t, v);
    norm += v * v;
  }
  norm = Math.sqrt(norm) || 1;
  for (const [t, v] of vec) vec.set(t, v / norm);
  return vec;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  if (!a.size || !b.size) return 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  let sum = 0;
  for (const [k, v] of small) sum += v * (large.get(k) ?? 0);
  return sum;
}

const covenants = master.covenants as CovenantRecord[];

const prepared = (() => {
  const n = covenants.length;
  const df = new Map<string, number>();
  const docs: string[][] = [];
  for (const cov of covenants) {
    const blob = [
      cov.subtype,
      cov.category,
      cov.covenantType,
      cov.nature,
      cov.criticality,
      cov.keywordsRaw,
      ...(cov.keywords ?? []),
    ].join(" ");
    const toks = tokenize(blob);
    docs.push(toks);
    const uniq = new Set(toks);
    for (const t of uniq) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [t, c] of df) idf.set(t, Math.log((n + 1) / (c + 1)) + 1);
  const docVecs = docs.map((toks) => tfidf(toks, idf));
  return { idf, docVecs };
})();

function keywordScore(
  query: string,
  queryTokens: Set<string>,
  cov: CovenantRecord,
): { score: number; matched: string[] } {
  const hits: { name: string; score: number }[] = [];
  const keywords = cov.keywords ?? [];
  const q = query.toLowerCase();

  if (phrasePresent(q, cov.subtype.toLowerCase())) {
    hits.push({ name: cov.subtype, score: 1 });
  } else {
    const covRatio = tokenCoverage(queryTokens, cov.subtype);
    if (covRatio >= 0.6) hits.push({ name: cov.subtype, score: 0.72 * covRatio });
  }

  for (const kw of keywords) {
    if (!kw) continue;
    if (phrasePresent(q, kw)) {
      hits.push({ name: kw, score: keywordWeight(kw) });
      continue;
    }
    const covRatio = tokenCoverage(queryTokens, kw);
    if (covRatio >= 0.7) {
      hits.push({ name: kw, score: 0.55 * covRatio * keywordWeight(kw) });
    }
  }

  if (!hits.length) return { score: 0, matched: [] };

  const seen = new Map<string, number>();
  for (const h of hits.sort((a, b) => b.score - a.score)) {
    const key = h.name.toLowerCase();
    if (!seen.has(key)) seen.set(key, h.score);
  }
  const values = [...seen.values()];
  const denom = Math.max(keywords.length, 1);
  const raw = values.reduce((s, v) => s + v, 0) / denom;
  const best = Math.max(...values);
  const score = Math.min(1, 0.55 * best + 0.45 * Math.min(1, raw * 1.35));
  const matched = [...seen.entries()]
    .filter(([, s]) => s >= 0.5)
    .map(([k]) => k)
    .slice(0, 8);
  return { score, matched };
}

function titleFuzzy(query: string, cov: CovenantRecord): number {
  const subtype = cov.subtype.toLowerCase();
  const q = query.toLowerCase();
  if (!subtype) return 0;
  if (q.includes(subtype)) return 1;
  return Math.max(0, levenshteinRatio(subtype, q.slice(0, 280)) * 0.4);
}

export function getLibrary(): CovenantRecord[] {
  return covenants;
}

export function matchClause(
  text: string,
  topK = 8,
  threshold = 0.38,
): MatchResult {
  const query = text.trim();
  if (query.length < 12) {
    return {
      ok: false,
      error: "Paste a longer clause — at least a full sentence.",
      matches: [],
      bestScore: 0,
      threshold,
      confident: false,
      needsAi: false,
      source: "library",
    };
  }

  const expanded = expandQuery(query);
  const qTokensList = tokenize(expanded);
  const qTokenSet = new Set(qTokensList);
  const qVec = tfidf(qTokensList, prepared.idf);

  const ranked: MatchHit[] = [];
  covenants.forEach((cov, idx) => {
    const kw = keywordScore(expanded, qTokenSet, cov);
    const sem = cosine(qVec, prepared.docVecs[idx]!);
    const fuzzy = titleFuzzy(expanded, cov);
    const hybrid = 0.5 * kw.score + 0.38 * sem + 0.12 * fuzzy;
    if (hybrid < 0.04 && kw.score < 0.08) return;
    ranked.push({
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
      matchedKeywords: kw.matched,
      scores: {
        keyword: round4(kw.score),
        semantic: round4(sem),
        fuzzy: round4(fuzzy),
        hybrid: round4(hybrid),
      },
    });
  });

  ranked.sort((a, b) => b.scores.hybrid - a.scores.hybrid);
  const top = ranked.slice(0, Math.max(1, topK));
  const best = top[0]?.scores.hybrid ?? 0;
  const confident = best >= threshold;
  return {
    ok: true,
    queryLength: query.length,
    librarySize: covenants.length,
    matches: top,
    bestScore: round4(best),
    threshold,
    confident,
    needsAi: !confident,
    source: "library",
  };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
