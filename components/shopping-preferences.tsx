"use client"

import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, MapPin, X, Eye, EyeOff, Wallet, Award, Zap, Target, Compass, TrendingUp } from "lucide-react";

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
  { label: "Quick Trip", description: "Minimal travel, one stop", maxStores: 1, radiusKm: 3, icon: Zap },
  { label: "Balanced", description: "Good savings, moderate travel", maxStores: 2, radiusKm: 8, icon: Target },
  { label: "Optimal", description: "Best value, multiple stops", maxStores: 3, radiusKm: 15, icon: Compass },
  { label: "Extreme", description: "Maximum savings, extended route", maxStores: 5, radiusKm: 40, icon: TrendingUp },
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
    <div className="rounded-2xl border border-border bg-card backdrop-blur-md text-foreground shadow-xl overflow-hidden flex flex-col">
      {/* Tab switcher */}
      <div className="flex border-b border-border shrink-0">
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
          <MapPin className="w-4 h-4" />
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

      {/* Content */}
      <div className="flex-1 p-5 space-y-5">
        {activeTab === "dashboard" ? (
          <>
            {/* Weekly Budget Section */}
            <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <p className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider">
                    Weekly Budget
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBudgetVisible((v) => !v)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={budgetVisible ? "Hide budget" : "Show budget"}
                >
                  {budgetVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-muted-foreground">J$</span>
                {budgetVisible ? (
                  <input
                    type="number"
                    min={0}
                    value={budget || ""}
                    onChange={(e) => setBudget(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="flex-1 min-w-0 text-3xl font-bold text-foreground bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">••••••</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current basket</span>
                  {budgetVisible && (
                    <span className="font-medium text-foreground tabular-nums">
                      J${cartTotal.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  />
                </div>
                {budgetVisible && (
                  <p className="text-xs text-muted-foreground">
                    {budgetPercent.toFixed(0)}% used
                    {budget > 0 && (
                      <span className="ml-1">
                        · J${Math.abs(budget - cartTotal).toLocaleString()}{" "}
                        {cartTotal <= budget ? "remaining" : "over"}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Scout Points Section */}
            <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <p className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider">
                  Scout Points
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">0 pts</p>
              <p className="text-xs text-muted-foreground">
                Shopper tier · 0% to Smart Shopper
              </p>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-0 rounded-full bg-primary transition-all duration-500" />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Savings Mode Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider">
                  Savings Mode
                </p>
              </div>
              
              <div className="space-y-2">
                {savingsOptions.map((opt, i) => {
                  const Icon = opt.icon;
                  const isSelected = savingsMode === i;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSavingsMode(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                        isSelected
                          ? "border border-primary bg-primary/10 text-foreground ring-1 ring-primary/20"
                          : "border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isSelected ? "text-foreground" : ""}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {opt.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-medium tabular-nums ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                          {opt.maxStores} store{opt.maxStores > 1 ? "s" : ""}
                        </p>
                        <p className="text-[0.65rem] text-muted-foreground tabular-nums">
                          {opt.radiusKm}km radius
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-center text-xs text-muted-foreground">
                  Current: <span className="font-medium text-foreground">{selected.label}</span> · Up to {selected.maxStores} store{selected.maxStores > 1 ? "s" : ""} within {selected.radiusKm}km
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
