import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    service: "ecmr-cloud",
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
