export interface PromptSection {
  title?: string;
  items: string[];
}

export interface ParsedPrompt {
  role?: string;
  sections: PromptSection[];
  looseLines: string[];
}

const BULLET_RE = /^[\s]*[-*•]\d*\.?\s+(.+)$/;
const HEADING_RE = /^#{1,3}\s+(.+)$/;
const ROLE_RE = /^you are\b/i;
const SECTION_LINE_RE =
  /^(when|if|for|regarding|while|during)\b.+:?\s*$/i;

function isSectionHeader(line: string): boolean {
  if (SECTION_LINE_RE.test(line)) return true;
  return line.endsWith(":") && line.length < 80 && !line.includes(".");
}

export function parsePrompt(text: string): ParsedPrompt {
  const result: ParsedPrompt = { sections: [], looseLines: [] };
  let current: PromptSection | null = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const bulletMatch = line.match(BULLET_RE);
    if (bulletMatch) {
      if (!current) {
        current = { items: [] };
        result.sections.push(current);
      }
      current.items.push(bulletMatch[1].trim());
      continue;
    }

    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      current = { title: headingMatch[1], items: [] };
      result.sections.push(current);
      continue;
    }

    if (isSectionHeader(line)) {
      current = { title: line.replace(/:$/, "").trim(), items: [] };
      result.sections.push(current);
      continue;
    }

    if (!result.role && ROLE_RE.test(line)) {
      result.role = line
        .replace(/^you are\s+/i, "")
        .replace(/[.\s]+$/, "")
        .trim();
      continue;
    }

    if (!current) {
      current = { items: [] };
      result.sections.push(current);
    }
    current.items.push(line);
  }

  if (result.looseLines.length > 0 && result.sections.length === 0) {
    result.sections.push({ title: "Rules", items: [...result.looseLines] });
    result.looseLines = [];
  }

  return result;
}
