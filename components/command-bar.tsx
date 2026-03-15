"use client"

import { useRef, useState } from "react"
import { Sparkles, Plus, Send } from "lucide-react"

interface CommandBarProps {
  onScanReceipt?: () => void
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

export function CommandBar({ onScanReceipt }: CommandBarProps) {
  const [inputValue, setInputValue] = useState("")
  const showScanPill = inputValue.trim() === ""
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleScan() {
    fileInputRef.current?.click()
    onScanReceipt?.()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const blob = await resizeImage(file)
    const fd = new FormData()
    fd.append("image", blob, "receipt.jpg")
    const res = await fetch("/api/receipt", { method: "POST", body: fd })
    console.log("receipt response:", await res.json())
    e.target.value = ""
  }

  return (
    <div className="fixed inset-x-4 bottom-6 z-30">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-card px-4 py-3 shadow-xl backdrop-blur-md dark:border-white/10">
          {/* Intent icon */}
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />

          {/* Text input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
            /* Scan Receipt Pill - Major Highlight */
            <button
              type="button"
              onClick={handleScan}
              className="group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-green-500 hover:shadow-xl hover:shadow-green-600/30 active:scale-[0.98]"
            >
              <span className="relative">Scan Receipt</span>
              <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            </button>
          ) : (
            /* Send button - shown when user has typed */
            <button className="rounded-xl bg-primary p-2 text-white transition-colors hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
