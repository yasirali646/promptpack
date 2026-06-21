interface CompressButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export default function CompressButton({ onClick, loading, disabled }: CompressButtonProps) {
  return (
    <button
      type="button"
      className="press-btn"
      onClick={onClick}
      disabled={disabled || loading}
    >
      <span className="press-btn__label">
        {loading ? "Composing…" : "Run compression"}
      </span>
      {!loading && <span className="press-btn__mark" aria-hidden="true">→</span>}
    </button>
  );
}
