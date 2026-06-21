import { parse as parseYaml } from "yaml";
import {
  abbreviateText,
  buildTokenAwareLegend,
  collectLegendCandidates,
  dedupeItems,
} from "./abbreviate";
import { formatParsed } from "./formatOutput";
import { parsePrompt, type PromptSection } from "./parsePrompt";
import { preCleanText } from "./preClean";
import { countTokens } from "./tokenCount";
import type { Format, Mode } from "./types";

export interface CompressResult {
  compressed: string;
  legend: Record<string, string>;
  notes: string[];
  preCleanedText: string;
}

function validateOutput(compressed: string, format: Format): void {
  if (format === "json") JSON.parse(compressed);
  if (format === "yaml") parseYaml(compressed);
}

function processSection(section: PromptSection, mode: Mode): { section: PromptSection; notes: string[] } {
  const notes: string[] = [];
  let title = section.title;

  if (title) {
    const { text, notes: titleNotes } = abbreviateText(title, mode);
    title = text;
    notes.push(...titleNotes);
  }

  let items = section.items.map((item) => {
    const { text, notes: itemNotes } = abbreviateText(item, mode);
    notes.push(...itemNotes);
    return text;
  });

  const deduped = dedupeItems(items);
  if (deduped.removed > 0) {
    notes.push(`Removed ${deduped.removed} duplicate rule(s)`);
  }
  items = deduped.items;

  return { section: { title, items }, notes };
}

function flattenProcessedText(parsed: ReturnType<typeof parsePrompt>): string {
  const parts: string[] = [];
  if (parsed.role) parts.push(parsed.role);
  for (const section of parsed.sections) {
    if (section.title) parts.push(section.title);
    parts.push(...section.items);
  }
  return parts.join("\n");
}

export function compressPrompt(text: string, format: Format, mode: Mode): CompressResult {
  const notes: string[] = [];
  const { text: cleaned, notes: preNotes } = preCleanText(text, mode);
  notes.push(...preNotes);

  const parsed = parsePrompt(cleaned);

  if (parsed.role) {
    const { text: role, notes: roleNotes } = abbreviateText(parsed.role, mode);
    parsed.role = role;
    notes.push(...roleNotes);
  }

  parsed.sections = parsed.sections.map((section) => {
    const { section: processed, notes: sectionNotes } = processSection(section, mode);
    notes.push(...sectionNotes);
    return processed;
  });

  const bodyDraft = formatParsed(parsed, format);
  const flatDraft = flattenProcessedText(parsed);

  let bodyBase = bodyDraft;
  if (format === "markdown" || format === "minified") {
    const structuredTokens = countTokens(bodyDraft);
    const flatTokens = countTokens(flatDraft);
    if (flatTokens < structuredTokens) {
      bodyBase = flatDraft;
      notes.push("Skipped structural labels (plain text was shorter)");
    }
  }

  const candidates = collectLegendCandidates(parsed);
  const { legend, body: compressed } = buildTokenAwareLegend(bodyBase, candidates);

  if (Object.keys(legend).length > 0) {
    notes.push(`Applied ${Object.keys(legend).length} token-saving abbreviation(s)`);
  }

  if (mode === "aggressive") {
    notes.push("Aggressive: lemmatization + stopword removal applied");
  }

  validateOutput(compressed, format);

  const uniqueNotes = [...new Set(notes)].slice(0, 10);
  return { compressed, legend, notes: uniqueNotes, preCleanedText: cleaned };
}
