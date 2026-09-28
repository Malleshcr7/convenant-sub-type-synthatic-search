export type CovenantRecord = {
  id: string;
  subtype: string;
  category: string;
  covenantType: string;
  nature: string;
  criticality: string;
  attachment: string;
  documentRequired: string;
  attachmentGroup: string;
  assignedTo: string;
  maker: string;
  checker: string;
  keywords: string[];
  keywordsRaw: string;
};

export type ScoreBreakdown = {
  keyword: number | null;
  semantic: number | null;
  fuzzy: number | null;
  hybrid: number;
  ai?: number | null;
};

export type MatchHit = {
  id: string;
  subtype: string;
  category: string;
  covenantType: string;
  nature: string;
  criticality: string;
  assignedTo: string;
  maker: string;
  checker: string;
  keywords: string[];
  matchedKeywords: string[];
  reason?: string;
  scores: ScoreBreakdown;
};

export type MatchResult = {
  ok: boolean;
  error?: string;
  queryLength?: number;
  librarySize?: number;
  matches: MatchHit[];
  bestScore: number;
  threshold: number;
  confident: boolean;
  needsAi: boolean;
  source: "library" | "ai";
  unmatched?: boolean;
  suggestedSubtype?: string | null;
  provider?: string;
};

export type SampleClause = {
  id: string;
  title: string;
  expected: string | null;
  text: string;
};
