interface CompressButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export default function CompressButton({ onClick, loading, disabled }: CompressButtonProps) {
  return (
    <button
      type="button"
      className="compress-btn"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Compressing…" : "Compress prompt"}
    </button>
  );
}
