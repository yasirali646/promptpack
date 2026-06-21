export function buildLegendBlock(legend: Record<string, string>): string {
  const entries = Object.entries(legend);
  if (entries.length === 0) return "";

  const lines = entries.map(([key, value]) => `${key}=${value}`);
  return `## Legend\n${lines.join(", ")}\n`;
}
