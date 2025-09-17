import { NextResponse } from "next/server";
import { sendMail } from "@/serverless/mailer";
import { PopupLeadSchema } from "@/serverless/validators";
import { readJsonWithLimit, getClientIp, isOriginAllowed, rateLimit, securityHeaders, validateCsrf } from "@/serverless/security";
import { rateLimitHeaders } from "@/serverless/ratelimit";
import { getRequestId, logInfo, logError } from "@/serverless/observability";
import { buildPopupLeadMail } from "@/serverless/builders";
import { createGrant, buildDownloadCookie } from "@/serverless/downloads";

export const runtime = "nodejs";
export const preferredRegion = ["bom1"]; // Mumbai
export const dynamic = "force-dynamic";

function badRequest(errors, origin, reqId, rlInfo) {
  return NextResponse.json(
    { errors: errors.map((e) => ({ msg: e.msg, param: e.path?.[0] || e.param })) },
    {
      status: 400,
      headers: (() => {
        const h = securityHeaders(origin);
        if (reqId) h.set("X-Request-Id", reqId);
        if (rlInfo) {
          const obj = rateLimitHeaders(rlInfo);
          for (const k in obj) h.set(k, obj[k]);
        }
        return h;
      })(),
    }
  );
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin");
  const reqId = getRequestId(req.headers);
  if (!isOriginAllowed(req.headers)) return new NextResponse("Forbidden", { status: 403, headers: securityHeaders(null) });
  const h = securityHeaders(origin);
  h.set("X-Request-Id", reqId);
  return new NextResponse(null, { status: 204, headers: h });
}

export async function POST(req) {
  try {
    const origin = req.headers.get("origin");
    const reqId = getRequestId(req.headers);
    if (!isOriginAllowed(req.headers)) {
      const h = securityHeaders(null);
      h.set("X-Request-Id", reqId);
      return new NextResponse("Forbidden", { status: 403, headers: h });
    }

    // CSRF validation (double submit cookie)
    if (!validateCsrf(req.headers)) {
      const h = securityHeaders(origin);
      h.set("X-Request-Id", reqId);
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403, headers: h });
    }

    const parsed = await readJsonWithLimit(req);
    if (!parsed.ok) return parsed.error;
    const body = parsed.data || {};

    const res = PopupLeadSchema.safeParse(body);
    if (!res.success) {
      const errs = res.error.issues.map((i) => ({ msg: i.message, path: i.path }));
      return badRequest(errs, origin, reqId);
    }

    // Captcha removed

    const ip = getClientIp(req.headers);
    const rl = await rateLimit("popup-lead", ip);
    if (!rl.ok) {
      const h = securityHeaders(origin);
      const obj = rateLimitHeaders(rl);
      for (const k in obj) h.set(k, obj[k]);
      h.set("Retry-After", String(Math.max(0, rl.reset - Math.ceil(Date.now() / 1000))));
      h.set("X-Request-Id", reqId);
      logInfo("rate_limited", { route: "/popup-lead", ip, reqId });
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: h });
    }

    const mailOptions = buildPopupLeadMail(res.data);
    await sendMail(mailOptions);

    const h = securityHeaders(origin);
    // Grant short-lived download based on requested type
    try {
      const kind = (res?.data?.type === "brochure") ? "brochure" : "quotes";
      const grant = createGrant(kind, 180);
      const name = kind === "brochure" ? "svs_dl_brochure" : "svs_dl_quotes";
      h.append?.("Set-Cookie", buildDownloadCookie(name, grant, 180));
    } catch {}
    const obj = rateLimitHeaders(rl);
    for (const k in obj) h.set(k, obj[k]);
    h.set("X-Request-Id", reqId);
    logInfo("lead_sent", { route: "/popup-lead", ip, reqId });
    return NextResponse.json({ message: "Lead sent successfully" }, { headers: h });
  } catch (err) {
    console.error("/popup-lead error:", err?.message || err);
    const h = securityHeaders(null);
    h.set("X-Request-Id", getRequestId(req.headers));
    logError("lead_error", { route: "/popup-lead", error: err?.message || String(err) });
    return NextResponse.json({ error: "Failed to send lead" }, { status: 500, headers: h });
  }
}
