import type { CompressRequest, CompressResponse } from "@shared/types";

export async function compressPrompt(body: CompressRequest): Promise<CompressResponse> {
  const res = await fetch("/api/compress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : data.error?.text?.[0] || "Compression failed";
    throw new Error(message);
  }

  return data as CompressResponse;
}
