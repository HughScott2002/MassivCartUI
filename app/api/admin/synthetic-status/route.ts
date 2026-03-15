import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const SYNC_SECRET = process.env.PLACES_SYNC_SECRET;

export async function GET() {
  const headers: Record<string, string> = {};
  if (SYNC_SECRET) headers["x-sync-secret"] = SYNC_SECRET;

  const res = await fetch(`${BACKEND_URL}/api/admin/synthetic-status`, { headers });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
