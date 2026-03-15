"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ShoppingPreferences } from "@/components/shopping-preferences"
import { ShopDetailsSheet } from "@/components/shop-details-sheet"
import { CommandBar } from "@/components/command-bar"
import { LayoutDashboard, ShoppingBasket, Store } from "lucide-react"

export default function Page() {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const check = () => {
      setIsMobile(mq.matches)
      if (mq.matches) {
        setLeftOpen(false)
        setRightOpen(false)
      } else {
        setLeftOpen(true)
        setRightOpen(true)
      }
    }
    check()
    mq.addEventListener("change", check)
    return () => mq.removeEventListener("change", check)
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">

      {/* Map placeholder — replaced with Mapbox in Phase 2 */}
      <div className="absolute inset-0 bg-background">
        <div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, #00d26a22 0%, transparent 50%),
                              radial-gradient(circle at 70% 30%, #3b82f622 0%, transparent 40%)`,
          }}
        />
      </div>

      {/* Header */}
      <Header />

      {/* Left + Right panels — on mobile shown as overlay when open */}
      <div className="pointer-events-none fixed inset-x-4 top-18 bottom-28 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        {leftOpen && (
          <div className="pointer-events-auto w-full shrink-0 sm:w-72 max-sm:absolute max-sm:right-4 max-sm:top-16 max-sm:bottom-24 max-sm:w-[min(100%,340px)] max-sm:max-h-[70vh] max-sm:overflow-auto max-sm:z-30 max-sm:shadow-2xl">
            <ShoppingPreferences onClose={() => setLeftOpen(false)} />
          </div>
        )}
        {rightOpen && (
          <div className="pointer-events-auto w-full sm:w-80 sm:ml-auto max-sm:absolute max-sm:right-4 max-sm:top-16 max-sm:bottom-24 max-sm:w-[min(100%,340px)] max-sm:max-h-[70vh] max-sm:overflow-auto max-sm:z-30 max-sm:shadow-2xl">
            <ShopDetailsSheet onClose={() => setRightOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile: pills on the right — always visible, click to open/close panel */}
      {isMobile && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => setLeftOpen((v) => !v)}
            className={`flex items-center justify-center w-11 h-11 rounded-full border shadow-lg transition-colors ${
              leftOpen
                ? "bg-primary border-primary text-white"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            }`}
            aria-label={leftOpen ? "Close Dashboard" : "Open Dashboard"}
          >
            <LayoutDashboard className="w-15 h-7" />
          </button>
          <button
            onClick={() => setRightOpen((v) => !v)}
            className={`flex items-center justify-center w-11 h-11 rounded-full border shadow-lg transition-colors ${
              rightOpen
                ? "bg-primary border-primary text-white"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            }`}
            aria-label={rightOpen ? "Close Store and My List" : "Open Store and My List"}
          >
            <Store className="w-15 h-7" />
          </button>
        </div>
      )}

      {/* Desktop: re-open edge buttons when panel is closed */}
      {!isMobile && !leftOpen && (
        <button
          onClick={() => setLeftOpen(true)}
          className="pointer-events-auto fixed left-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-card border border-border border-l-0 rounded-r-xl px-2 py-3 shadow-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>
      )}
      {!isMobile && !rightOpen && (
        <button
          onClick={() => setRightOpen(true)}
          className="pointer-events-auto fixed right-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-card border border-border border-r-0 rounded-l-xl px-2 py-3 shadow-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShoppingBasket className="w-4 h-4" />
        </button>
      )}

      {/* Mobile overlay backdrop when a panel is open */}
      {isMobile && (leftOpen || rightOpen) && (
        <div
          className="fixed inset-0 bg-black/30 z-[25] pointer-events-auto sm:hidden"
          onClick={() => {
            if (leftOpen) setLeftOpen(false)
            if (rightOpen) setRightOpen(false)
          }}
          aria-hidden
        />
      )}

      {/* Command bar */}
      <CommandBar />
    </main>
  )
}
