"use client";

import { useState } from "react";
import { Sparkles, Plus, Send } from "lucide-react";

interface CommandBarProps {
  onScanReceipt?: () => void;
}

export function CommandBar({ onScanReceipt }: CommandBarProps) {
  const [inputValue, setInputValue] = useState("");
  const showScanPill = inputValue.trim() === "";

  return (
    <div className="fixed bottom-6 inset-x-4 z-30">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-card backdrop-blur-md shadow-xl">
          {/* Intent icon */}
          <Sparkles className="w-5 h-5 text-primary shrink-0" />

          {/* Text input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for products, prices, stores..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          {showScanPill ? (
            /* Scan Receipt Pill - Major Highlight */
            <button
              type="button"
              onClick={onScanReceipt}
              className="
                group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-xl
                bg-green-600 px-4 py-2.5 text-sm font-medium text-white
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:bg-green-500 hover:shadow-xl hover:shadow-green-600/30
                active:scale-[0.98]
              "
            >
              <span className="relative">Scan Receipt</span>
              <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            </button>
          ) : (
            /* Send button - shown when user has typed */
            <button className="p-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
