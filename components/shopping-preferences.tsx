"use client"

import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Store, X, Eye, EyeOff } from "lucide-react";

const BUDGET_STORAGE_KEY = "massivcart_weekly_budget";

function getStoredBudget(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (raw == null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function setStoredBudget(value: number) {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

const savingsOptions = [
  { label: "Quick Trip", maxStores: 1, radiusKm: 3 },
  { label: "Balanced", maxStores: 2, radiusKm: 8 },
  { label: "Optimal", maxStores: 3, radiusKm: 15 },
  { label: "Extreme", maxStores: 5, radiusKm: 40 },
]

export function ShoppingPreferences({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "route">("dashboard");
  const [budget, setBudgetState] = useState(0);
  const [budgetVisible, setBudgetVisible] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setBudgetState(getStoredBudget());
  }, []);

  const setBudget = useCallback((value: number | ((prev: number) => number)) => {
    setBudgetState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const n = Number.isFinite(next) && next >= 0 ? next : 0;
      setStoredBudget(n);
      return n;
    });
  }, []);
  const cartTotal = 0; // Wire to cart context when available
  const [savingsMode, setSavingsMode] = useState(2);
  const selected = savingsOptions[savingsMode];

  const budgetPercent = budget > 0 ? (cartTotal / budget) * 100 : 0;
  const isOver = budgetPercent > 100;

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

      {/* Weekly Budget — inline, no popup */}
      <div className="bg-primary px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest drop-shadow-sm">
            Weekly Budget
          </h3>
          <button
            type="button"
            onClick={() => setBudgetVisible((v) => !v)}
            className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors"
            aria-label={budgetVisible ? "Hide budget" : "Show budget"}
          >
            {budgetVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-white tabular-nums">J$</span>
          {budgetVisible ? (
            <input
              type="number"
              min={0}
              value={budget || ""}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              placeholder="0"
              className="flex-1 min-w-0 text-2xl font-black text-white bg-transparent px-1 py-0.5 border-0 outline-none focus:ring-0 focus:outline-none placeholder:text-white/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          ) : (
            <span className="text-xl font-extrabold text-white/80">••••••</span>
          )}
        </div>
        {/* Current basket progression bar — directly under budget */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.7rem] font-semibold text-white/90 uppercase tracking-wider">
              Current basket
            </span>
            {budgetVisible && (
              <span className="text-xs font-bold text-white tabular-nums">
                J${cartTotal.toFixed(0)}
              </span>
            )}
          </div>
          <div className="h-2.5 w-full rounded-full bg-emerald-400/60 dark:bg-emerald-300/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOver ? "bg-white" : "bg-white"
              }`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>
          {budgetVisible && (
            <p className="text-[0.65rem] font-medium text-white/80">
              {budgetPercent.toFixed(0)}% used
              {budget > 0 && (
                <span className="ml-1">
                  · J${Math.abs(budget - cartTotal).toFixed(0)}{" "}
                  {cartTotal <= budget ? "remaining" : "over"}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

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
    </div>
  )
}
