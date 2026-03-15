"use client"

import { useState, useEffect, useCallback } from "react"
import { LayoutDashboard, Navigation, X, Eye, EyeOff } from "lucide-react"

const BUDGET_STORAGE_KEY = "massivcart_weekly_budget"

function getStoredBudget(): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY)
    if (raw == null) return 0
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

function setStoredBudget(value: number) {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, String(value))
  } catch {
    /* ignore */
  }
}

// Tier thresholds from CLAUDE.md
const TIERS = [
  { key: "shopper", label: "Shopper", min: 0 },
  { key: "smart_shopper", label: "Smart Shopper", min: 1000 },
  { key: "price_scout", label: "Price Scout", min: 3000 },
  { key: "community_champ", label: "Community Champ", min: 7500 },
  { key: "elite", label: "Elite", min: 15000 },
]

function getTierInfo(points: number) {
  let current = TIERS[0]
  let next = TIERS[1]
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) {
      current = TIERS[i]
      next = TIERS[i + 1] ?? null
      break
    }
  }
  const progress = next
    ? ((points - current.min) / (next.min - current.min)) * 100
    : 100
  const remaining = next ? next.min - points : 0
  return { current, next, progress: Math.min(progress, 100), remaining }
}

const savingsOptions = [
  { label: "Quick Trip", maxStores: 1, radiusKm: 3 },
  { label: "Balanced", maxStores: 2, radiusKm: 8 },
  { label: "Optimal", maxStores: 3, radiusKm: 15 },
  { label: "Extreme", maxStores: 5, radiusKm: 40 },
]

// Dummy data — wire to API in Phase 6
const DUMMY_POINTS = 1250
const DUMMY_CART_TOTAL = 3750

export function ShoppingPreferences({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "route">("dashboard")
  const [budget, setBudgetState] = useState(0)
  const [budgetVisible, setBudgetVisible] = useState(true)
  const [savingsMode, setSavingsMode] = useState(2)

  useEffect(() => {
    setBudgetState(getStoredBudget())
  }, [])

  const setBudget = useCallback(
    (value: number | ((prev: number) => number)) => {
      setBudgetState((prev) => {
        const next = typeof value === "function" ? value(prev) : value
        const n = Number.isFinite(next) && next >= 0 ? next : 0
        setStoredBudget(n)
        return n
      })
    },
    []
  )

  const cartTotal = DUMMY_CART_TOTAL
  const points = DUMMY_POINTS
  const selected = savingsOptions[savingsMode]
  const budgetPercent =
    budget > 0 ? Math.min((cartTotal / budget) * 100, 100) : 0
  const isOver = budget > 0 && cartTotal > budget
  const {
    current: tier,
    next: nextTier,
    progress: tierProgress,
    remaining,
  } = getTierInfo(points)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl backdrop-blur-md">
      {/* Tab switcher */}
      <div className="flex border-b border-border">
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
          <Navigation className="h-4 w-4" />
          Route
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Weekly Budget — always visible, solid green */}
      <div className="flex flex-col gap-3 bg-primary px-4 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold tracking-widest text-white uppercase">
            Weekly Budget
          </h3>
          <button
            type="button"
            onClick={() => setBudgetVisible((v) => !v)}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label={budgetVisible ? "Hide budget" : "Show budget"}
          >
            {budgetVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Big budget number */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white/70">J$</span>
          {budgetVisible ? (
            <input
              type="number"
              min={0}
              value={budget || ""}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full min-w-0 [appearance:textfield] border-0 bg-transparent text-6xl leading-none font-black text-white outline-none placeholder:text-white/40 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          ) : (
            <span className="text-6xl leading-none font-black text-white/40">
              ••••
            </span>
          )}
        </div>
      </div>
      {/* Current basket */}
      <div className="mx-6 my-6 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[0.7rem] font-semibold tracking-wider uppercase">
            Current Basket
          </span>
          {budgetVisible && (
            <span className="text-xs font-bold text-white tabular-nums">
              J${cartTotal.toLocaleString()}
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-red-300" : "bg-primary"}`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
        {budgetVisible && (
          <p className="text-[0.7rem] font-semibold tracking-wider uppercase
          ">
            {budgetPercent.toFixed(0)}% used
            {budget > 0 && (
              <span className="ml-1">
                · J${Math.abs(budget - cartTotal).toLocaleString()}{" "}
                {isOver ? "over" : "remaining"}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Tab content */}
      <div className="space-y-4 p-4">
        {activeTab === "dashboard" ? (
          <>
            {/* Scout Points */}
            <div className="space-y-2">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                Scout Points
              </p>
              <p className="leading-none tabular-nums">
                <span className="text-6xl font-black text-primary">
                  {points.toLocaleString()}
                </span>
                <span className="text-3xl font-black text-primary"> pts</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {tier.label} tier
                {nextTier && (
                  <span>
                    {" "}
                    · {remaining.toLocaleString()} pts to {nextTier.label}
                  </span>
                )}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Savings mode */}
            <div className="space-y-3">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                Savings Mode
              </p>
              <div className="space-y-2">
                {savingsOptions.map((opt, i) => (
                  <button
                    key={opt.label}
                    onClick={() => setSavingsMode(i)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      savingsMode === i
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs tabular-nums">
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
