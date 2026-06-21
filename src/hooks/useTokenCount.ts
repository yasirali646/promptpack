import { useEffect, useState } from "react";
import { countTokensAsync, countTokensSync } from "../lib/tokenCountClient";

export function useTokenCount(text: string, debouncedText: string): number {
  const [count, setCount] = useState(() => countTokensSync(debouncedText));

  useEffect(() => {
    let cancelled = false;
    countTokensAsync(debouncedText).then((n: number) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedText]);

  if (text === debouncedText && count === 0 && text.length > 0) {
    return count;
  }

  return count;
}
