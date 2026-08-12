import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        service: "ecmr-cloud-storage",
        status: "WAITING_FOR_DATABASE",
        database: "postgresql",
        configured: false,
        reachable: false,
        schema: "db/schema.sql",
      },
      { status: 503 }
    );
  }

  try {
    const result = await getPool().query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('ecmr', 'ecmr_version', 'ecmr_event')
      ORDER BY table_name
    `);
    const tables = result.rows.map((row) => row.table_name);
    const schemaReady = tables.length === 3;

    return NextResponse.json(
      {
        service: "ecmr-cloud-storage",
        status: schemaReady ? "READY" : "SCHEMA_REQUIRED",
        database: "postgresql",
        configured: true,
        reachable: true,
        schemaReady,
        tables,
        schema: "db/schema.sql",
      },
      { status: schemaReady ? 200 : 503 }
    );
  } catch {
    return NextResponse.json(
      {
        service: "ecmr-cloud-storage",
        status: "DATABASE_UNREACHABLE",
        database: "postgresql",
        configured: true,
        reachable: false,
        schema: "db/schema.sql",
      },
      { status: 503 }
    );
  }
}
