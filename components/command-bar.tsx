"use client";

import { Sparkles, Camera, Send } from "lucide-react";

export function CommandBar() {
  return (
    <div className="fixed bottom-6 inset-x-4 z-30">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-card backdrop-blur-md shadow-xl">
          {/* Intent icon */}
          <Sparkles className="w-5 h-5 text-primary shrink-0" />

          {/* Text input */}
          <input
            type="text"
            placeholder="Search for products, prices, stores..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          {/* Camera button */}
          <button className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Camera className="w-5 h-5" />
          </button>

          {/* Send button */}
          <button className="p-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
