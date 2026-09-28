import { useMemo, useState } from "react";
import { classifyWithAi } from "@/lib/covenant/classify";
import { getLibrary, matchClause } from "@/lib/covenant/matcher";
import type { MatchHit, MatchResult, SampleClause } from "@/lib/covenant/types";
import samplesData from "@/data/samples.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn, pct } from "@/lib/utils";

const samples = samplesData as SampleClause[];
const DEFAULT_THRESHOLD = 0.38;

type Tab = "match" | "library";

export function CovenantWorkbench() {
  const library = useMemo(() => getLibrary(), []);
  const [tab, setTab] = useState<Tab>("match");
  const [clause, setClause] = useState(samples[0]?.text ?? "");
  const [activeSample, setActiveSample] = useState(samples[0]?.id ?? "");
  const [topK, setTopK] = useState(8);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [forceAi, setForceAi] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [libraryFilter, setLibraryFilter] = useState("");
  const [libraryResult, setLibraryResult] = useState<MatchResult | null>(null);
  const [aiResult, setAiResult] = useState<MatchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expected = samples.find((s) => s.id === activeSample)?.expected;

  function loadSample(sample: SampleClause) {
    setActiveSample(sample.id);
    setClause(sample.text);
    setLibraryResult(null);
    setAiResult(null);
    setError(null);
  }

  async function runMatch() {
    setError(null);
    setAiResult(null);
    const local = matchClause(clause, topK, threshold);
    setLibraryResult(local);
    if (!local.ok) {
      setError(local.error ?? "Could not match.");
      return;
    }
    if (!forceAi && !local.needsAi) return;
    setBusy(true);
    try {
      const ai = await classifyWithAi({
        data: { clause, geminiKey: geminiKey || undefined },
      });
      setAiResult(ai);
      if (!ai.ok) setError(ai.error ?? "AI fallback failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI fallback failed.");
    } finally {
      setBusy(false);
    }
  }

  const filteredLibrary = library.filter((c) => {
    if (!libraryFilter.trim()) return true;
    const q = libraryFilter.toLowerCase();
    return (
      c.subtype.toLowerCase().includes(q) ||
      c.covenantType.toLowerCase().includes(q) ||
      c.keywordsRaw.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Facility agreement screening
            </p>
            <h1 className="mt-1 font-display text-4xl font-medium tracking-[-0.04em] text-foreground sm:text-5xl">
              Covenant Scout
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Paste a clause. Keyword, semantic, and hybrid search rank the{" "}
              {library.length} subtypes from the Covenant Matrix. Weak hits fall
              through to Gemini or Grok.
            </p>
          </div>
          <div className="flex gap-2">
            <TabButton active={tab === "match"} onClick={() => setTab("match")}>
              Matcher
            </TabButton>
            <TabButton
              active={tab === "library"}
              onClick={() => setTab("library")}
            >
              Library
            </TabButton>
          </div>
        </div>
      </header>

      {tab === "match" ? (
        <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] sm:px-6">
          <section className="rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Clause text</h2>
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {clause.trim().length} chars
              </span>
            </div>
            <Textarea
              value={clause}
              onChange={(e) => {
                setClause(e.target.value);
                setActiveSample("");
              }}
              placeholder="Paste a covenant clause or definition from the Facility Agreement…"
              aria-label="Clause text"
            />

            <p className="mt-4 mb-2 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Samples from the wind facility agreement
            </p>
            <div className="flex flex-wrap gap-1.5">
              {samples.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => loadSample(s)}
                  className={cn(
                    "h-9 whitespace-nowrap rounded-full border px-3 text-xs",
                    activeSample === s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
            {expected ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Expected library hit:{" "}
                <span className="text-foreground">{expected}</span>
              </p>
            ) : null}

            <Separator className="my-5" />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs">
                <span className="mb-1.5 block font-medium text-muted-foreground">
                  Top matches · {topK}
                </span>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1.5 block font-medium text-muted-foreground">
                  {`AI fallback if hybrid < ${pct(threshold)}`}
                </span>
                <input
                  type="range"
                  min={20}
                  max={70}
                  value={Math.round(threshold * 100)}
                  onChange={(e) => setThreshold(Number(e.target.value) / 100)}
                  className="w-full accent-primary"
                />
              </label>
            </div>

            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                checked={forceAi}
                onChange={(e) => setForceAi(e.target.checked)}
              />
              <span>
                Always run meaning-based AI, even when the library is confident.
              </span>
            </label>

            <label className="mt-3 block text-xs">
              <span className="mb-1.5 block font-medium text-muted-foreground">
                Gemini API key (optional)
              </span>
              <Input
                type="password"
                autoComplete="off"
                placeholder="Leave blank to use Grok when available"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
            </label>

            <Button
              className="mt-5 w-full"
              size="lg"
              onClick={() => void runMatch()}
              disabled={busy}
            >
              {busy ? "Reading clause…" : "Match subtypes"}
            </Button>
          </section>

          <section>
            {error ? (
              <div className="mb-4 rounded-[var(--radius-md)] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            {!libraryResult ? (
              <EmptyState />
            ) : (
              <div className="space-y-5">
                <ResultHeader result={libraryResult} />
                <ol className="space-y-3">
                  {libraryResult.matches.map((hit, i) => (
                    <li key={hit.id}>
                      <MatchCard hit={hit} rank={i + 1} source="library" />
                    </li>
                  ))}
                </ol>

                {busy ? (
                  <p className="text-sm text-muted-foreground">
                    Asking Gemini / Grok to read the clause…
                  </p>
                ) : null}

                {aiResult?.ok ? (
                  <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Meaning-based · {aiResult.provider ?? "AI"}
                    </p>
                    {aiResult.unmatched ? (
                      <p className="mt-2 text-sm">
                        No library subtype is a clean fit.
                        {aiResult.suggestedSubtype ? (
                          <>
                            {" "}
                            Suggested new subtype:{" "}
                            <strong>{aiResult.suggestedSubtype}</strong>
                          </>
                        ) : null}
                      </p>
                    ) : null}
                    <div className="mt-3 space-y-3">
                      {aiResult.matches.map((hit, i) => (
                        <MatchCard
                          key={`ai-${hit.id}`}
                          hit={hit}
                          rank={i + 1}
                          source="ai"
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-medium tracking-[-0.03em]">
                Covenant Matrix
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredLibrary.length} of {library.length} subtypes
              </p>
            </div>
            <Input
              className="max-w-sm"
              placeholder="Filter subtype, type, or keyword"
              value={libraryFilter}
              onChange={(e) => setLibraryFilter(e.target.value)}
            />
          </div>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_120px_140px_90px_90px] gap-3 border-b border-border px-4 py-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:grid">
              <span>Subtype</span>
              <span>Category</span>
              <span>Type</span>
              <span>Nature</span>
              <span>Severity</span>
            </div>
            <ul>
              {filteredLibrary.map((c) => (
                <li
                  key={c.id}
                  className="border-b border-border px-4 py-3 last:border-b-0"
                >
                  <div className="grid gap-1 sm:grid-cols-[minmax(0,1.4fr)_120px_140px_90px_90px] sm:items-start sm:gap-3">
                    <div>
                      <p className="text-sm font-medium">{c.subtype}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {c.keywords.slice(0, 5).join(" · ")}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.category}</p>
                    <p className="text-xs text-muted-foreground">{c.covenantType}</p>
                    <p className="text-xs text-muted-foreground">{c.nature}</p>
                    <Badge
                      tone={c.criticality.toLowerCase().includes("non") ? "quiet" : "critical"}
                    >
                      {c.criticality || "—"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 min-w-[7.5rem] rounded-[var(--radius-sm)] border px-4 text-sm font-medium",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col justify-between rounded-[var(--radius-xl)] border border-dashed border-border bg-card/60 p-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Ranked subtypes
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em]">
          Load a sample, or paste your own chunk.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Hybrid score blends keyword hits on the Smart AI list, TF-IDF semantic
          similarity, and fuzzy title overlap. If the best hybrid score is below
          the threshold, meaning-based AI ranks the same library.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Source sheet: Covenant Matrix · POC template
      </p>
    </div>
  );
}

function ResultHeader({ result }: { result: MatchResult }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Library ranking
        </p>
        <p className="mt-1 font-display text-3xl font-medium tracking-[-0.03em] tabular-nums">
          {pct(result.bestScore)}
          <span className="ml-1 text-lg text-muted-foreground">hybrid</span>
        </p>
      </div>
      <Badge tone={result.confident ? "accent" : "quiet"}>
        {result.confident ? "Confident — AI not required" : "Below threshold — AI recommended"}
      </Badge>
    </div>
  );
}

function MatchCard({
  hit,
  rank,
  source,
}: {
  hit: MatchHit;
  rank: number;
  source: "library" | "ai";
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {String(rank).padStart(2, "0")} · {hit.id}
          </p>
          <h3 className="mt-0.5 text-base font-semibold leading-snug">
            {hit.subtype}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {hit.category} · {hit.covenantType} · {hit.nature}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-medium tabular-nums tracking-[-0.03em]">
            {pct(hit.scores.hybrid)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {source === "ai" ? "AI" : "hybrid"}
          </p>
        </div>
      </div>

      {source === "library" ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <ScoreMeter label="Keyword" value={hit.scores.keyword} />
          <ScoreMeter label="Semantic" value={hit.scores.semantic} />
          <ScoreMeter label="Fuzzy" value={hit.scores.fuzzy} />
        </div>
      ) : null}

      {hit.reason ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {hit.reason}
        </p>
      ) : null}

      {hit.matchedKeywords.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {hit.matchedKeywords.map((k) => (
            <Badge key={k} tone="accent">
              {k}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge
          tone={hit.criticality.toLowerCase().includes("non") ? "quiet" : "critical"}
        >
          {hit.criticality || "severity n/a"}
        </Badge>
        {hit.checker ? <Badge>{hit.checker}</Badge> : null}
      </div>
    </article>
  );
}

function ScoreMeter({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{pct(value)}</span>
      </div>
      <div className="score-bar">
        <span style={{ width: `${Math.max(2, Math.round(v * 100))}%` }} />
      </div>
    </div>
  );
}
