import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

const memoryStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

function memoryRateLimit(key: string): { success: boolean; reset: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, reset: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, reset: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, reset: entry.resetAt };
}

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
    });
  }

  return ratelimit;
}

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; reset: number }> {
  const limiter = getRatelimit();

  if (limiter) {
    const result = await limiter.limit(identifier);
    return { success: result.success, reset: result.reset };
  }

  return memoryRateLimit(identifier);
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown";
  if (Array.isArray(forwarded)) return forwarded[0] || "unknown";
  return (req.headers["x-real-ip"] as string) || "unknown";
}
