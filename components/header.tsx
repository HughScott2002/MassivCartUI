"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, LocateFixed } from "lucide-react";
import { GridMenu } from "./grid-menu";
import { NotificationBell } from "./notification-bell";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      {/* Logo - Top Left */}
      <div className="fixed top-4 left-4 z-20 bg-primary px-4 py-2 rounded-full">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-tight">
            MASSIV Cart{" "}
            <span className="text-primary bg-white px-1 rounded-full">AI</span>
          </span>
        </div>
      </div>

      {/* User actions - Top Right */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2 sm:gap-3">
        {/* Locate — flies map to user position (wired in Phase 2) */}
        <button
          className="p-2.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors border border-border"
          title="Go to my location"
        >
          <LocateFixed className="w-4 h-4 text-foreground" />
        </button>

        {/* Store type filter */}
        <GridMenu />

        {/* Notifications */}
        <NotificationBell />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors border border-border"
          title="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4 text-foreground" />
          ) : (
            <Moon className="w-4 h-4 text-foreground" />
          )}
        </button>

        <button className="px-4 py-2 bg-primary rounded-full text-white font-semibold text-sm border-2 border-white/20 hover:border-white/40 transition-colors">
          SIGN UP
        </button>
      </div>
    </>
  );
}
