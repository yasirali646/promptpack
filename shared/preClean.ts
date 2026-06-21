import type { Mode } from "./types";

const FILLER_RE =
  /\b(please|kindly|make sure to|make sure that|it is important to|remember to|don't forget to|at all times|whenever possible)\b/gi;

export function preCleanText(text: string, mode: Mode): { text: string; notes: string[] } {
  const notes: string[] = [];
  let out = text.replace(/\r\n/g, "\n").trim();

  const beforeLines = out.split("\n").length;
  const lines = out.split("\n");
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const line of lines) {
    const key = line.trim().toLowerCase();
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    deduped.push(line.replace(/[ \t]+$/g, ""));
  }

  out = deduped.join("\n").replace(/\n{3,}/g, "\n\n");
  if (deduped.length < beforeLines) {
    notes.push("Removed duplicate lines during pre-clean");
  }

  if (mode === "aggressive") {
    const stripped = out.replace(FILLER_RE, "").replace(/  +/g, " ");
    if (stripped !== out) {
      notes.push("Stripped filler phrases (aggressive pre-clean)");
      out = stripped;
    }
  }

  return { text: out.trim(), notes };
}
