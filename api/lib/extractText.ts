import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import WordExtractor from "word-extractor";

const SUPPORTED = new Set(["txt", "pdf", "doc", "docx"]);

function extension(filename: string): string {
  return filename.toLowerCase().split(".").pop() ?? "";
}

export function isSupportedUpload(filename: string): boolean {
  return SUPPORTED.has(extension(filename));
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromFile(buffer: Buffer, filename: string): Promise<string> {
  const ext = extension(filename);

  switch (ext) {
    case "txt":
      return buffer.toString("utf8");
    case "pdf":
      return extractPdfText(buffer);
    case "docx": {
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    }
    case "doc": {
      const extractor = new WordExtractor();
      const doc = await extractor.extract(buffer);
      return doc.getBody();
    }
    default:
      throw new Error("Unsupported file type. Use .txt, .pdf, or .doc");
  }
}
