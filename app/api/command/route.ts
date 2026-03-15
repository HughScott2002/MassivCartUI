import { NextRequest, NextResponse } from "next/server"
import { getServerApiUrl } from "@/lib/api-config"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetch(`${getServerApiUrl()}/api/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
