import { buildCompressResponse } from "@shared/buildCompressResponse";
import type { CompressRequest, CompressResponse } from "@shared/types";

export function compressPrompt(body: CompressRequest): CompressResponse {
  return buildCompressResponse(body);
}
