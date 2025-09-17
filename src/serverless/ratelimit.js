import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from "@/serverless/config";

let UpstashPkgLoaded = false;
let Upstash = { Ratelimit: null, Redis: null };

async function loadUpstash() {
  if (UpstashPkgLoaded) return Upstash;
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    Upstash = { Ratelimit, Redis };
    UpstashPkgLoaded = true;
  } catch {
    UpstashPkgLoaded = true;
  }
  return Upstash;
}

// Singleton holder across hot reloads / warm invocations
const RL_SYMBOL = Symbol.for("__SVS_RATE_LIMITER__");

function getGlobalLimiter() {
  return globalThis[RL_SYMBOL];
}

function setGlobalLimiter(val) {
  globalThis[RL_SYMBOL] = val;
  return val;
}

async function getLimiter() {
  const existing = getGlobalLimiter();
  if (existing) return existing;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    // Lazy import to avoid bundling cost when unused
    const { Ratelimit, Redis } = await loadUpstash();
    if (Ratelimit && Redis) {
      const redis = new Redis({ url, token });
      const seconds = Math.max(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000), 1);
      const limiter = new Ratelimit({
        redis,
        // Sliding window to smooth bursts across instances
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, `${seconds} s`),
        analytics: false,
        prefix: "svs:rl",
      });
      return setGlobalLimiter({ type: "upstash", limiter });
    }
  }

  return setGlobalLimiter({ type: "memory", store: new Map() });
}

export async function rateLimit(routeKey, ip, now = Date.now()) {
  const inst = await getLimiter();
  const key = `${routeKey}:${ip || "0.0.0.0"}`;

  if (inst.type === "upstash") {
    try {
      const res = await inst.limiter.limit(key);
      return {
        ok: !!res?.success,
        limit: typeof res?.limit === 'number' ? res.limit : RATE_LIMIT_MAX,
        remaining: typeof res?.remaining === 'number' ? res.remaining : 0,
        reset: typeof res?.reset === 'number' ? res.reset : Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000),
      };
    } catch {
      // Soft-fail below
    }
  }

  // In-memory fallback (per-instance)
  const list = inst.store.get(key) || [];
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const kept = list.filter((t) => t > cutoff);
  if (kept.length >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      limit: RATE_LIMIT_MAX,
      remaining: 0,
      reset: Math.ceil((cutoff + RATE_LIMIT_WINDOW_MS) / 1000),
    };
  }
  kept.push(now);
  inst.store.set(key, kept);
  return {
    ok: true,
    limit: RATE_LIMIT_MAX,
    remaining: Math.max(RATE_LIMIT_MAX - kept.length, 0),
    reset: Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000),
  };
}

export function rateLimitHeaders(info) {
  if (!info) return {};
  const headers = {
    "X-RateLimit-Limit": String(info.limit ?? RATE_LIMIT_MAX),
    "X-RateLimit-Remaining": String(Math.max(0, info.remaining ?? 0)),
    "X-RateLimit-Reset": String(info.reset ?? 0),
  };
  return headers;
}
