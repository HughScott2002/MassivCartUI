"use client"

import { useRef, useState } from "react"
import { Sparkles, ScanLine, Send, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ReceiptReviewSheet } from "./receipt-review-sheet"
import type { SearchResult, ReceiptData } from "@/lib/types"

interface CommandBarProps {
  onScanReceipt?: () => void
  onResults?: (results: SearchResult[]) => void
  onPointsAwarded?: () => void
  savingsMode?: number
  userLocation?: { lat: number; lng: number } | null
}

async function resizeImage(
  file: File,
  maxPx = 1280,
  quality = 0.82
): Promise<Blob> {
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

export function CommandBar({
  onScanReceipt,
  onResults,
  onPointsAwarded,
  savingsMode = 2,
  userLocation,
}: CommandBarProps) {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const showScanPill = inputValue.trim() === ""
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  function handleScan() {
    fileInputRef.current?.click()
    onScanReceipt?.()
  }

  async function handleSubmit() {
    const message = inputValue.trim()
    if (!message || isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          intent: "find",
          savingsMode,
          userLat: userLocation?.lat,
          userLng: userLocation?.lng,
        }),
      })
      const data = await res.json() as { results?: SearchResult[] }
      if (data.results) {
        onResults?.(data.results)
      }
      setInputValue("")
    } catch {
      // ignore network errors silently
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsLoading(true)
    try {
      const blob = await resizeImage(file)
      const fd = new FormData()
      fd.append("image", blob, "receipt.jpg")
      const res = await fetch("/api/receipt", { method: "POST", body: fd })
      const data = await res.json() as ReceiptData
      if (res.ok) {
        setReceiptData(data)
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
      e.target.value = ""
    }
  }

  return (
    <>
      {receiptData && (
        <ReceiptReviewSheet
          receiptData={receiptData}
          userId={user?.id}
          onClose={() => setReceiptData(null)}
          onPointsAwarded={onPointsAwarded}
        />
      )}

      <div className="fixed inset-x-4 bottom-6 z-30">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-xl backdrop-blur-md">
            {/* Intent icon */}
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />

            {/* Text input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
              placeholder="Search for products, prices, stores..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {showScanPill ? (
              <button
                type="button"
                onClick={handleScan}
                disabled={isLoading}
                className="group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="relative">Scan Receipt</span>
                    <ScanLine className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
