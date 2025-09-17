// Centralized config for serverless handlers

export const MAX_BODY_BYTES = Number(process.env.API_MAX_BODY || 20_000); // ~20 KB
export const RATE_LIMIT_WINDOW_MS = Number(process.env.API_RATE_WINDOW_MS || 60_000); // 1 minute
export const RATE_LIMIT_MAX = Number(process.env.API_RATE_LIMIT_MAX || 10); // 10 requests / window / IP / route

// Comma-separated list of allowed origins; if absent, default to same-origin only
export const ALLOWED_ORIGINS = (process.env.API_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

