import type { VercelRequest, VercelResponse } from "@vercel/node";
import { compressRequestSchema } from "./lib/compressLogic";
import { callOpenAICompress } from "./lib/openai";
import { checkRateLimit, getClientIp } from "./lib/rateLimit";
import { buildLegendBlock } from "../shared/legend";
import { preCleanText } from "../shared/preClean";
import { countTokens } from "../shared/tokenCount";
import type { CompressResponse } from "../shared/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = compressRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { text, format, mode, includeLegendInCount } = parsed.data;
  const ip = getClientIp(req);
  const { success, reset } = await checkRateLimit(ip);

  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({
      error: "Rate limit exceeded. Try again later.",
      retryAfter,
    });
  }

  try {
    const originalTokens = countTokens(text);
    const { text: preCleanedText, notes: preNotes } = preCleanText(text, mode);

    const llm = await callOpenAICompress(preCleanedText, format, mode);
    const legendBlock = buildLegendBlock(llm.legend);
    const compressedTokens = countTokens(
      includeLegendInCount ? `${legendBlock}\n${llm.compressed}` : llm.compressed
    );

    let compressed = llm.compressed;
    let warning: string | undefined;
    const allNotes = [...preNotes, ...llm.notes];

    if (compressedTokens >= originalTokens) {
      warning = "Compressed output is not shorter than the original. Consider another format or aggressive mode.";
      if (countTokens(preCleanedText) < originalTokens) {
        compressed = preCleanedText;
        allNotes.push("Fell back to heuristic pre-clean only (LLM output was longer)");
      }
    }

    const finalCompressedTokens = countTokens(
      includeLegendInCount ? `${legendBlock}\n${compressed}` : compressed
    );
    const savedPercent =
      originalTokens > 0
        ? Math.round(((originalTokens - finalCompressedTokens) / originalTokens) * 100)
        : 0;

    const response: CompressResponse = {
      originalTokens,
      compressedTokens: finalCompressedTokens,
      savedPercent,
      compressed,
      legend: llm.legend,
      legendBlock,
      notes: allNotes,
      format,
      preCleanedText,
      warning,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("compress error:", err);
    const message = err instanceof Error ? err.message : "Compression failed";
    return res.status(500).json({ error: message });
  }
}
