import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
  }

  const formData = await req.formData();
  const res = await fetch(`${backendUrl}/api/receipt`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
