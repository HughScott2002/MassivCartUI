"use client";

import { useState } from "react";
import { Store, ShoppingBasket, Search, X } from "lucide-react";

export function ShopDetailsSheet({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<"store" | "list">("store");

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
      <div className="flex-1 p-4">
        {activeTab === "store" ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Search for products to see results here
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <ShoppingBasket className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Your list is empty</p>
            <p className="text-xs text-muted-foreground">
              Add items using the command bar below
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
