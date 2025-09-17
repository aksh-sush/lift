import crypto from "crypto";

export const CSRF_COOKIE_NAME = "svs_csrf";

export function generateCsrfToken(size = 32) {
  return crypto.randomBytes(size).toString("base64url");
}

export function buildCsrfCookie(token, maxAgeSeconds = 60 * 60 * 2) {
  const parts = [
    `${CSRF_COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${Math.max(1, Math.floor(maxAgeSeconds))}`,
    // Strict grants strongest CSRF protection; JS cannot send this cookie cross-site.
    "SameSite=Strict",
  ];
  // Use HttpOnly so JS can't read it; token is returned in the response body when requested.
  parts.push("HttpOnly");
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

