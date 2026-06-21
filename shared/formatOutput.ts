import type { ParsedPrompt } from "./parsePrompt";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/^when the user asks about\s+/i, "")
    .replace(/^when\s+/i, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20);
}

export function isSimplePrompt(parsed: ParsedPrompt): boolean {
  if (parsed.role) return false;
  if (parsed.sections.length !== 1) return false;
  const section = parsed.sections[0];
  if (section.title) return false;
  return section.items.length <= 2;
}

function plainContent(parsed: ParsedPrompt): string {
  return parsed.sections.flatMap((s) => s.items).join("; ");
}

export function toMarkdown(parsed: ParsedPrompt): string {
  if (isSimplePrompt(parsed)) return plainContent(parsed);

  const lines: string[] = [];

  if (parsed.role) {
    lines.push("## Role", parsed.role, "");
  }

  for (const section of parsed.sections) {
    const title = section.title ?? "Rules";
    lines.push(`## ${title}`);
    for (const item of section.items) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

export function toJson(parsed: ParsedPrompt): string {
  if (isSimplePrompt(parsed)) {
    return JSON.stringify({ t: plainContent(parsed) });
  }

  const obj: Record<string, unknown> = {};

  if (parsed.role) obj.r = parsed.role;

  const sections: Record<string, string[]> = {};
  for (const section of parsed.sections) {
    const key = section.title ? slugify(section.title) : "rules";
    sections[key] = section.items;
  }
  if (Object.keys(sections).length > 0) obj.s = sections;

  return JSON.stringify(obj);
}

export function toYaml(parsed: ParsedPrompt): string {
  if (isSimplePrompt(parsed)) {
    return `text: ${plainContent(parsed)}`;
  }

  const lines: string[] = [];

  if (parsed.role) {
    lines.push(`role: ${parsed.role}`);
  }

  for (const section of parsed.sections) {
    const key = section.title ? slugify(section.title) : "rules";
    lines.push(`${key}:`);
    for (const item of section.items) {
      lines.push(`  - ${item}`);
    }
  }

  return lines.join("\n");
}

export function toMinified(parsed: ParsedPrompt): string {
  if (isSimplePrompt(parsed)) return plainContent(parsed);

  const parts: string[] = [];

  if (parsed.role) parts.push(`role: ${parsed.role}`);

  for (const section of parsed.sections) {
    const label = section.title ? slugify(section.title) : "rules";
    const items = section.items.join("; ");
    parts.push(`${label}: ${items}`);
  }

  return parts.join(" | ");
}

export function formatParsed(parsed: ParsedPrompt, format: string): string {
  switch (format) {
    case "markdown":
      return toMarkdown(parsed);
    case "json":
      return toJson(parsed);
    case "yaml":
      return toYaml(parsed);
    case "minified":
      return toMinified(parsed);
    default:
      return toMarkdown(parsed);
  }
}
