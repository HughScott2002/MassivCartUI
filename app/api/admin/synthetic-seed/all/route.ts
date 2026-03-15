import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const SYNC_SECRET = process.env.PLACES_SYNC_SECRET;

export async function POST() {
  const headers: Record<string, string> = {};
  if (SYNC_SECRET) headers["x-sync-secret"] = SYNC_SECRET;

  console.log("[admin/synthetic-seed/all] BACKEND_URL:", BACKEND_URL);
  console.log("[admin/synthetic-seed/all] SYNC_SECRET set:", !!SYNC_SECRET);

  const url = `${BACKEND_URL}/api/admin/synthetic-seed/all`;
  console.log("[admin/synthetic-seed/all] POST →", url);

  const res = await fetch(url, { method: "POST", headers });
  console.log("[admin/synthetic-seed/all] response status:", res.status);

  const data = await res.json();
  console.log("[admin/synthetic-seed/all] response body:", data);

  return NextResponse.json(data, { status: res.status });
}
