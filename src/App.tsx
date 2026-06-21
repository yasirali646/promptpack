import { useState } from "react";
import CompressButton from "./components/CompressButton";
import FormatPicker from "./components/FormatPicker";
import ModeToggle from "./components/ModeToggle";
import PromptEditor from "./components/PromptEditor";
import ResultsPanel from "./components/ResultsPanel";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useTokenCount } from "./hooks/useTokenCount";
import { compressPrompt } from "./lib/api";
import { analyzePrompt } from "./lib/index";
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
    <div className="shell">
      <div className="grain" aria-hidden="true" />

      <aside className="rail" aria-hidden="true">
        <span className="rail__text">vol. 01 · token reduction bureau</span>
      </aside>

      <div className="app">
        <header className="masthead">
          <div className="masthead__main">
            <p className="masthead__issue">Est. 2026 · Open utility</p>
            <h1 className="masthead__title">
              Prompt<span className="masthead__title-accent">Pack</span>
            </h1>
            <p className="masthead__lede">
              Same instructions, fewer tokens. Paste prose, receive a tightened manuscript
              in Markdown, JSON, YAML, or shorthand — with a legend the model can read.
            </p>
          </div>
          <div className="masthead__aside">
            <div className="stamp stamp--live">
              <span className="stamp__label">Status</span>
              <span className="stamp__value">Ready</span>
            </div>
            <nav className="masthead__nav">
              <a href="https://yasirali.io" target="_blank" rel="noopener noreferrer">
                Yasir Ali
              </a>
              <span className="masthead__sep" aria-hidden="true">/</span>
              <a
                href="https://github.com/yasirali646/promptpack"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source
              </a>
            </nav>
          </div>
        </header>

        <main className="workspace">
          <section className="workspace__source" aria-label="Source prompt">
            <PromptEditor
              value={text}
              onChange={setText}
              tokenCount={tokenCount}
              hints={hints}
            />
            <div className="controls">
              <FormatPicker value={format} onChange={setFormat} />
              <ModeToggle value={mode} onChange={setMode} />
              <CompressButton
                onClick={handleCompress}
                loading={loading}
                disabled={!text.trim()}
              />
            </div>
          </section>

          <section className="workspace__yield" aria-label="Compressed output">
            <ResultsPanel
              result={result}
              originalText={text}
              loading={loading}
              error={error}
            />
          </section>
        </main>

        <footer className="colophon">
          <p>
            Token counts use <code>cl100k_base</code> (GPT-4 / 4o family).
            Rate limit: 10 compressions per hour per visitor.
          </p>
        </footer>
      </div>
    </div>
  );
}
