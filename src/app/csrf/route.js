import { NextResponse } from "next/server";
import { buildCsrfCookie, generateCsrfToken, CSRF_COOKIE_NAME } from "@/serverless/csrf";
import { getRequestId, logInfo } from "@/serverless/observability";
import { isOriginAllowed, securityHeaders } from "@/serverless/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(req) {
  const origin = req.headers.get("origin");
  const reqId = getRequestId(req.headers);
  if (!isOriginAllowed(req.headers)) return new NextResponse("Forbidden", { status: 403, headers: securityHeaders(null) });
  const h = securityHeaders(origin);
  h.set("X-Request-Id", reqId);
  return new NextResponse(null, { status: 204, headers: h });
}

export async function GET(req) {
  try {
    const origin = req.headers.get("origin");
    const reqId = getRequestId(req.headers);
    if (!isOriginAllowed(req.headers)) {
      const h = securityHeaders(null);
      h.set("X-Request-Id", reqId);
      return new NextResponse("Forbidden", { status: 403, headers: h });
    }

    // Reuse existing token if present; otherwise mint a new one
    const existing = (() => {
      try {
        const ck = req.headers.get("cookie") || "";
        const map = Object.fromEntries(ck.split(";").map((p) => {
          const i = p.indexOf("=");
          if (i === -1) return ["", ""]; return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
        }));
        return map[CSRF_COOKIE_NAME] || "";
      } catch { return ""; }
    })();

    const token = existing || generateCsrfToken();
    const h = securityHeaders(origin);
    h.set("Set-Cookie", buildCsrfCookie(token));
    h.set("X-Request-Id", reqId);
    logInfo("csrf_token_issued", { route: "/csrf", reqId, reused: !!existing });
    return NextResponse.json({ token }, { headers: h });
  } catch (err) {
    const h = securityHeaders(null);
    return NextResponse.json({ error: "Failed to issue CSRF token" }, { status: 500, headers: h });
  }
}

