import { NextRequest, NextResponse } from "next/server"
import { getServerApiUrl } from "@/lib/api-config"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }
  const res = await fetch(`${getServerApiUrl()}/api/dashboard?userId=${userId}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
