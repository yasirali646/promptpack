interface CopyButtonProps {
  text: string;
  label: string;
}

export default function CopyButton({ text, label }: CopyButtonProps) {
  const copy = async () => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <button type="button" className="copy-btn" onClick={copy}>
      {label}
    </button>
  );
}
