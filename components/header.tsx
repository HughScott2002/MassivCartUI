"use client";

import { useTheme } from "next-themes";
import {
  Sun, Moon, LocateFixed, Menu, X, Bell,
  Fuel, GalleryHorizontalEnd, Package, Pill, ShoppingCart, Wrench, ChevronRight, ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { GridMenu } from "./grid-menu";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "@/lib/auth-context";

const iconBtn =
  "p-2.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm hover:bg-white dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-border shadow-sm";

const rowBtn =
  "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground w-full text-left";

const storeTypes = [
  { id: "all",       label: "All",       icon: GalleryHorizontalEnd, color: "text-lime-500" },
  { id: "grocery",   label: "Grocery",   icon: ShoppingCart,         color: "text-emerald-500" },
  { id: "hardware",  label: "Hardware",  icon: Wrench,               color: "text-orange-500" },
  { id: "wholesale", label: "Wholesale", icon: Package,              color: "text-blue-500" },
  { id: "pharmacy",  label: "Pharmacy",  icon: Pill,                 color: "text-pink-500" },
  { id: "fuel",      label: "Fuel",      icon: Fuel,                 color: "text-amber-500" },
];

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user, requireAuth, signOut } = useAuth();

  return (
    <>
      {/* ── Desktop: logo top-left ── */}
      <div className="hidden sm:flex fixed top-4 left-4 z-20 bg-primary px-4 py-2 rounded-full items-center gap-2">
        <span className="text-white font-bold text-lg tracking-tight">
          MASSIV Cart{" "}
          <span className="text-primary bg-white px-1 rounded-full">AI</span>
        </span>
      </div>

      {/* ── Mobile: centered notch-style logo pill ── */}
      <div className="sm:hidden fixed top-4 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-2 bg-primary px-4 py-2 rounded-full shadow-lg">
          <span className="text-white font-bold text-base tracking-tight">
            MASSIV Cart{" "}
            <span className="text-primary bg-white px-1 rounded-full">AI</span>
          </span>
          <button
            onClick={() => { setMenuOpen((v) => !v); setShowCategories(false); }}
            className="ml-1 text-white/80 hover:text-white transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setMenuOpen(false); setShowCategories(false); }} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-stretch gap-1 bg-popover border border-border rounded-2xl shadow-xl p-3 z-50 min-w-[220px]">

              {!showCategories ? (
                <>
                  <button className={rowBtn}>
                    <LocateFixed className="w-4 h-4 shrink-0" />
                    My location
                  </button>

                  <button className={rowBtn}>
                    <Bell className="w-4 h-4 shrink-0" />
                    Notifications
                  </button>

                  {/* Store Categories — opens sub-panel */}
                  <button
                    className={rowBtn}
                    onClick={() => setShowCategories(true)}
                  >
                    <GalleryHorizontalEnd className="w-4 h-4 shrink-0" />
                    <span className="flex-1">Store Categories</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {/* Theme toggle — stays open */}
                  <button
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className={rowBtn}
                  >
                    {resolvedTheme === "dark"
                      ? <Sun className="w-4 h-4 shrink-0" />
                      : <Moon className="w-4 h-4 shrink-0" />}
                    {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                  </button>

                  <div className="border-t border-border mt-1 pt-2">
                    {user ? (
                      <button
                        onClick={signOut}
                        className="w-full px-4 py-2 bg-muted rounded-full text-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                          {(user.user_metadata?.display_name as string)?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
                        </span>
                        Sign out
                      </button>
                    ) : (
                      <button
                        onClick={() => requireAuth(() => {})}
                        className="w-full px-4 py-2 bg-primary rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                      >
                        SIGN UP
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Back header */}
                  <button
                    className={rowBtn}
                    onClick={() => setShowCategories(false)}
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span className="flex-1 font-semibold">Store Categories</span>
                  </button>

                  <div className="border-t border-border my-1" />

                  {storeTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedCategory === type.id;
                    return (
                      <button
                        key={type.id}
                        className={`${rowBtn} ${isSelected ? "bg-muted" : ""}`}
                        onClick={() => { setSelectedCategory(type.id); setShowCategories(false); }}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${type.color}`} />
                        <span className="flex-1">{type.label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Desktop: action buttons top-right ── */}
      <div className="hidden sm:flex fixed top-4 right-4 z-30 items-center gap-2 sm:gap-3">
        <button className={iconBtn} title="Go to my location">
          <LocateFixed className="w-4 h-4 text-gray-600 dark:text-foreground" />
        </button>

        <GridMenu />

        <NotificationBell />

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={iconBtn}
          title="Toggle theme"
        >
          {resolvedTheme === "dark"
            ? <Sun className="w-4 h-4 text-gray-600 dark:text-foreground" />
            : <Moon className="w-4 h-4 text-gray-600 dark:text-foreground" />}
        </button>

        {user ? (
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-foreground font-semibold text-sm hover:bg-muted transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
              {(user.user_metadata?.display_name as string)?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
            </span>
            <span className="max-w-[100px] truncate">
              {(user.user_metadata?.display_name as string) ?? user.email}
            </span>
          </button>
        ) : (
          <button
            onClick={() => requireAuth(() => {})}
            className="px-4 py-2 bg-primary rounded-full text-white font-semibold text-sm border-2 border-white/20 hover:border-white/40 transition-colors"
          >
            SIGN UP
          </button>
        )}
      </div>
    </>
  );
}
