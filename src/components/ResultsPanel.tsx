import { useState } from "react";
import type { CompressResponse } from "@shared/types";
import CopyButton from "./CopyButton";
import DiffView from "./DiffView";

type Tab = "compressed" | "legend" | "diff" | "notes";

const TAB_LABELS: Record<Tab, string> = {
  compressed: "Manuscript",
  legend: "Legend",
  diff: "Redlines",
  notes: "Editor's notes",
};

interface ResultsPanelProps {
  result: CompressResponse | null;
  originalText: string;
  loading: boolean;
  error: string | null;
}

export default function ResultsPanel({
  result,
  originalText,
  loading,
  error,
}: ResultsPanelProps) {
  const [tab, setTab] = useState<Tab>("compressed");

  return (
    <article className="manuscript manuscript--yield">
      <header className="manuscript__head">
        <div>
          <p className="manuscript__folio">§ Yield</p>
          <h2 className="manuscript__title">Compressed prompt</h2>
        </div>
        {result && !loading && (
          <div className="metrics">
            <div className={`metric${result.savedPercent >= 15 ? " metric--saved" : ""}`}>
              <span className="metric__val">
                {result.savedPercent > 0 ? `−${result.savedPercent}%` : "—"}
              </span>
              <span className="metric__lbl">body saved</span>
            </div>
            <div className="metric metric--muted">
              <span className="metric__val">
                {result.originalTokens}→{result.bodyTokens}
              </span>
              <span className="metric__lbl">body tokens</span>
            </div>
            {result.legendTokens > 0 && (
              <div className="metric metric--muted">
                <span className="metric__val">+{result.legendTokens}</span>
                <span className="metric__lbl">legend</span>
              </div>
            )}
          </div>
        )}
      </header>

      {loading && (
        <div className="yield-state yield-state--loading">
          <span className="yield-state__pulse" aria-hidden="true" />
          <p>Setting type and tightening copy…</p>
        </div>
      )}

      {error && !loading && (
        <div className="yield-state yield-state--error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !result && (
        <div className="yield-state">
          <p className="yield-state__empty">
            Your compressed manuscript appears here after you run the press.
          </p>
        </div>
      )}

      {result && !loading && !error && (
        <>
          {result.warning && (
            <p className="yield-warning" role="status">
              {result.warning}
            </p>
          )}

          <nav className="folio-tabs" aria-label="Output views">
            {(["compressed", "legend", "diff", "notes"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`folio-tabs__btn${tab === t ? " is-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>

          <div className="tab-body">
            {tab === "compressed" && (
              <>
                <pre className="output">{result.compressed}</pre>
                <div className="copy-row">
                  <CopyButton text={result.compressed} label="Copy text" />
                  <CopyButton
                    text={
                      result.legendBlock
                        ? `${result.legendBlock}\n${result.compressed}`
                        : result.compressed
                    }
                    label="Copy with legend"
                  />
                </div>
              </>
            )}
            {tab === "legend" && (
              <>
                <pre className="output">{result.legendBlock || "No legend was generated."}</pre>
                {Object.keys(result.legend).length > 0 && (
                  <dl className="legend-list">
                    {Object.entries(result.legend).map(([k, v]) => (
                      <div key={k} className="legend-list__row">
                        <dt><code>{k}</code></dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </>
            )}
            {tab === "diff" && (
              <DiffView original={originalText} compressed={result.compressed} />
            )}
            {tab === "notes" && (
              <ul className="notes-list">
                {result.notes.length === 0 ? (
                  <li>No editor notes returned.</li>
                ) : (
                  result.notes.map((note) => <li key={note}>{note}</li>)
                )}
              </ul>
            )}
          </div>
        </>
      )}
    </article>
  );
}
