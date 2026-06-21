import { parse as parseYaml } from "yaml";
import { z } from "zod";
import type { Format } from "../../shared/types";

export const formatSchema = z.enum(["markdown", "json", "yaml", "minified"]);
export const modeSchema = z.enum(["lossless", "aggressive"]);

export const compressRequestSchema = z.object({
  text: z.string().min(1).max(8000),
  format: formatSchema,
  mode: modeSchema,
  includeLegendInCount: z.boolean().optional().default(true),
});

export type CompressRequestInput = z.infer<typeof compressRequestSchema>;

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
