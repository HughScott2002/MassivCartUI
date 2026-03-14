"use client";

import {
  Fuel,
  GalleryHorizontalEnd,
  Package,
  Pill,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { useState } from "react";

const storeTypes = [
  { id: "all", label: "All", icon: GalleryHorizontalEnd, color: "text-lime-500" },
  { id: "grocery", label: "Grocery", icon: ShoppingCart, color: "text-emerald-500" },
  { id: "hardware", label: "Hardware", icon: Wrench, color: "text-orange-500" },
  { id: "wholesale", label: "Wholesale", icon: Package, color: "text-blue-500" },
  { id: "pharmacy", label: "Pharmacy", icon: Pill, color: "text-pink-500" },
  { id: "fuel", label: "Fuel", icon: Fuel, color: "text-amber-500" },
];

interface GridMenuProps {
  selectedType?: string;
  onSelect?: (id: string) => void;
}

export function GridMenu({ selectedType = "all", onSelect }: GridMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors border border-border"
        title="Filter by store type"
      >
        <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-foreground rounded-full opacity-70" />
          ))}
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50">
            {storeTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    onSelect?.(type.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${
                    isSelected ? "bg-muted" : ""
                  }`}
                >
                  <Icon className={`w-5 h-5 ${type.color}`} />
                  <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
            <div className="px-4 py-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground">More coming soon…</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
