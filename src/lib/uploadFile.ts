const ALLOWED_EXTENSIONS = [".txt", ".pdf", ".doc", ".docx"] as const;
const ACCEPT = ALLOWED_EXTENSIONS.join(",");
const EXTENSIONS_LABEL = ALLOWED_EXTENSIONS.join(", ");

export function isAllowedUpload(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function readPromptFile(
  file: File,
  maxLength: number
): Promise<{ text: string; truncated: boolean; filename: string }> {
  if (!isAllowedUpload(file.name)) {
    throw new Error("Unsupported file type. Use .txt, .pdf, or .doc");
  }

  const ext = file.name.toLowerCase().split(".").pop();
  let text: string;

  if (ext === "txt") {
    text = await file.text();
  } else {
    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/extract", { method: "POST", body });
    const data = (await res.json()) as { text?: string; error?: string };

    if (!res.ok) {
      throw new Error(data.error ?? "Could not read file");
    }

    text = data.text ?? "";
  }

  const normalized = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) {
    throw new Error("No readable text found in file");
  }

  const truncated = normalized.length > maxLength;
  return {
    text: normalized.slice(0, maxLength),
    truncated,
    filename: file.name,
  };
}

export { ACCEPT as UPLOAD_ACCEPT, EXTENSIONS_LABEL as SUPPORTED_EXTENSIONS_LABEL };
