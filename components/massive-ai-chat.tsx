"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Bot, Loader2, MessageSquare, MessageSquareMore, Send, Trash2, X } from "lucide-react"
import type { ChatMessage } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "massive_ai_chat_v1"

function formatLine(line: string) {
  const parts = line.split(/\*\*/)
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {p}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

function MessageBody({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <div className="text-sm leading-relaxed text-foreground">
      {lines.map((line, li) => (
        <p key={li} className={li > 0 ? "mt-1.5" : ""}>
          {formatLine(line)}
        </p>
      ))}
    </div>
  )
}

export function MassiveAiChat({
  open,
  onClose,
  savingsMode,
  userLocation,
  onListConfirmed,
}: {
  open: boolean
  onClose: () => void
  savingsMode: number
  userLocation: { lat: number; lng: number } | null
  onListConfirmed: (lines: string[]) => Promise<boolean>
}) {
  const { requireAuth, session } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[]
        if (Array.isArray(parsed)) setMessages(parsed)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      /* ignore */
    }
  }, [messages])

  useEffect(() => {
    if (!open) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [open, messages, loading])

  function clearChat() {
    setMessages([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  async function send() {
    const text = draft.trim()
    if (!text || loading) return
    requireAuth(() => {
      void sendInner(text)
    })
  }

  async function sendInner(text: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    }
    const nextThread = [...messages, userMsg]
    setMessages(nextThread)
    setDraft("")
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextThread.map(({ role, content }) => ({ role, content })),
          savingsMode,
          userLat: userLocation?.lat,
          userLng: userLocation?.lng,
        }),
      })
      const data = (await res.json()) as {
        reply?: string
        message?: string
        error?: string
        suggestedList?: string[] | null
        pendingList?: string[] | null
      }
      const reply =
        (typeof data.reply === "string" && data.reply) ||
        (typeof data.message === "string" && data.message) ||
        (data.error ? `Sorry — ${data.error}` : "")
      const rawList = data.suggestedList ?? data.pendingList
      const suggestedList =
        Array.isArray(rawList) && rawList.length > 0
          ? rawList.map((s) => String(s).trim()).filter(Boolean)
          : null

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply || "No response from Massive AI.",
          suggestedList,
        },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Network error. Try again in a moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function confirmList(lines: string[]) {
    if (!lines.length || confirming) return
    requireAuth(async () => {
      setConfirming(true)
      try {
        const ok = await onListConfirmed(lines)
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: ok
              ? "Results are open in the **Store** tab. Cheapest prices are listed first per product — tap **Add** on the row you want."
              : "No store matches for those lines. Try shorter product names (e.g. “rice”, “oil”) and run **Confirm & search prices** again.",
          },
        ])
      } finally {
        setConfirming(false)
      }
    })
  }

  if (!open) return null

  const content = (
    <>
      <div
        className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
        aria-hidden
      />
      <div
        className={cn(
          "fixed z-[10001] flex min-h-0 flex-col overflow-hidden border border-border bg-card shadow-2xl",
          // Centered on all sizes; 430×932 and similar: stay in the middle with space for the command bar
          "left-1/2 top-1/2 w-[min(calc(100vw-1rem),430px)] -translate-x-1/2 -translate-y-1/2",
          "h-[min(640px,calc(100vh-8rem))] max-h-[min(640px,calc(100vh-8rem))] rounded-2xl",
          "max-[430px]:h-[min(580px,calc(100vh-9rem))] max-[430px]:max-h-[min(580px,calc(100vh-9rem))]",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-foreground">Massive AI</h2>
              <p className="truncate text-xs text-muted-foreground">Lists, recipes &amp; prices</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={clearChat}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Clear chat"
              aria-label="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
          {messages.length === 0 && (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
              Ask for a shopping list for your diet, meal ideas, or Jamaican staples. When I suggest a list, confirm to
              search prices and pick stores in the Store panel.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[92%] rounded-2xl px-3 py-2.5",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-muted/50",
                )}
              >
                <MessageBody text={m.content} />
                {m.role === "assistant" && m.suggestedList && m.suggestedList.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <button
                      type="button"
                      disabled={confirming}
                      onClick={() => void confirmList(m.suggestedList!)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {confirming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquareMore className="h-4 w-4" />
                      )}
                      Confirm &amp; search prices
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border p-3">
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              placeholder={session ? "Message Massive AI…" : "Sign in to chat…"}
              rows={2}
              disabled={loading}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !draft.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return typeof document !== "undefined" ? createPortal(content, document.body) : null
}

export function MassiveAiChatFab({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border shadow-lg transition-colors",
        "border-border bg-card text-primary hover:border-primary/50 hover:bg-muted",
        className,
      )}
      aria-label="Open Massive AI chat"
      title="Massive AI"
    >
      <Bot className="h-7 w-7" />
    </button>
  )
}

/** Desktop / web: chat icon + short greeting (hidden on small screens that use the FAB pill only). */
export function MassiveAiChatDesktopTeaser({
  onClick,
  chatOpen,
}: {
  onClick: () => void
  chatOpen: boolean
}) {
  if (chatOpen) return null
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pointer-events-auto fixed bottom-28 left-4 z-30 hidden max-w-[min(calc(100vw-2rem),320px)] items-center gap-3 rounded-2xl border border-border",
        "bg-card px-4 py-3 text-left shadow-xl transition-colors hover:border-primary/40 hover:bg-muted/80",
        "sm:flex",
      )}
      aria-label="Open Massive AI chat"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
        <MessageSquare className="h-6 w-6" strokeWidth={2} />
      </span>
      <span className="min-w-0 text-sm font-medium leading-snug text-foreground">
        Hi there, I&apos;m <span className="font-semibold text-primary">Massive AI</span>
        <span className="text-muted-foreground"> — how may I help you?</span>
      </span>
    </button>
  )
}
