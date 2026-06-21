import { parse as parseYaml } from "yaml";
import { z } from "zod";
import type { Format, Mode } from "../../shared/types";

export const formatSchema = z.enum(["markdown", "json", "yaml", "minified"]);
export const modeSchema = z.enum(["lossless", "aggressive"]);

export const compressRequestSchema = z.object({
  text: z.string().min(1).max(8000),
  format: formatSchema,
  mode: modeSchema,
  includeLegendInCount: z.boolean().optional().default(true),
});

export const llmResultSchema = z.object({
  compressed: z.string().min(1),
  legend: z.record(z.string(), z.string()).default({}),
  notes: z.array(z.string()).default([]),
});

export type CompressRequestInput = z.infer<typeof compressRequestSchema>;

export function buildSystemPrompt(format: Format, mode: Mode): string {
  const modeRule =
    mode === "lossless"
      ? "Preserve ALL constraints, edge cases, negative rules, and requirements. Do not drop meaning."
      : "Remove redundancy and filler while keeping every constraint, rule, and edge case.";

  const formatRule: Record<Format, string> = {
    markdown: "Output valid Markdown with headings, lists, or tables where appropriate. Minimize prose.",
    json: "Output minified valid JSON (single line, no pretty-print). Use short keys with a legend.",
    yaml: "Output valid compact YAML. Use short keys with a legend.",
    minified: "Output dense plain-text instructions using abbreviations and short labels with a legend.",
  };

  return `You are PromptPack, a token-efficient prompt compressor.

${modeRule}

Format: ${format}
${formatRule[format]}

Rules:
- Never invent new requirements
- Use short keys in legend (2-4 chars when possible)
- legend maps short keys to full meanings
- notes: brief list of what you changed (max 5 items)
- compressed field must be the full compressed prompt only (no markdown fences)

Respond with JSON only:
{"compressed":"...","legend":{"mt":"max tokens"},"notes":["..."]}`;
}

export function buildUserPrompt(text: string): string {
  return `Compress this prompt:\n\n${text}`;
}

export function validateStructuredOutput(
  compressed: string,
  format: Format
): { valid: boolean; error?: string } {
  if (format === "json") {
    try {
      JSON.parse(compressed);
      return { valid: true };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }

  if (format === "yaml") {
    try {
      parseYaml(compressed);
      return { valid: true };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : "Invalid YAML" };
    }
  }

  return { valid: true };
}
