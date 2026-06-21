interface DiffViewProps {
  original: string;
  compressed: string;
}

export default function DiffView({ original, compressed }: DiffViewProps) {
  const origLines = new Set(original.split("\n").map((l) => l.trim()).filter(Boolean));
  const compLines = new Set(compressed.split("\n").map((l) => l.trim()).filter(Boolean));

  const removed = [...origLines].filter((l) => !compLines.has(l));
  const added = [...compLines].filter((l) => !origLines.has(l));

  if (removed.length === 0 && added.length === 0) {
    return <p className="diff-empty">Lines were restructured rather than removed.</p>;
  }

  return (
    <div className="diff">
      {removed.length > 0 && (
        <div className="diff__block">
          <h4 className="diff__heading">Removed / merged</h4>
          <pre className="diff__pre diff__pre--removed">{removed.join("\n")}</pre>
        </div>
      )}
      {added.length > 0 && (
        <div className="diff__block">
          <h4 className="diff__heading">Added / restructured</h4>
          <pre className="diff__pre diff__pre--added">{added.join("\n")}</pre>
        </div>
      )}
    </div>
  );
}
