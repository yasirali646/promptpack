import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const f of [".env", ".env.local"]) {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) process.loadEnvFile(p);
}

import express from "express";
import compressHandler from "./api/compress";
import extractHandler, { uploadMiddleware } from "./api/extract";
import healthHandler from "./api/health";
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use("/api", (_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", healthHandler);
app.post("/api/extract", uploadMiddleware, extractHandler);
app.post("/api/compress", compressHandler);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
