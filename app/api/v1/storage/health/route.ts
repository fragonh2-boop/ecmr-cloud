import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const configured = Boolean(process.env.DATABASE_URL);

  return NextResponse.json(
    {
      service: "ecmr-cloud-storage",
      status: configured ? "CONFIGURED" : "WAITING_FOR_DATABASE",
      database: "postgresql",
      configured,
      schema: "db/schema.sql",
    },
    { status: configured ? 200 : 503 }
  );
}
