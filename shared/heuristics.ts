import type { HeuristicHint } from "./types";

const FILLER_PATTERNS = [
  /\bplease\b/gi,
  /\bkindly\b/gi,
  /\bmake sure to\b/gi,
  /\bmake sure that\b/gi,
  /\bit is important to\b/gi,
  /\bremember to\b/gi,
  /\bdon't forget to\b/gi,
  /\bat all times\b/gi,
  /\bwhenever possible\b/gi,
];

export function analyzePrompt(text: string): HeuristicHint[] {
  const hints: HeuristicHint[] = [];
  if (!text.trim()) return hints;

  const lines = text.split("\n");
  const normalized = lines.map((l) => l.trim().toLowerCase()).filter(Boolean);
  const seen = new Map<string, number>();
  let duplicateCount = 0;

  for (const line of normalized) {
    seen.set(line, (seen.get(line) ?? 0) + 1);
    if ((seen.get(line) ?? 0) > 1) duplicateCount += 1;
  }

  if (duplicateCount > 0) {
    hints.push({
      type: "duplicate",
      message: "Duplicate or repeated lines detected",
      count: duplicateCount,
    });
  }

  let fillerCount = 0;
  for (const pattern of FILLER_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) fillerCount += matches.length;
  }

  if (fillerCount > 0) {
    hints.push({
      type: "filler",
      message: "Filler phrases that can be trimmed in aggressive mode",
      count: fillerCount,
    });
  }

  if (/\s+\n|\n{3,}|  +/.test(text)) {
    hints.push({
      type: "whitespace",
      message: "Extra whitespace or blank lines can be normalized",
    });
  }

  const bulletLines = lines.filter((l) => /^[\s]*[-*•]\s/.test(l)).length;
  if (bulletLines >= 4) {
    hints.push({
      type: "list",
      message: "List-heavy content may compress well as a table or structured block",
      count: bulletLines,
    });
  }

  return hints;
}
