import { useRef, useState } from "react";
import { readPromptFile, UPLOAD_ACCEPT, SUPPORTED_EXTENSIONS_LABEL } from "../lib/uploadFile";

interface FileUploadProps {
  onLoad: (text: string) => void;
  onClear: () => void;
  canClear: boolean;
  maxLength?: number;
}

export default function FileUpload({ onLoad, onClear, canClear, maxLength = 8000 }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadClick = () => {
    setUploadError(null);
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadNote(null);

    try {
      const { text, truncated, filename } = await readPromptFile(file, maxLength);
      onLoad(text);
      setUploadNote(
        truncated
          ? `Loaded ${filename} and trimmed to ${maxLength.toLocaleString()} characters.`
          : `Loaded ${filename}.`
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setUploadNote(null);
    setUploadError(null);
    onClear();
  };

  return (
    <div className="file-upload">
      <div className="file-upload__actions">
        <button
          type="button"
          className="upload-btn"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? "Reading…" : "Upload file"}
        </button>
        <button
          type="button"
          className="upload-btn upload-btn--clear"
          onClick={handleClear}
          disabled={!canClear || uploading}
        >
          Clear
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        className="upload-input"
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />
      <p className="file-upload__hint">Supported extensions: {SUPPORTED_EXTENSIONS_LABEL}</p>
      {uploadNote && (
        <p className="upload-note" role="status">
          {uploadNote}
        </p>
      )}
      {uploadError && (
        <p className="upload-error" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
