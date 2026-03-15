"use client"

import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Sparkles, ScanLine, Send, MapPin, ListPlus, X, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { SearchResult, SearchResultPrice, ReceiptData, ReceiptItem } from "@/lib/types"
import { DEMO_RESULTS } from "@/lib/demo-results"

const KINGSTON_LAT = 17.9971
const KINGSTON_LNG = -76.7936

const PILL_SEARCH_TERMS = [
  "rice", "chicken", "bread", "cooking oil",
  "flour", "sugar", "milk", "beef",
]

type UploadState = "idle" | "scanning" | "processing" | "address" | "review" | "submitting" | "done"
type ScanCategory = "receipt" | "prescription" | "gas_price" | "shopping_list"

interface Toast {
  id: number
  type: "success" | "warn" | "error"
  message: string
}

interface CommandBarProps {
  savingsMode: number
  activeTab: "store" | "list"
  userLocation: { lat: number; lng: number } | null
  onSearchResults: (results: SearchResult[]) => void
  onAddToList?: (result: SearchResult, price: SearchResultPrice) => void
  onTabChange?: (tab: "store" | "list") => void
  onPointsAwarded?: () => void
}

const SCAN_CATEGORIES: { key: ScanCategory; label: string; emoji: string }[] = [
  { key: "receipt", label: "Receipt", emoji: "🧾" },
  { key: "prescription", label: "Prescription", emoji: "💊" },
  { key: "gas_price", label: "Gas Price", emoji: "⛽" },
  { key: "shopping_list", label: "Shopping List", emoji: "📝" },
]

async function resizeImage(file: File, maxPx = 1280, quality = 0.82): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((b) => resolve(b!), "image/jpeg", quality)
    }
    img.src = URL.createObjectURL(file)
  })
}

function ThreeDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  )
}

