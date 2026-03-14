"use client";

import { useState } from "react";
import { LayoutDashboard, Store, DollarSign } from "lucide-react";
import { BudgetPopup } from "@/components/budget-popup";

const savingsOptions = [
  { label: "Quick Trip", maxStores: 1, radiusKm: 3 },
  { label: "Balanced", maxStores: 2, radiusKm: 8 },
  { label: "Optimal", maxStores: 3, radiusKm: 15 },
  { label: "Extreme", maxStores: 5, radiusKm: 40 },
];

export function ShoppingPreferences() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "route">("dashboard");
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budget, setBudget] = useState(0);
  const cartTotal = 0; // Wire to cart context when available
  const [savingsMode, setSavingsMode] = useState(2);
  const selected = savingsOptions[savingsMode];

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-card backdrop-blur-md text-foreground shadow-xl overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-black/10 dark:border-white/10">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "dashboard"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("route")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "route"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="w-4 h-4" />
          Route
        </button>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === "dashboard" ? (
          <>
            {/* Scout Points placeholder */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Scout Points</p>
              <p className="text-2xl font-bold text-primary">0 pts</p>
              <p className="text-xs text-muted-foreground">Shopper tier · 0% to Smart Shopper</p>
              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 mt-1">
                <div className="h-full w-0 rounded-full bg-primary" />
              </div>
            </div>

            {/* Budget summary - opens popup */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Weekly Budget
              </p>
              <button
                onClick={() => setBudgetOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-primary/50 transition-colors text-left"
              >
                <span className="text-sm font-medium text-foreground">
                  J${budget || 0}
                </span>
                <span className="text-xs text-muted-foreground">Pop out</span>
              </button>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Cart total</span>
                <span>J${cartTotal.toFixed(0)}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Savings mode */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Savings Mode</p>
              <div className="space-y-2">
                {savingsOptions.map((opt, i) => (
                  <button
                    key={opt.label}
                    onClick={() => setSavingsMode(i)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                      savingsMode === i
                        ? "bg-primary/20 border border-primary/50 text-primary"
                        : "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs">
                      {opt.maxStores} store{opt.maxStores > 1 ? "s" : ""} · {opt.radiusKm}km
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Up to {selected.maxStores} store{selected.maxStores > 1 ? "s" : ""} · {selected.radiusKm}km radius
              </p>
            </div>
          </>
        )}
      </div>

      <BudgetPopup
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        budget={budget || undefined}
        onBudgetChange={setBudget}
        currentSpend={cartTotal}
      />
    </div>
  );
}
