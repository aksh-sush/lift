import { NextResponse } from "next/server";
import { getHealth } from "@/serverless/health";
import { securityHeaders } from "@/serverless/security";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getHealth(), { headers: securityHeaders(null) });
}
