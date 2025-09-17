import { NextResponse } from "next/server";
import { ALLOWED_ORIGINS, MAX_BODY_BYTES } from "@/serverless/config";
import crypto from "crypto";
import { CSRF_COOKIE_NAME } from "@/serverless/csrf";
export { rateLimit } from "@/serverless/ratelimit";

export function getClientIp(headers) {
  const vercel = headers.get("x-vercel-ip");
  if (vercel) return vercel.trim();
  const cfip = headers.get("cf-connecting-ip");
  if (cfip) return cfip.trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xrip = headers.get("x-real-ip");
  if (xrip) return xrip.trim();
  return "0.0.0.0";
}

export function isOriginAllowed(headers) {
  const origin = headers.get("origin");
  if (!origin) return true; // non-browser or same-origin fetch may omit
  if (ALLOWED_ORIGINS.length === 0) {
    const host = headers.get("host");
    try {
      const url = new URL(origin);
      return !!host && url.host === host;
    } catch {
      return false;
    }
  }
  return ALLOWED_ORIGINS.includes(origin);
}

export function securityHeaders(allowedOrigin) {
  const headers = new Headers();
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Origin");
  // Strengthen isolation and transport
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  // Apply a conservative CSP suitable for API responses (no inline concerns)
  const apiCsp = [
    "default-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "script-src 'none'",
    "style-src 'none'",
    "img-src 'none'",
    "font-src 'none'",
    "connect-src 'self'",
  ].join('; ');
  headers.set("Content-Security-Policy", apiCsp);
  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  return headers;
}

export async function readJsonWithLimit(req, maxBytes = MAX_BODY_BYTES) {
  const raw = await req.text();
  const size = Buffer.byteLength(raw || "", "utf8");
  if (size > maxBytes) {
    return { ok: false, error: NextResponse.json({ error: "Payload too large" }, { status: 413, headers: securityHeaders(null) }) };
  }
  try {
    const json = raw ? JSON.parse(raw) : {};
    return { ok: true, data: json };
  } catch {
    return { ok: false, error: NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: securityHeaders(null) }) };
  }
}

// rateLimit is provided by '@/serverless/ratelimit'

function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (k) out[k] = v;
  });
  return out;
}

export function validateCsrf(headers) {
  try {
    const cookieHeader = headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);
    const cookieToken = cookies[CSRF_COOKIE_NAME] || "";
    const headerToken = headers.get("x-csrf-token") || "";
    if (!cookieToken || !headerToken) return false;
    // Constant-time compare
    const a = Buffer.from(String(cookieToken));
    const b = Buffer.from(String(headerToken));
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
