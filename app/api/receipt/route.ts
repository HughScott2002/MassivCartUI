import { NextRequest, NextResponse } from "next/server"
import { getServerApiUrl } from "@/lib/api-config"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const res = await fetch(`${getServerApiUrl()}/api/receipt`, {
    method: "POST",
    body: formData,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
