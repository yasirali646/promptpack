import { useState } from "react";
import type { CompressResponse } from "@shared/types";
import CopyButton from "./CopyButton";
import DiffView from "./DiffView";

type Tab = "compressed" | "legend" | "diff" | "notes";

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

  if (loading) {
    return (
      <section className="panel panel--output">
        <div className="panel__head">
          <h2 className="panel__title">Output</h2>
        </div>
        <p className="status status--loading">Running compression pipeline…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel panel--output">
        <div className="panel__head">
          <h2 className="panel__title">Output</h2>
        </div>
        <p className="status status--error">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="panel panel--output">
        <div className="panel__head">
          <h2 className="panel__title">Output</h2>
        </div>
        <p className="status">Compressed prompt will appear here.</p>
      </section>
    );
  }

  const savedClass =
    result.savedPercent >= 15 ? "savings savings--good" : "savings savings--neutral";
  const fullBlock = result.legendBlock
    ? `${result.legendBlock}\n${result.compressed}`
    : result.compressed;

  return (
    <section className="panel panel--output">
      <div className="panel__head">
        <h2 className="panel__title">Output</h2>
        <div className={savedClass}>
          {result.originalTokens} → {result.compressedTokens} tokens
          {result.savedPercent > 0 ? ` (−${result.savedPercent}%)` : ""}
        </div>
      </div>

      {result.warning && <p className="status status--warn">{result.warning}</p>}

      <div className="tabs">
        {(["compressed", "legend", "diff", "notes"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`tabs__btn${tab === t ? " is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="tab-body">
        {tab === "compressed" && (
          <>
            <pre className="output">{result.compressed}</pre>
            <div className="copy-row">
              <CopyButton text={result.compressed} label="Copy compressed" />
              <CopyButton text={fullBlock} label="Copy legend + compressed" />
            </div>
          </>
        )}
        {tab === "legend" && (
          <>
            <pre className="output">{result.legendBlock || "No legend generated."}</pre>
            {Object.keys(result.legend).length > 0 && (
              <ul className="legend-list">
                {Object.entries(result.legend).map(([k, v]) => (
                  <li key={k}>
                    <code>{k}</code> → {v}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {tab === "diff" && <DiffView original={originalText} compressed={result.compressed} />}
        {tab === "notes" && (
          <ul className="notes-list">
            {result.notes.length === 0 ? (
              <li>No change notes returned.</li>
            ) : (
              result.notes.map((note) => <li key={note}>{note}</li>)
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
