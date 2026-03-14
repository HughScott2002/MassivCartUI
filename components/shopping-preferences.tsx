"use client"

import { useState } from "react"
import { LayoutDashboard, Store, DollarSign } from "lucide-react"

const savingsOptions = [
  { label: "Quick Trip", maxStores: 1, radiusKm: 3 },
  { label: "Balanced", maxStores: 2, radiusKm: 8 },
  { label: "Optimal", maxStores: 3, radiusKm: 15 },
  { label: "Extreme", maxStores: 5, radiusKm: 40 },
]

export function ShoppingPreferences() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "route">("dashboard")
  const [savingsMode, setSavingsMode] = useState(2)
  const selected = savingsOptions[savingsMode]

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-card text-foreground shadow-xl backdrop-blur-md dark:border-white/10">
      {/* Tab switcher */}
      <div className="flex border-b border-black/10 dark:border-white/10">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "dashboard"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("route")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "route"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="h-4 w-4" />
          Route
        </button>
      </div>

      <div className="space-y-4 p-4">
        {activeTab === "dashboard" ? (
          <>
            {/* Scout Points placeholder */}
            <div className="space-y-1">
              <p className="text-xs tracking-wider text-muted-foreground uppercase">
                Scout Points
              </p>
              <p className="text-2xl font-bold text-primary">0 pts</p>
              <p className="text-xs text-muted-foreground">
                Shopper tier · 0% to Smart Shopper
              </p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-full w-0 rounded-full bg-primary" />
              </div>
            </div>

            {/* Budget widget */}
            <div className="space-y-2">
              <p className="flex items-center gap-1 text-xs tracking-wider text-muted-foreground uppercase">
                <DollarSign className="h-3 w-3" /> Weekly Budget
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">J$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="flex-1 rounded-lg border border-black/10 bg-black/5 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Cart total</span>
                <span>J$0</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Savings mode */}
            <div className="space-y-3">
              <p className="text-xs tracking-wider text-muted-foreground uppercase">
                Savings Mode
              </p>
              <div className="space-y-2">
                {savingsOptions.map((opt, i) => (
                  <button
                    key={opt.label}
                    onClick={() => setSavingsMode(i)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                      savingsMode === i
                        ? "border border-primary/50 bg-primary/20 text-primary"
                        : "border border-black/10 bg-black/5 text-muted-foreground hover:text-foreground dark:border-white/10 dark:bg-white/5"
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs">
                      {opt.maxStores} store{opt.maxStores > 1 ? "s" : ""} ·{" "}
                      {opt.radiusKm}km
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Up to {selected.maxStores} store
                {selected.maxStores > 1 ? "s" : ""} · {selected.radiusKm}km
                radius
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
