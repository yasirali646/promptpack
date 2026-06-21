import { compressPrompt } from "./compress";
import { buildLegendBlock } from "./legend";
import { countTokens } from "./tokenCount";
import type { CompressRequest, CompressResponse } from "./types";

export function buildCompressResponse({
  text,
  format,
  mode,
  includeLegendInCount = true,
}: CompressRequest): CompressResponse {
  const originalTokens = countTokens(text);
  const { compressed, legend, notes, preCleanedText } = compressPrompt(text, format, mode);

  const legendBlock = buildLegendBlock(legend);
  const bodyTokens = countTokens(compressed);
  const legendTokens = countTokens(legendBlock);
  const totalTokens = bodyTokens + legendTokens;
  const compressedTokens = includeLegendInCount ? totalTokens : bodyTokens;

  const bodySavedPercent =
    originalTokens > 0
      ? Math.round(((originalTokens - bodyTokens) / originalTokens) * 100)
      : 0;

  let warning: string | undefined;
  if (includeLegendInCount && totalTokens >= originalTokens && bodyTokens < originalTokens) {
    warning = `Body saves ${originalTokens - bodyTokens} tokens (${bodyTokens} total), but legend adds ${legendTokens}. Paste body only, or copy with legend if your model needs it.`;
  } else if (bodyTokens >= originalTokens) {
    warning = "Body token count is not lower than the original. Try aggressive mode or another format.";
  }

  return {
    originalTokens,
    bodyTokens,
    legendTokens,
    compressedTokens,
    savedPercent: bodySavedPercent,
    compressed,
    legend,
    legendBlock,
    notes,
    format,
    preCleanedText,
    warning,
  };
}
