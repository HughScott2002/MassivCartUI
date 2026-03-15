"use client";

import { useTheme } from "next-themes";
import {
  Sun, Moon, LocateFixed, Menu, X, Bell,
  Fuel, GalleryHorizontalEnd, Package, Pill, ShoppingCart, Wrench, ChevronRight, ChevronLeft,
  User, LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { GridMenu } from "./grid-menu";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "@/lib/auth-context";
import { ProfilePopup } from "./profile-popup";

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
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
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

                  {/* Theme toggle — stays open (mounted check avoids hydration mismatch) */}
                  <button
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className={rowBtn}
                  >
                    {mounted && resolvedTheme === "dark"
                      ? <Sun className="w-4 h-4 shrink-0" />
                      : <Moon className="w-4 h-4 shrink-0" />}
                    {mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                  </button>

                  <div className="border-t border-border mt-1 pt-2">
                    {user ? (
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className={`${rowBtn} justify-center`}
                          onClick={() => { setMenuOpen(false); setProfilePopupOpen(true); }}
                        >
                          <User className="w-4 h-4 shrink-0" />
                          User profile
                        </button>
                        <button
                          type="button"
                          onClick={() => { signOut(); setMenuOpen(false); }}
                          className={`${rowBtn} justify-center text-destructive hover:bg-destructive/10`}
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Sign out
                        </button>
                      </div>
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
          suppressHydrationWarning
        >
          {mounted && resolvedTheme === "dark"
            ? <Sun className="w-4 h-4 text-gray-600 dark:text-foreground" />
            : <Moon className="w-4 h-4 text-gray-600 dark:text-foreground" />}
        </button>

        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-foreground font-semibold text-sm hover:bg-muted transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                {(user.user_metadata?.display_name as string)?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
              </span>
              <span className="max-w-[100px] truncate">
                {(user.user_metadata?.display_name as string) ?? user.email}
              </span>
            </button>
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full mt-2 py-1 min-w-[180px] bg-popover border border-border rounded-xl shadow-xl z-[9999] flex flex-col">
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); setProfilePopupOpen(true); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors w-full text-left"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    User profile
                  </button>
                  <button
                    type="button"
                    onClick={() => { signOut(); setUserMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => requireAuth(() => {})}
            className="px-4 py-2 bg-primary rounded-full text-white font-semibold text-sm border-2 border-white/20 hover:border-white/40 transition-colors"
          >
            SIGN UP
          </button>
        )}
      </div>

      <ProfilePopup open={profilePopupOpen} onClose={() => setProfilePopupOpen(false)} />
    </>
  );
}
