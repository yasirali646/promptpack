import { countTokens } from "./tokenCount";

/** Words safe to drop in aggressive mode (articles, filler, soft qualifiers). */
const STOPWORDS = new Set([
  "a", "an", "the", "this", "that", "these", "those",
  "is", "are", "was", "were", "be", "been", "being", "am",
  "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into",
  "and", "or", "but", "so", "if", "than", "then", "also", "just", "very",
  "really", "quite", "simply", "basically", "actually", "currently",
  "again", "later", "here", "there", "such", "some", "any",
  "can", "could", "should", "would", "will", "shall", "may", "might",
  "try", "please", "kindly",
]);

/** Never remove — they carry constraints or negation. */
const PRESERVE = new Set([
  "not", "no", "never", "nor", "none", "nothing", "nobody",
  "only", "must", "always", "all", "each", "every", "both",
  "when", "unless", "until", "while", "before", "after",
  "do", "don't", "does", "did", "don't", "cannot", "can't",
  "if", "else", "without", "within", "above", "below",
]);

const LEMMAS: Record<string, string> = {
  exceeded: "exceed",
  limits: "limit",
  limited: "limit",
  limiting: "limit",
  responses: "response",
  responding: "respond",
  provides: "provide",
  provided: "provide",
  providing: "provide",
  examples: "example",
  instructions: "instruction",
  questions: "question",
  sources: "source",
  handling: "handle",
  handled: "handle",
  using: "use",
  used: "use",
  making: "make",
  made: "make",
  following: "follow",
  followed: "follow",
  including: "include",
  included: "include",
  working: "work",
  answers: "answer",
  answered: "answer",
  asking: "ask",
  asked: "ask",
  staying: "stay",
  stayed: "stay",
  being: "be",
  goes: "go",
  going: "go",
  went: "go",
  has: "have",
  have: "have",
  having: "have",
  had: "have",
  gets: "get",
  getting: "get",
  got: "get",
  needs: "need",
  needed: "need",
  needing: "need",
  wants: "want",
  wanted: "want",
  wanting: "want",
  says: "say",
  said: "say",
  saying: "say",
  keeps: "keep",
  kept: "keep",
  keeping: "keep",
  helps: "help",
  helped: "help",
  helping: "help",
  errors: "error",
  facts: "fact",
  words: "word",
  rules: "rule",
  files: "file",
  users: "user",
  items: "item",
  steps: "step",
  tries: "try",
  tried: "try",
};

function splitWords(text: string): string[] {
  return text.match(/\S+/g) ?? [];
}

function lemmatizeWord(word: string): string {
  const match = word.match(/^([^a-zA-Z]*)([a-zA-Z]+)([^a-zA-Z]*)$/);
  if (!match) return word;

  const [, lead, core, trail] = match;
  const lower = core.toLowerCase();
  const lemma = LEMMAS[lower];
  if (!lemma) return word;

  const cased =
    core[0] === core[0].toUpperCase()
      ? lemma.charAt(0).toUpperCase() + lemma.slice(1)
      : lemma;

  return `${lead}${cased}${trail}`;
}

function applyIfShorter(text: string, transform: (input: string) => string): string {
  const next = transform(text).replace(/\s{2,}/g, " ").trim();
  if (!next) return text;
  return countTokens(next) < countTokens(text) ? next : text;
}

export function lemmatizeText(text: string): string {
  return applyIfShorter(text, (input) =>
    splitWords(input).map(lemmatizeWord).join(" ")
  );
}

export function removeStopwords(text: string): string {
  return applyIfShorter(text, (input) => {
    const kept = splitWords(input).filter((word) => {
      const core = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (!core) return true;
      if (PRESERVE.has(core)) return true;
      if (STOPWORDS.has(core)) return false;
      return true;
    });
    return kept.join(" ");
  });
}

export function collapsePunctuation(text: string): string {
  return applyIfShorter(text, (input) =>
    input
      .replace(/\.\s+\./g, ".")
      .replace(/[,;]\s*/g, " ")
      .replace(/\s+([.,!?])/g, "$1")
      .replace(/([.!?])\s*([.!?])+/g, "$1")
  );
}

export function aggressiveNlpCompress(text: string): { text: string; notes: string[] } {
  const notes: string[] = [];
  let out = text;

  const steps: Array<[string, (s: string) => string]> = [
    ["Lemmatized words", lemmatizeText],
    ["Removed stopwords", removeStopwords],
    ["Collapsed punctuation", collapsePunctuation],
  ];

  for (const [label, fn] of steps) {
    const before = out;
    out = fn(out);
    if (out !== before) notes.push(label);
  }

  return { text: out, notes };
}
