"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Header } from "@/components/header"
import { ShoppingPreferences } from "@/components/shopping-preferences"
import { ShopDetailsSheet } from "@/components/shop-details-sheet"
import { CommandBar } from "@/components/command-bar"
import { MapBackground } from "@/components/map-background"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import { useAuth } from "@/lib/auth-context"
import type { POI } from "@/lib/poi-provider"
import type { POICategory } from "@/lib/poi-provider"
import { LayoutDashboard, ShoppingBasket, Store } from "lucide-react"
import type { SearchResult, ListItem } from "@/lib/types"

const CATEGORY_TERMS: Record<POICategory, string[]> = {
  grocery:   ["rice", "chicken", "bread", "cooking oil", "flour", "sugar", "milk", "beef", "butter", "cheese", "pasta", "crackers", "cereal", "juice", "soda", "water", "salt", "cornmeal", "sardines", "tuna"],
  pharmacy:  ["paracetamol", "ibuprofen", "vitamins", "bandage", "antiseptic", "cough syrup", "panadol", "aspirin", "antacid", "strepsils", "dettol", "gaviscon", "nurofen", "baby"],
  wholesale: ["rice", "flour", "sugar", "cooking oil", "chicken", "pasta", "canned goods", "cornmeal", "butter", "milk", "sardines", "crackers"],
  hardware:  ["cement", "paint", "lumber", "nails", "pipe", "wire", "rebar", "plywood", "screws", "tape", "hammer", "stain"],
  fuel:      ["gas", "diesel", "petrol", "fuel", "kerosene"],
}

