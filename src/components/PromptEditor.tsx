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
    <article className="manuscript manuscript--source">
      <header className="manuscript__head">
        <div>
          <p className="manuscript__folio">§ Source manuscript</p>
          <h2 className="manuscript__title">Original prompt</h2>
        </div>
        <div className="metrics">
          <div className="metric">
            <span className="metric__val">{tokenCount.toLocaleString()}</span>
            <span className="metric__lbl">tokens</span>
          </div>
          <div className="metric metric--muted">
            <span className="metric__val">{value.length.toLocaleString()}</span>
            <span className="metric__lbl">chars</span>
          </div>
        </div>
      </header>
      <div className="manuscript__body">
        <textarea
          className="editor"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="Paste system prompt, instructions, or RAG context…"
          spellCheck={false}
          aria-describedby={hints.length ? "editor-hints" : undefined}
        />
        <div className="editor__rule" aria-hidden="true">
          <span>{maxLength.toLocaleString()} char limit</span>
        </div>
      </div>
      {hints.length > 0 && (
        <ul className="hints" id="editor-hints">
          {hints.map((hint) => (
            <li key={`${hint.type}-${hint.message}`}>
              <span className={`hint-mark hint-mark--${hint.type}`} aria-hidden="true" />
              <span className="hint-type">{hint.type}</span>
              {hint.message}
              {hint.count != null ? ` · ${hint.count} found` : ""}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
