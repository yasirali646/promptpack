export type Format = "markdown" | "json" | "yaml" | "minified";
export type Mode = "lossless" | "aggressive";

export interface CompressRequest {
  text: string;
  format: Format;
  mode: Mode;
  includeLegendInCount?: boolean;
}

export interface CompressResponse {
  originalTokens: number;
  bodyTokens: number;
  legendTokens: number;
  compressedTokens: number;
  savedPercent: number;
  compressed: string;
  legend: Record<string, string>;
  legendBlock: string;
  notes: string[];
  format: Format;
  preCleanedText: string;
  warning?: string;
}

export interface HeuristicHint {
  type: "duplicate" | "filler" | "whitespace" | "list";
  message: string;
  count?: number;
}
