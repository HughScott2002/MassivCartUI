import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json({ ok: false, error: "BACKEND_URL not set" }, { status: 500 });
  }

  const res = await fetch(`${backendUrl}/health`);
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
