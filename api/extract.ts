import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { extractTextFromFile, isSupportedUpload } from "./lib/extractText";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isSupportedUpload(file.originalname)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only .txt, .pdf, and .doc files are supported"));
  },
});

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File is too large (max 5 MB)" });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

export default async function handler(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const text = await extractTextFromFile(file.buffer, file.originalname);
    const normalized = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

    if (!normalized) {
      return res.status(400).json({ error: "No readable text found in file" });
    }

    return res.status(200).json({ text: normalized, filename: file.originalname });
  } catch (err) {
    console.error("extract error:", err);
    const message = err instanceof Error ? err.message : "Could not read file";
    return res.status(500).json({ error: message });
  }
}
