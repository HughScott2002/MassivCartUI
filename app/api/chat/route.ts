import { NextRequest, NextResponse } from "next/server"
import { getServerApiUrl } from "@/lib/api-config"

type ChatBody = {
  messages?: { role: string; content: string }[]
  savingsMode?: number
  userLat?: number
  userLng?: number
}

/**
 * Fallback when Express POST /api/chat is unavailable (dev) or errors.
 * Not a real LLM — lists are canned so the UI can still be tested.
 * For real diet-specific / varied lists, implement /api/chat on MassivCartAPI.
 */
function demoChat(body: ChatBody) {
  const last =
    [...(body.messages ?? [])].reverse().find((m) => m.role === "user")?.content ?? ""
  const lower = last.toLowerCase()

  let reply =
    "I'm **Massive AI** in **demo mode** (your backend `POST /api/chat` isn’t returning a successful response from this Next server, so you’re seeing canned replies). Deploy or run MassivCartAPI with a real chat route for dynamic lists. Until then, try keywords like “breakfast”, “keto”, or “vegan” for different sample lists."

  let suggestedList: string[] | null = null

  if (/recipe|cook|meal|curry|jerk|stew|how to make|dinner|lunch/i.test(last)) {
    reply =
      "Here's a simple idea: **Curry chicken with rice and peas**\n\n" +
      "1. Season chicken with curry powder, thyme, garlic, onion, and scotch bonnet (optional).\n" +
      "2. Brown in oil, add water or coconut milk, simmer until tender.\n" +
      "3. Serve with rice cooked with kidney beans and coconut milk.\n\n" +
      "Want a shopping list for this? Say “shopping list for curry chicken”."
  }

  const wantsList =
    /list|shopping|grocery|buy|diet|vegetarian|vegan|keto|healthy|pantry|week/i.test(lower) &&
    !/recipe only|just the recipe/i.test(lower)

  if (wantsList) {
    if (/vegetarian|vegan|plant/i.test(lower)) {
      suggestedList = ["brown rice", "black beans", "plantain", "spinach", "sweet potato", "olive oil", "seasoning"]
      reply =
        "Plant-forward sample list (demo):\n\n" +
        suggestedList.map((s) => `• ${s}`).join("\n") +
        "\n\n**Confirm & search prices** when ready."
    } else if (/keto|low carb/i.test(lower)) {
      suggestedList = ["eggs", "chicken thighs", "butter", "cheese", "broccoli", "avocado", "olive oil"]
      reply =
        "Lower-carb sample list (demo):\n\n" +
        suggestedList.map((s) => `• ${s}`).join("\n") +
        "\n\n**Confirm & search prices** when ready."
    } else if (/breakfast|morning/i.test(lower)) {
      suggestedList = ["bread", "eggs", "milk", "banana", "oats", "sugar", "butter"]
      reply =
        "Breakfast sample list (demo):\n\n" +
        suggestedList.map((s) => `• ${s}`).join("\n") +
        "\n\n**Confirm & search prices** when ready."
    } else if (/baby|toddler|infant/i.test(lower)) {
      suggestedList = ["baby cereal", "formula", "diapers", "baby wipes", "bananas", "purée jars"]
      reply =
        "Baby-care sample list (demo):\n\n" +
        suggestedList.map((s) => `• ${s}`).join("\n") +
        "\n\n**Confirm & search prices** when ready."
    } else {
      suggestedList = ["rice", "kidney beans", "coconut milk", "curry powder", "chicken", "onion", "thyme", "garlic"]
      reply =
        "Default sample list (demo) — say **vegan**, **keto**, or **breakfast** for a different canned set:\n\n" +
        suggestedList.map((s) => `• ${s}`).join("\n") +
        "\n\nTap **Confirm & search prices** to run `/api/command` per line like the shopping-list upload."
    }
  }

  return { reply, suggestedList }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatBody

  try {
    const res = await fetch(`${getServerApiUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(demoChat(body))
      }
      return NextResponse.json(
        { error: (data.error as string) ?? "Chat request failed", reply: null },
        { status: res.status },
      )
    }
    return NextResponse.json(data)
  } catch {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(demoChat(body))
    }
    return NextResponse.json({ error: "Chat service unavailable" }, { status: 503 })
  }
}
