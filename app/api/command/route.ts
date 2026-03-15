import { NextRequest, NextResponse } from "next/server"
import { getServerApiUrl } from "@/lib/api-config"
import { DEMO_RESULTS } from "@/lib/demo-results"
import type { SearchResult } from "@/lib/types"

function sortResultsByQuery(results: SearchResult[], query: string): SearchResult[] {
  const q = (query ?? "").trim().toLowerCase()
  if (!q) return results
  return [...results].sort((a, b) => {
    const aName = (a.canonical_name ?? "").toLowerCase()
    const aCat = (a.category ?? "").toLowerCase()
    const bName = (b.canonical_name ?? "").toLowerCase()
    const bCat = (b.category ?? "").toLowerCase()
    const aMatch = aName.includes(q) || aCat.includes(q)
    const bMatch = bName.includes(q) || bCat.includes(q)
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return 0
  })
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { message?: string; [key: string]: unknown }
  try {
    const res = await fetch(`${getServerApiUrl()}/api/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({ error: "Invalid response from search" }))
    return NextResponse.json(data, { status: res.status })
  } catch {
    // In development when the backend is not running, return seeded demo data so search works and users can add to list
    if (process.env.NODE_ENV === "development") {
      const results = sortResultsByQuery(DEMO_RESULTS, body.message ?? "")
      return NextResponse.json({ results })
    }
    return NextResponse.json(
      { error: "Search service unavailable" },
      { status: 503 }
    )
  }
}
