import type { Request, Response } from "express";
import { compressRequestSchema } from "./lib/compressLogic";
import { buildCompressResponse } from "../shared/buildCompressResponse";

export default async function handler(req: Request, res: Response) {
  const parsed = compressRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    return res.status(200).json(buildCompressResponse(parsed.data));
  } catch (err) {
    console.error("compress error:", err);
    const message = err instanceof Error ? err.message : "Compression failed";
    return res.status(500).json({ error: message });
  }
}
