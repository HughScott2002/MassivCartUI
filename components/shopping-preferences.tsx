"use client"

import { useState } from "react";
import { LayoutDashboard, Store, X } from "lucide-react";
import { BudgetPopup } from "@/components/budget-popup";

const savingsOptions = [
  { label: "Quick Trip", maxStores: 1, radiusKm: 3 },
  { label: "Balanced", maxStores: 2, radiusKm: 8 },
  { label: "Optimal", maxStores: 3, radiusKm: 15 },
  { label: "Extreme", maxStores: 5, radiusKm: 40 },
]

export function ShoppingPreferences({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "route">("dashboard");
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budget, setBudget] = useState(0);
  const cartTotal = 0; // Wire to cart context when available
  const [savingsMode, setSavingsMode] = useState(2);
  const selected = savingsOptions[savingsMode];

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
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

        {/* Budget summary bar - click anywhere to open popup and edit */}
        <button
          type="button"
          onClick={() => setBudgetOpen(true)}
          className="w-full bg-primary px-4 py-3 flex flex-col gap-1 text-left cursor-pointer hover:bg-primary/90 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Weekly Budget</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">J${budget || 0}</span>
            <span className="text-sm font-bold text-white">Cart: J${cartTotal.toFixed(0)}</span>
          </div>
        </button>
      <div className="p-4 space-y-4">
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

      <BudgetPopup
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        budget={budget}
        onBudgetChange={setBudget}
        currentSpend={cartTotal}
      />
    </div>
  )
}
