// // backend/src/lib/redis.ts
// import Redis from "ioredis";

// const redis = new Redis(process.env.REDIS_URL!);

// redis.on("error", (err) => console.error("Redis error:", err));
 
// export default redis;

// export async function cacheGet<T>(key: string): Promise<T | null> {
//   const data = await redis.get(key);
//   return data ? JSON.parse(data) : null;
// }

// export async function cacheSet(key: string, value: any, ttlSeconds: number) {
//   await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
// }

// export async function cacheDel(key: string | string[]) {
//   await redis.del(...(Array.isArray(key) ? key : [key]));
// }   


import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

type Entry = { value: string; expiresAt: number };
const mem = new Map<string, Entry>();
let redisDownUntil = 0;

if (!redisUrl) {
  console.warn("REDIS_URL is not configured. Redis caching is disabled.");
}

const redis = redisUrl
  ? new Redis(redisUrl, {
      connectTimeout: 10_000,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      retryStrategy(times) {
        return Math.min(times * 500, 5_000);
      },
    })
  : null;

  console.log("Redis URL:", redisUrl?.replace(/:\/\/.*@/, "://***@"));


  redis?.on("connect", () => console.log("Redis: TCP connected"));
redis?.on("close", () => console.log("Redis: connection closed"));
redis?.on("reconnecting", (ms: number) => console.log(`Redis: reconnecting in ${ms}ms`));

redis?.on("error", (err) => {
  console.error("Redis error:", (err as NodeJS.ErrnoException).code ?? "", err.message);
});

redis?.on("ready", () => {
  console.log("Redis connection ready");
});

export default redis;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const now = Date.now();
  const local = mem.get(key);
  if (local && local.expiresAt > now) return JSON.parse(local.value) as T;
  if (local) mem.delete(key);

  if (!redis || now < redisDownUntil) return null;
  try {
    const data = await redis.get(key);
    return data === null ? null : (JSON.parse(data) as T);
  } catch {
    redisDownUntil = now + 30_000;
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const json = JSON.stringify(value);
  mem.set(key, { value: json, expiresAt: Date.now() + ttlSeconds * 1000 });
  if (!redis || Date.now() < redisDownUntil) return;
  try {
    await redis.set(key, json, "EX", ttlSeconds);
  } catch {
    redisDownUntil = Date.now() + 30_000;
  }
}

export async function cacheDel(key: string | string[]): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(...(Array.isArray(key) ? key : [key]));
  } catch (error) {
    console.error(`Redis cache delete failed:`, error);
  }
}
