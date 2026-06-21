import { useState } from "react";
import CompressButton from "./components/CompressButton";
import FormatPicker from "./components/FormatPicker";
import ModeToggle from "./components/ModeToggle";
import PromptEditor from "./components/PromptEditor";
import ResultsPanel from "./components/ResultsPanel";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { compressPrompt } from "./lib/api";
import { analyzePrompt } from "./lib/index";
import { useTokenCount } from "./hooks/useTokenCount";
import type { CompressResponse, Format, Mode } from "@shared/types";
import "./styles/index.css";

const SAMPLE = `You are a helpful assistant. Please make sure to follow these rules at all times.

Please always respond in a clear and concise manner.
Please make sure to cite your sources when providing factual information.
Do not invent information. Do not hallucinate. Never make up facts.

When the user asks about code:
- Please provide working examples
- Please explain your reasoning step by step
- Make sure to include error handling

When the user asks about general knowledge:
- Please keep answers under 200 words unless asked otherwise
- Kindly ask clarifying questions when the request is ambiguous

Remember to stay professional. Remember to be friendly. Remember to be accurate.`;

export default function App() {
  const [text, setText] = useState(SAMPLE);
  const [format, setFormat] = useState<Format>("markdown");
  const [mode, setMode] = useState<Mode>("lossless");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResponse | null>(null);

  const debouncedText = useDebouncedValue(text);
  const tokenCount = useTokenCount(text, debouncedText);
  const hints = analyzePrompt(debouncedText);

  const handleCompress = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await compressPrompt({ text, format, mode, includeLegendInCount: true });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <p className="header__kicker">Token-aware compressor</p>
          <h1 className="header__title">PromptPack</h1>
        </div>
        <nav className="header__nav">
          <a href="https://yasirali.io" target="_blank" rel="noopener noreferrer">
            yasirali.io
          </a>
          <a
            href="https://github.com/yasirali646/promptpack"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </header>

      <p className="tagline">
        Paste a verbose prompt, pick a format, get a shorter version with measured token savings.
      </p>

      <main className="layout">
        <div className="layout__left">
          <PromptEditor
            value={text}
            onChange={setText}
            tokenCount={tokenCount}
            hints={hints}
          />
          <FormatPicker value={format} onChange={setFormat} />
          <ModeToggle value={mode} onChange={setMode} />
          <CompressButton
            onClick={handleCompress}
            loading={loading}
            disabled={!text.trim()}
          />
        </div>
        <div className="layout__right">
          <ResultsPanel
            result={result}
            originalText={text}
            loading={loading}
            error={error}
          />
        </div>
      </main>

      <footer className="footer">
        <p>
          Counts use cl100k_base (GPT-4 / 4o family). Server rate limit: 10 compressions / hour / IP.
        </p>
      </footer>
    </div>
  );
}
