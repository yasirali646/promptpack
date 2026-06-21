import type { HeuristicHint } from "@shared/types";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  tokenCount: number;
  hints: HeuristicHint[];
  maxLength?: number;
}

export default function PromptEditor({
  value,
  onChange,
  tokenCount,
  hints,
  maxLength = 8000,
}: PromptEditorProps) {
  return (
    <section className="panel panel--input">
      <div className="panel__head">
        <h2 className="panel__title">Input prompt</h2>
        <div className="panel__meta">
          <span>{tokenCount.toLocaleString()} tokens</span>
          <span>{value.length.toLocaleString()} / {maxLength.toLocaleString()} chars</span>
        </div>
      </div>
      <textarea
        className="editor"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder="Paste your system prompt, instructions, or RAG context…"
        spellCheck={false}
      />
      {hints.length > 0 && (
        <ul className="hints">
          {hints.map((hint) => (
            <li key={`${hint.type}-${hint.message}`}>
              <span className={`hint-tag hint-tag--${hint.type}`}>{hint.type}</span>
              {hint.message}
              {hint.count != null ? ` (${hint.count})` : ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
