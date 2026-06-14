const store = new Map<string, { count: number; resetAt: number }>();

let kvClient: import("@vercel/kv").VercelKV | null = null;

async function getKv(): Promise<import("@vercel/kv").VercelKV | null> {
  if (kvClient !== null) return kvClient;
  if (process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const mod = await import("@vercel/kv");
      kvClient = mod.createClient({
        url: process.env.KV_REST_API_URL || "",
        token: process.env.KV_REST_API_TOKEN || "",
      });
      return kvClient;
    } catch {
      kvClient = null;
      return null;
    }
  }
  return null;
}

export async function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const client = await getKv();

  if (client) {
    try {
      const now = Date.now();
      const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
      const count = await client.incr(windowKey);
      if (count === 1) {
        await client.expire(windowKey, Math.ceil(windowMs / 1000));
      }
      return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count) };
    } catch {
      return { allowed: true, remaining: maxRequests };
    }
  }

  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}
