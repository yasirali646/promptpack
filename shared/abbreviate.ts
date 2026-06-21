import { aggressiveNlpCompress } from "./nlpCompress";
import { countTokens } from "./tokenCount";
import { buildLegendBlock } from "./legend";
import type { Mode } from "./types";

interface Replacement {
  pattern: RegExp;
  replacement: string;
  aggressiveOnly?: boolean;
}

const REPLACEMENTS: Replacement[] = [
  { pattern: /\bplease\s+/gi, replacement: "", aggressiveOnly: true },
  { pattern: /\bkindly\s+/gi, replacement: "", aggressiveOnly: true },
  { pattern: /\bmake sure to\s+/gi, replacement: "", aggressiveOnly: true },
  { pattern: /\bmake sure that\s+/gi, replacement: "", aggressiveOnly: true },
  { pattern: /\bit is important to\s+/gi, replacement: "", aggressiveOnly: true },
  { pattern: /\bremember to\s+/gi, replacement: "", aggressiveOnly: true },
  { pattern: /\bdon't forget to\s+/gi, replacement: "", aggressiveOnly: true },
  { pattern: /\btry again later\.?\s*/gi, replacement: "retry.", aggressiveOnly: true },
  { pattern: /\brate limit exceeded\.?\s*/gi, replacement: "rate-limited. ", aggressiveOnly: true },
  { pattern: /\bstep by step\b/gi, replacement: "stepwise" },
  { pattern: /\bat all times\b/gi, replacement: "always" },
  { pattern: /\bwhenever possible\b/gi, replacement: "when possible" },
  { pattern: /\bworking examples\b/gi, replacement: "examples" },
  { pattern: /\brespond in a clear and concise manner\b/gi, replacement: "be concise" },
  { pattern: /\bclear and concise manner\b/gi, replacement: "concisely" },
  { pattern: /\bclear and concise\b/gi, replacement: "concise" },
  { pattern: /\bproviding factual information\b/gi, replacement: "for facts" },
  { pattern: /\bexplain your reasoning\b/gi, replacement: "explain" },
  { pattern: /\bclarifying questions\b/gi, replacement: "clarify" },
  { pattern: /\bthe user asks about\b/gi, replacement: "user asks" },
  { pattern: /\bDo not invent information\.?\s*/gi, replacement: "No hallucination. " },
  { pattern: /\bDo not hallucinate\.?\s*/gi, replacement: "" },
  { pattern: /\bNever make up facts\.?\s*/gi, replacement: "" },
  { pattern: /\bRemember to stay professional\.?\s*/gi, replacement: "Stay professional. " },
  { pattern: /\bRemember to be friendly\.?\s*/gi, replacement: "Be friendly. " },
  { pattern: /\bRemember to be accurate\.?\s*/gi, replacement: "Be accurate. " },
  { pattern: /\bunless asked otherwise\b/gi, replacement: "unless asked" },
  { pattern: /\bwhen the request is ambiguous\b/gi, replacement: "if ambiguous" },
  { pattern: /\.\s+\./g, replacement: "." },
  { pattern: /\s{2,}/g, replacement: " " },
];

function tokenSafeReplace(text: string, pattern: RegExp, replacement: string): string {
  const replaced = text.replace(pattern, replacement).trim();
  if (!replaced) return text;
  return countTokens(replaced) < countTokens(text) ? replaced : text;
}

export function abbreviateText(text: string, mode: Mode): { text: string; notes: string[] } {
  const notes: string[] = [];
  let out = text;

  for (const { pattern, replacement, aggressiveOnly } of REPLACEMENTS) {
    if (aggressiveOnly && mode === "lossless") continue;
    const before = out;
    out = tokenSafeReplace(out, pattern, replacement);
    if (out !== before) {
      notes.push(`Shortened: ${pattern.source.slice(0, 40)}`);
    }
  }

  if (mode === "aggressive") {
    const { text: nlp, notes: nlpNotes } = aggressiveNlpCompress(out);
    out = nlp;
    notes.push(...nlpNotes);
  }

  return { text: out, notes };
}

const TITLE_KEYS: Record<string, string> = {
  "general knowledge": "gk",
  "error handling": "err",
  code: "cd",
  rules: "rl",
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(text: string, phrase: string): number {
  const re = new RegExp(escapeRegex(phrase), "gi");
  return [...text.matchAll(re)].length;
}

function makeShortKey(phrase: string, usedKeys: Set<string>): string {
  const lower = phrase.toLowerCase();
  if (TITLE_KEYS[lower] && !usedKeys.has(TITLE_KEYS[lower])) {
    return TITLE_KEYS[lower];
  }

  const words = lower.split(/\s+/).filter(Boolean);
  let key = words.length === 1 ? words[0].slice(0, 4) : words.map((w) => w[0]).join("").slice(0, 4);
  let i = 2;
  const base = key;
  while (usedKeys.has(key)) {
    key = base + i;
    i++;
  }
  return key;
}

function replacePhrase(text: string, phrase: string, key: string): string {
  return text.replace(new RegExp(escapeRegex(phrase), "gi"), key);
}

export function buildTokenAwareLegend(
  body: string,
  candidates: string[]
): { legend: Record<string, string>; body: string } {
  const legend: Record<string, string> = {};
  let currentBody = body;
  const usedKeys = new Set<string>();

  const ranked = [...new Set(candidates)]
    .filter((phrase) => phrase.length >= 12)
    .map((phrase) => ({
      phrase,
      count: countOccurrences(currentBody, phrase),
      length: phrase.length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count * b.length - a.count * a.length);

  for (const { phrase, count } of ranked) {
    const key = makeShortKey(phrase, usedKeys);
    const newBody = replacePhrase(currentBody, phrase, key);
    if (newBody === currentBody) continue;

    const trialLegend = { ...legend, [key]: phrase };
    const trialLegendBlock = buildLegendBlock(trialLegend);
    const oldTotal = countTokens(buildLegendBlock(legend) + currentBody);
    const newTotal = countTokens(trialLegendBlock + newBody);

    const phraseTokens = countTokens(phrase) * count;
    const keyTokens = countTokens(key) * count;

    if (newTotal < oldTotal && keyTokens < phraseTokens) {
      legend[key] = phrase;
      usedKeys.add(key);
      currentBody = newBody;
    } else if (count >= 2 && newTotal < oldTotal) {
      legend[key] = phrase;
      usedKeys.add(key);
      currentBody = newBody;
    }
  }

  return { legend, body: currentBody };
}

export function dedupeItems(items: string[]): { items: string[]; removed: number } {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const item of items) {
    const key = item.trim().toLowerCase().replace(/\.$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return { items: out, removed: items.length - out.length };
}

export function collectLegendCandidates(parsed: {
  role?: string;
  sections: Array<{ title?: string; items: string[] }>;
}): string[] {
  const candidates: string[] = [];

  if (parsed.role) candidates.push(parsed.role);
  for (const section of parsed.sections) {
    if (section.title) candidates.push(section.title);
    candidates.push(...section.items);
  }

  return candidates;
}