/** Deterministic per-store shuffle so each pin shows a distinct product ordering. */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0 }
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    h = Math.imul(1664525, h) + 1013904223 | 0
    const j = Math.abs(h) % (i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

export default function Page() {
  const { showTutorial, dismissTutorial } = useAuth()
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const flyToRef = useRef<((lng: number, lat: number) => void) | null>(null)
  const locateRef = useRef<(() => void) | null>(null)
  const fitRouteRef = useRef<(() => void) | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [, setAtLocation] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [listItems, setListItems] = useState<ListItem[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [showPointsToast, setShowPointsToast] = useState(false)

  function handleAddToList(
    result: SearchResult,
    price: { store_id: number; store_name: string; branch: string | null; price: number; lat: number | null; lng: number | null }
  ) {
    const item: ListItem = {
      product_id: result.product_id,
      store_id: price.store_id,
      canonical_name: result.canonical_name,
      category: result.category,
      unit_type: result.unit_type,
      price: price.price,
      store_name: price.store_name,
      branch: price.branch,
      lat: price.lat,
      lng: price.lng,
    }
    setListItems((prev) =>
      prev.some((i) => i.product_id === item.product_id && i.store_id === item.store_id)
        ? prev
        : [...prev, item]
    )
  }

  function handleRemoveFromList(item: ListItem) {
    setListItems((prev) =>
      prev.filter((i) => !(i.product_id === item.product_id && i.store_id === item.store_id))
    )
  }

  const listTotal = listItems.reduce((sum, item) => sum + item.price, 0)

  const routeStops = useMemo(() => {
    const seen = new Set<number>()
    const stops: Array<{ lat: number; lng: number; store_name: string; stop_num: number }> = []
    for (const item of listItems) {
      if (item.lat == null || item.lng == null) continue
      if (seen.has(item.store_id)) continue
      seen.add(item.store_id)
      stops.push({ lat: item.lat, lng: item.lng, store_name: item.store_name, stop_num: stops.length + 1 })
    }
    return stops
  }, [listItems])

  // Lifted state for CommandBar / ShoppingPreferences sync
  const [rightTab, setRightTab] = useState<"store" | "list">("store")
  const [savingsMode, setSavingsMode] = useState(2)

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

  // Auto-open right panel when results arrive
  useEffect(() => {
    if (searchResults.length > 0) setRightOpen(true)
  }, [searchResults])

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!showPointsToast) return
    const t = setTimeout(() => setShowPointsToast(false), 3000)
    return () => clearTimeout(t)
  }, [showPointsToast])

  async function handleStoreSelect(poi: POI | null) {
    setSelectedStoreId(poi?.id ?? null)
    if (!poi) return
    setRightTab("store")
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terms: CATEGORY_TERMS[poi.category],
          savingsMode,
          userLat: poi.lat,
          userLng: poi.lng,
        }),
      })
      const data = await res.json() as SearchResult[]
      setSearchResults(seededShuffle(data, poi.id))
    } catch {
      setSearchResults([])
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {showTutorial && <TutorialOverlay onDone={dismissTutorial} />}

      {/* Map — Phase 2: Mapbox GL */}
      <div className="absolute inset-0">
        <MapBackground
          selectedStoreId={selectedStoreId}
          onStoreSelect={handleStoreSelect}
          activeCategory={activeCategory}
          flyToRef={flyToRef}
          locateRef={locateRef}
          onAtLocationChange={setAtLocation}
          onLocationChange={setUserLocation}
          routeStops={routeStops}
          fitRouteRef={fitRouteRef}
        />
      </div>

      {/* Header */}
      <Header locateRef={locateRef} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Left + Right panels — desktop: inline; mobile: overlay popups above everything */}
      <div className="pointer-events-none fixed inset-x-4 top-18 bottom-28 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between max-sm:inset-auto max-sm:top-auto max-sm:left-auto max-sm:right-auto max-sm:bottom-auto max-sm:contents">
        {leftOpen && (
          <div className="pointer-events-auto w-full shrink-0 sm:w-72 max-sm:fixed max-sm:right-4 max-sm:top-20 max-sm:w-[min(calc(100%-2rem),340px)] max-sm:max-h-[65vh] max-sm:overflow-auto max-sm:z-[60] max-sm:shadow-2xl max-sm:rounded-2xl">
            <ShoppingPreferences
              onClose={() => setLeftOpen(false)}
              savingsMode={savingsMode}
              onSavingsModeChange={setSavingsMode}
              cartTotal={listTotal}
            />
          </div>
        )}
        {rightOpen && (
          <div className="pointer-events-auto w-full sm:w-80 sm:ml-auto max-sm:fixed max-sm:right-4 max-sm:top-20 max-sm:w-[min(calc(100%-2rem),340px)] max-sm:max-h-[65vh] max-sm:overflow-auto max-sm:z-[60] max-sm:shadow-2xl max-sm:rounded-2xl">
            <ShopDetailsSheet
              onClose={() => setRightOpen(false)}
              results={searchResults}
              listItems={listItems}
              onAddToList={handleAddToList}
              onRemoveFromList={handleRemoveFromList}
              onFlyTo={(lng, lat) => flyToRef.current?.(lng, lat)}
              activeTab={rightTab}
              onTabChange={setRightTab}
              onShowRoute={() => fitRouteRef.current?.()}
            />
          </div>
        )}
      </div>

      {/* Mobile: pills on the right — closer to top */}
      {isMobile && (
        <div className="fixed right-4 top-28 z-[55] flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => setLeftOpen((v) => !v)}
            className={`flex items-center justify-center w-11 h-11 rounded-full border shadow-lg transition-colors ${
              leftOpen
                ? "bg-primary border-primary text-white"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            }`}
            aria-label={leftOpen ? "Close Dashboard" : "Open Dashboard"}
          >
            <LayoutDashboard className="w-5 h-5" />
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
            <Store className="w-5 h-5" />
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
          className="fixed inset-0 bg-black/30 z-[50] pointer-events-auto sm:hidden"
          onClick={() => {
            if (leftOpen) setLeftOpen(false)
            if (rightOpen) setRightOpen(false)
          }}
          aria-hidden
        />
      )}

      {/* +100 Scout Points toast */}
      {showPointsToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          +100 Scout Points!
        </div>
      )}

      {/* Command bar */}
      {/* Pre-alpha badge */}
      <div className="pointer-events-none fixed bottom-[5.5rem] left-4 z-20">
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
          Pre-Alpha
        </span>
      </div>

      <CommandBar
        savingsMode={savingsMode}
        activeTab={rightTab}
        userLocation={userLocation}
        onSearchResults={(results) => {
          setSearchResults(results)
          setRightTab("store")
          setRightOpen(true)
        }}
        onAddToList={handleAddToList}
        onTabChange={setRightTab}
        onPointsAwarded={() => setShowPointsToast(true)}
      />
    </main>
  )
}
