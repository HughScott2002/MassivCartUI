"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ShoppingPreferences } from "@/components/shopping-preferences"
import { ShopDetailsSheet } from "@/components/shop-details-sheet"
import { CommandBar } from "@/components/command-bar"
import { LayoutDashboard, ShoppingBasket } from "lucide-react"

export default function Page() {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

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

      {/* Left + Right panels */}
      <div className="pointer-events-none fixed inset-x-4 top-18 bottom-28 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        {leftOpen && (
          <div className="pointer-events-auto w-full shrink-0 sm:w-72">
            <ShoppingPreferences onClose={() => setLeftOpen(false)} />
          </div>
        )}
        {rightOpen && (
          <div className="pointer-events-auto w-full sm:w-80 sm:ml-auto">
            <ShopDetailsSheet onClose={() => setRightOpen(false)} />
          </div>
        )}
      </div>

      {/* Re-open tabs — only visible when panel is closed */}
      {!leftOpen && (
        <button
          onClick={() => setLeftOpen(true)}
          className="pointer-events-auto fixed left-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-card border border-border border-l-0 rounded-r-xl px-2 py-3 shadow-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>
      )}
      {!rightOpen && (
        <button
          onClick={() => setRightOpen(true)}
          className="pointer-events-auto fixed right-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 bg-card border border-border border-r-0 rounded-l-xl px-2 py-3 shadow-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShoppingBasket className="w-4 h-4" />
        </button>
      )}

      {/* Command bar */}
      <CommandBar />
    </main>
  )
}
