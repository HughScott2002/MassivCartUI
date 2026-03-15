import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const SYNC_SECRET = process.env.PLACES_SYNC_SECRET;

function secretHeaders(): Record<string, string> {
  return SYNC_SECRET ? { "x-sync-secret": SYNC_SECRET } : {};
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND_URL}/api/admin/synthetic-seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...secretHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE() {
  const res = await fetch(`${BACKEND_URL}/api/admin/synthetic-seed`, {
    method: "DELETE",
    headers: secretHeaders(),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
