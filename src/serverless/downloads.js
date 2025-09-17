import crypto from "crypto";

const SECRET = process.env.DOWNLOAD_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-download-secret";

function hmac(input) {
  return crypto.createHmac("sha256", SECRET).update(input).digest("base64url");
}

export function createGrant(prefix, ttlSec = 120) {
  const exp = Math.floor(Date.now() / 1000) + Math.max(1, ttlSec);
  const payload = `${prefix}:${exp}`;
  const sig = hmac(payload);
  return `${exp}.${sig}`; // value to place in cookie
}

export function verifyGrant(value, prefix) {
  try {
    if (!value || typeof value !== "string") return false;
    const [expStr, sig] = value.split(".");
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || !sig) return false;
    if (exp < Math.floor(Date.now() / 1000)) return false;
    const expected = hmac(`${prefix}:${exp}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildDownloadCookie(name, value, ttlSec = 120) {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${Math.max(1, Math.floor(ttlSec))}`,
    "SameSite=Strict",
    "HttpOnly",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

