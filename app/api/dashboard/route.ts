import { NextRequest, NextResponse } from "next/server"
import { getServerApiUrl } from "@/lib/api-config"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }
  try {
    const res = await fetch(`${getServerApiUrl()}/api/dashboard?userId=${userId}`)
    const data = await res.json().catch(() => ({ error: "Invalid response from dashboard" }))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed"
    return NextResponse.json(
      { error: "Dashboard backend unavailable", details: message },
      { status: 503 }
    )
  }
}