export function CommandBar({
  savingsMode,
  activeTab,
  userLocation,
  onSearchResults,
  onAddToList,
  onTabChange,
  onPointsAwarded,
}: CommandBarProps) {
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState("")
  const intent = activeTab === "list" ? "list" : "find"
  const [isSearching, setIsSearching] = useState(false)
  const [isListUploading, setIsListUploading] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [showCategoryChooser, setShowCategoryChooser] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadLabel, setUploadLabel] = useState("")
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([])
  const [storeAddress, setStoreAddress] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showPointsFloat, setShowPointsFloat] = useState(false)
  const toastIdRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const listFileInputRef = useRef<HTMLInputElement>(null)
  const selectedCategoryRef = useRef<ScanCategory>("receipt")
  const { user, requireAuth } = useAuth()

  const isUploading = uploadState === "scanning" || uploadState === "processing"
  const showScanPill =
    inputValue.trim() === "" && uploadState === "idle" && !showCategoryChooser && !isListUploading

  function addToast(type: Toast["type"], message: string) {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }

  function handleScanClick() {
    if (!user) {
      requireAuth(() => setShowCategoryChooser(true))
      return
    }
    setShowCategoryChooser(true)
  }

  function handleCategorySelect(cat: ScanCategory) {
    selectedCategoryRef.current = cat
    setShowCategoryChooser(false)
    if (cat === "shopping_list") {
      listFileInputRef.current?.click()
    } else {
      fileInputRef.current?.click()
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    setUploadState("scanning")
    setUploadLabel("Compressing…")

    try {
      const blob = await resizeImage(file)
      setUploadLabel("Uploading…")
      const fd = new FormData()
      fd.append("image", blob, "receipt.jpg")
      setUploadState("processing")
      setUploadLabel("Reading receipt…")
      const res = await fetch("/api/receipt", { method: "POST", body: fd })
      const data = (await res.json()) as ReceiptData & { error?: string }
      if (!res.ok || data.imageType === "unknown") {
        addToast("error", (data as { error?: string }).error ?? "Could not read that image. Try a clearer photo.")
        setUploadState("idle")
        return
      }
      setReceiptData(data)
      setReceiptItems(data.items)
      setStoreAddress(data.address ?? "")
      setUploadState("address")
    } catch {
      addToast("error", "Upload failed. Check your connection.")
      setUploadState("idle")
    }
  }

  async function handleConfirm() {
    if (!user) {
      addToast("warn", "Sign in to earn points.")
      return
    }
    if (!receiptData) return
    setUploadState("submitting")
    setSubmitError(null)

    try {
      const res = await fetch("/api/receipt/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiptData: { ...receiptData, items: receiptItems, total: receiptTotal },
          userId: user.id,
          category: receiptData.imageType ?? selectedCategoryRef.current,
          storeAddress,
        }),
      })
      const data = (await res.json()) as { receiptId?: number; pointsAwarded?: number; error?: string }
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to confirm.")
        setUploadState("review")
        return
      }
      setUploadState("done")
      setShowPointsFloat(true)
      queryClient.invalidateQueries({ queryKey: ["dashboard", user?.id] })
      onPointsAwarded?.()
      addToast("success", "+100 Scout Points earned!")
      setTimeout(() => {
        setUploadState("idle")
        setReceiptData(null)
        setShowPointsFloat(false)
      }, 2500)
    } catch {
      setSubmitError("Network error. Try again.")
      setUploadState("review")
    }
  }

  async function handleSubmit() {
    const message = inputValue.trim()
    if (!message || isSearching || cooldown) return
    if (!user) {
      requireAuth(() => handleSubmit())
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          intent,
          savingsMode,
          userLat: userLocation?.lat,
          userLng: userLocation?.lng,
        }),
      })
      const data = (await res.json()) as { results?: SearchResult[]; error?: string }
      if (data.results) {
        onSearchResults(data.results)
        setInputValue("")
      } else {
        addToast("warn", data.error ?? "No results found.")
      }
    } catch {
      addToast("error", "Search failed. Check your connection.")
    } finally {
      setIsSearching(false)
      setCooldown(true)
      setTimeout(() => setCooldown(false), 3000)
    }
  }

  function updateReceiptItem(index: number, field: keyof ReceiptItem, value: string) {
    setReceiptItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "price" || field === "quantity"
                  ? parseFloat(value) || 0
                  : value,
            }
          : item
      )
    )
  }

  const receiptTotal = receiptItems.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0)

  async function handleFindNearbyPill() {
    onTabChange?.("store")
    setIsSearching(true)
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terms: PILL_SEARCH_TERMS,
          savingsMode: 3,
          userLat: userLocation?.lat ?? KINGSTON_LAT,
          userLng: userLocation?.lng ?? KINGSTON_LNG,
        }),
      })
      const data = await res.json() as SearchResult[]
      onSearchResults(data.length > 0 ? data : DEMO_RESULTS)
    } catch {
      onSearchResults(DEMO_RESULTS)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleListFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!onAddToList) {
      addToast("warn", "Adding to list is not available.")
      return
    }
    setIsListUploading(true)
    let added = 0
    let noMatch = 0
    try {
      const text = await file.text()
      const lines = text
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (lines.length === 0) {
        addToast("warn", "File is empty or has no valid lines.")
        return
      }
      addToast("success", `Searching stores for ${lines.length} item${lines.length === 1 ? "" : "s"}…`)
      for (const line of lines) {
        try {
          const res = await fetch("/api/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: line,
              intent: "find",
              savingsMode,
              userLat: userLocation?.lat,
              userLng: userLocation?.lng,
            }),
          })
          const data = (await res.json()) as { results?: SearchResult[]; error?: string }
          const result = data.results?.[0]
          const cheapest = result?.prices?.[0]
          if (result && cheapest) {
            onAddToList(result, cheapest)
            added++
          } else {
            noMatch++
          }
        } catch {
          noMatch++
        }
      }
      onTabChange?.("list")
      if (added > 0) {
        addToast("success", `Added ${added} item${added === 1 ? "" : "s"} at best prices. Review in My List.`)
      }
      if (noMatch > 0) {
        addToast("warn", `${noMatch} line${noMatch === 1 ? "" : "s"} had no matches.`)
      }
      if (added === 0 && noMatch > 0) {
        addToast("warn", "No items could be matched. Try product names like \"rice\" or \"milk\".")
      }
    } catch {
      addToast("error", "Could not read file. Use a .txt or .csv with one item per line.")
    } finally {
      setIsListUploading(false)
    }
  }

  return (
    <div className="fixed inset-x-4 bottom-6 z-30">
      <div className="mx-auto max-w-2xl space-y-2">
        {/* Toasts */}
        <div className="pointer-events-none space-y-1.5">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
                t.type === "success"
                  ? "bg-primary text-white"
                  : t.type === "warn"
                  ? "bg-amber-500 text-white"
                  : "bg-destructive text-white"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {t.message}
            </div>
          ))}
        </div>

        {/* +100 pts float animation */}
        {showPointsFloat && (
          <div className="pointer-events-none text-center animate-in fade-in slide-in-from-bottom-4">
            <span className="text-2xl font-black text-primary drop-shadow-lg">+100 pts</span>
          </div>
        )}

        {/* Scan category chooser (replaces intent pills while open) */}
        {showCategoryChooser && (
          <div className="flex flex-wrap items-center gap-2">
            {SCAN_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategorySelect(cat.key)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
            <button
              onClick={() => setShowCategoryChooser(false)}
              className="ml-auto rounded-xl border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Intent pills (hidden when category chooser is open or upload is in progress) */}
        {!showCategoryChooser && uploadState === "idle" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleFindNearbyPill}
              disabled={isSearching}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium shadow backdrop-blur-sm transition-colors disabled:opacity-60 ${
                intent === "find"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <MapPin className="h-3 w-3" /> Find nearby
            </button>
            <button
              onClick={() => onTabChange?.("list")}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium shadow backdrop-blur-sm transition-colors ${
                intent === "list"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <ListPlus className="h-3 w-3" /> Add to list
            </button>
          </div>
        )}

        {/* Address confirmation panel */}
        {uploadState === "address" && receiptData && (
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Confirm store
            </p>
            <input
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder={receiptData.store ?? "Store address"}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setUploadState("review")}
                className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Looks good →
              </button>
              <button
                onClick={() => {
                  setUploadState("idle")
                  setReceiptData(null)
                }}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Inline review panel */}
        {(uploadState === "review" || uploadState === "submitting") && receiptData && (
          <div className="flex max-h-64 flex-col rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Review items
              </span>
              <button
                onClick={() => {
                  setUploadState("idle")
                  setReceiptData(null)
                }}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2">
              {receiptItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    value={item.name}
                    onChange={(e) => updateReceiptItem(i, "name", e.target.value)}
                  />
                  <input
                    className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-right text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    type="number"
                    value={item.price}
                    onChange={(e) => updateReceiptItem(i, "price", e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="shrink-0 space-y-2 border-t border-border px-4 py-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total</span>
                <span className="font-bold text-foreground">J${receiptTotal.toFixed(2)}</span>
              </div>
              {submitError && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> {submitError}
                </p>
              )}
              <button
                onClick={handleConfirm}
                disabled={uploadState === "submitting" || receiptItems.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {uploadState === "submitting" ? (
                  <ThreeDots />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" /> Confirm &amp; Earn 100 pts
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input (receipt/scan) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* Hidden file input (list upload: .txt, .csv) */}
        <input
          ref={listFileInputRef}
          type="file"
          accept=".txt,.csv,text/plain,text/csv"
          className="hidden"
          onChange={handleListFileChange}
        />

        {/* Main bar */}
        <div className="flex h-14 items-center gap-2 rounded-2xl border border-border bg-card px-3 shadow-xl backdrop-blur-md sm:gap-3 sm:px-4">
          {/* Sparkles + MASSIV label */}
          <div className="flex shrink-0 flex-col items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="mt-0.5 text-[0.5rem] font-black uppercase leading-none tracking-widest text-muted-foreground">
              MASSIV
            </span>
          </div>

          {/* Input or upload progress */}
          {isUploading ? (
            <div className="flex flex-1 items-center gap-2 text-muted-foreground">
              <ThreeDots />
              <span className="text-sm">{uploadLabel}</span>
            </div>
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
              }}
              placeholder={
                user ? "Search for products, prices, stores..." : "Sign in to search..."
              }
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          )}

          {/* Right action */}
          {showScanPill ? (
            <button
              type="button"
              onClick={handleScanClick}
              disabled={isUploading}
<<<<<<< HEAD
              className="group relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-lg bg-primary px-2.5 py-2 text-xs font-medium text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <span className="relative">Scan Receipt</span>
              <ScanLine className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2.5} />
=======
              className="group relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-primary px-2.5 py-2.5 text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60 sm:gap-2 sm:px-4"
            >
              <span className="relative hidden sm:inline">Scan Receipt</span>
              <ScanLine className="h-4 w-4 shrink-0" strokeWidth={2.5} />
>>>>>>> 27c2ba879b2039161cd18f7973370d4298279edb
            </button>
          ) : isUploading ? null : (
            <button
              onClick={handleSubmit}
              disabled={isSearching || cooldown}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isSearching ? <ThreeDots /> : <Send className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
