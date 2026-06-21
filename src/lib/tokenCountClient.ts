let countFn: ((text: string) => number) | null = null;
let loadPromise: Promise<(text: string) => number> | null = null;

async function loadCounter(): Promise<(text: string) => number> {
  if (countFn) return countFn;
  if (!loadPromise) {
    loadPromise = import("@shared/tokenCount").then((mod) => {
      countFn = mod.countTokens;
      return countFn;
    });
  }
  return loadPromise;
}

export async function countTokensAsync(text: string): Promise<number> {
  const counter = await loadCounter();
  return counter(text);
}

export function countTokensSync(text: string): number {
  return countFn ? countFn(text) : 0;
}
