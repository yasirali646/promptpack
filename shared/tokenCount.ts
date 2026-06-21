import { getEncoding } from "js-tiktoken";

let encoding: ReturnType<typeof getEncoding> | null = null;

function getEncoder() {
  if (!encoding) {
    encoding = getEncoding("cl100k_base");
  }
  return encoding;
}

export function countTokens(text: string): number {
  if (!text) return 0;
  return getEncoder().encode(text).length;
}
