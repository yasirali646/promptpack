import { useEffect, useRef } from "react";

interface LegalModalProps {
  title: string;
  content: string;
  open: boolean;
  onClose: () => void;
}

export default function LegalModal({ title, content, open, onClose }: LegalModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={dialogRef} className="legal-modal" onClose={onClose}>
      <form method="dialog" className="legal-modal__panel">
        <header className="legal-modal__head">
          <h2 className="legal-modal__title">{title}</h2>
          <button type="submit" className="legal-modal__close" aria-label="Close">
            ×
          </button>
        </header>
        <div className="legal-modal__body">
          {content.split("\n").map((line, i) =>
            line.trim() === "" ? (
              <br key={i} />
            ) : (
              <p key={i}>{line}</p>
            )
          )}
        </div>
        <footer className="legal-modal__foot">
          <button type="submit" className="upload-btn">
            Close
          </button>
        </footer>
      </form>
    </dialog>
  );
}
