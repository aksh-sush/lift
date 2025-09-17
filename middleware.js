import { NextResponse } from "next/server";

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

const SECRET = process.env.DOWNLOAD_SECRET || process.env.NEXTAUTH_SECRET || "dev-download-secret";

function toBase64Url(buf) {
  let str = "";
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) str += String.fromCharCode(bytes[i]);
  const b64 = btoa(str);
  return b64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function hmacSha256Base64Url(input) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(input));
  return toBase64Url(mac);
}

function timingSafeEq(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifyGrantEdge(value, prefix) {
  try {
    if (!value || typeof value !== "string") return false;
    const [expStr, sig] = value.split(".");
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || !sig) return false;
    if (exp < Math.floor(Date.now() / 1000)) return false;
    const expected = await hmacSha256Base64Url(`${prefix}:${exp}`);
    return timingSafeEq(sig, expected);
  } catch {
    return false;
  }
}

export async function middleware(req) {
  try {
    const { pathname } = req.nextUrl;
    // Normalize to handle encoded spaces
    const decodedPath = decodeURI(pathname || "");

    const isBrochure = decodedPath.startsWith("/Broucher/");
    const isQuotes = decodedPath.startsWith("/Lift Quotes Pdf/") || pathname.startsWith("/Lift%20Quotes%20Pdf/");

    if (!isBrochure && !isQuotes) return NextResponse.next();

    const cookies = parseCookies(req.headers.get("cookie") || "");
    if (isBrochure) {
      const v = cookies["svs_dl_brochure"] || "";
      if (await verifyGrantEdge(v, "brochure")) return NextResponse.next();
    } else if (isQuotes) {
      const v = cookies["svs_dl_quotes"] || "";
      if (await verifyGrantEdge(v, "quotes")) return NextResponse.next();
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export const config = {
  matcher: ["/Broucher/:path*", "/Lift%20Quotes%20Pdf/:path*"],
};
