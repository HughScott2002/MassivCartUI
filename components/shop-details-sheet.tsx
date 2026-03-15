"use client";

import { useState } from "react";
import { Store, ShoppingBasket, Search, X, MapPin, ListPlus, Trash2, Navigation } from "lucide-react";
import type { SearchResult, SearchResultPrice, ListItem } from "@/lib/types";

interface ShopDetailsSheetProps {
  onClose?: () => void;
  results?: SearchResult[];
  listItems?: ListItem[];
  onAddToList?: (result: SearchResult, price: SearchResultPrice) => void;
  onRemoveFromList?: (item: ListItem) => void;
  onFlyTo?: (lng: number, lat: number) => void;
  activeTab?: "store" | "list";
  onTabChange?: (tab: "store" | "list") => void;
  onShowRoute?: () => void;
}

export function ShopDetailsSheet({ onClose, results = [], listItems = [], onAddToList, onRemoveFromList, onFlyTo, activeTab: activeTabProp, onTabChange, onShowRoute }: ShopDetailsSheetProps) {
  const [activeTabLocal, setActiveTabLocal] = useState<"store" | "list">("store");
  const activeTab = activeTabProp ?? activeTabLocal;
  const setActiveTab = (tab: "store" | "list") => {
    onTabChange ? onTabChange(tab) : setActiveTabLocal(tab);
  };

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-card backdrop-blur-md text-foreground shadow-xl overflow-hidden flex flex-col">
      {/* Tab switcher */}
      <div className="flex border-b border-black/10 dark:border-white/10 shrink-0">
        <button
          onClick={() => setActiveTab("store")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "store"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="w-4 h-4" />
          Store
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "list"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBasket className="w-4 h-4" />
          My List
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
      <div className="flex-1 overflow-y-auto max-h-[56vh]">
        {activeTab === "store" ? (
          results.length > 0 ? (
            <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
              {results.map((result) => {
                const cheapest = result.prices[0];
                const others = result.prices.slice(1, 4);
                return (
                  <div key={result.product_id} className="p-3">
                    <div
                      className="flex items-start justify-between gap-2 cursor-pointer group"
                      onClick={() => {
                        if (cheapest?.lng != null && cheapest?.lat != null) {
                          onFlyTo?.(cheapest.lng, cheapest.lat);
                        }
                      }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {result.canonical_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.category ?? result.unit_type ?? ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-primary">
                          J${result.cheapest_price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{result.cheapest_store}</span>
                          {cheapest?.distance_km != null && (
                            <span className="text-muted-foreground/60">
                              {cheapest.distance_km < 1
                                ? `${Math.round(cheapest.distance_km * 1000)}m`
                                : `${cheapest.distance_km.toFixed(1)}km`}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {result.prices.slice(0, 6).map((p) => (
                        <div
                          key={p.store_id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-black/5 dark:bg-white/5 px-2.5 py-1.5"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (p.lng != null && p.lat != null) onFlyTo?.(p.lng, p.lat);
                            }}
                            className="min-w-0 flex-1 flex items-center justify-between gap-2 text-left text-xs"
                          >
                            <span className="text-muted-foreground truncate">{p.store_name}</span>
                            <span className="font-medium text-foreground shrink-0">J${p.price.toFixed(2)}</span>
                          </button>
                          {onAddToList && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onAddToList(result, p); }}
                              className="shrink-0 flex items-center gap-1 rounded-lg border border-primary/50 bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                              aria-label={`Add ${result.canonical_name} from ${p.store_name} to list`}
                            >
                              <ListPlus className="h-3.5 w-3.5" /> Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center p-4">
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Search for products to see results here
              </p>
            </div>
          )
        ) : listItems.length > 0 ? (
          <div className="flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {listItems.map((item) => (
              <div key={`${item.product_id}-${item.store_id}`} className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{item.canonical_name}</p>
                  <p className="text-xs text-muted-foreground">{item.store_name} · J${item.price.toFixed(2)}</p>
                </div>
                {onRemoveFromList && (
                  <button
                    type="button"
                    onClick={() => onRemoveFromList(item)}
                    className="shrink-0 p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label={`Remove ${item.canonical_name} from list`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center p-4">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <ShoppingBasket className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Your list is empty</p>
            <p className="text-xs text-muted-foreground">
              Add items from search results using &quot;Add to list&quot;
            </p>
          </div>
        )}
      </div>

      {/* Show Route button — only in My List tab when 2+ stores have coords */}
      {activeTab === "list" && (() => {
        const storesWithCoords = new Set(
          listItems.filter(i => i.lat != null && i.lng != null).map(i => i.store_id)
        );
        if (storesWithCoords.size < 2) return null;
        return (
          <div className="shrink-0 border-t border-black/5 dark:border-white/5 p-3">
            <button
              type="button"
              onClick={onShowRoute}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <Navigation className="h-4 w-4" />
              Show Route ({storesWithCoords.size} stops)
            </button>
          </div>
        );
      })()}
    </div>
  );
}
