"use client"

import { useTheme } from "next-themes"
import {
  Sun,
  Moon,
  LocateFixed,
  Menu,
  X,
  Bell,
  User,
  LogOut,
} from "lucide-react"
import { useState, useEffect } from "react"
import { GridMenu } from "./grid-menu"
import { NotificationBell } from "./notification-bell"
import { useAuth } from "@/lib/auth-context"
import { ProfilePopup } from "./profile-popup"
import { cn } from "@/lib/utils"

const iconBtn =
  "p-2.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm hover:bg-white dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-border shadow-sm"

const rowBtn =
  "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground w-full text-left"


export function Header({
  locateRef,
  activeCategory = "all",
  onCategoryChange,
}: {
  locateRef?: React.RefObject<(() => void) | null>
  activeCategory?: string
  onCategoryChange?: (category: string) => void
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [profilePopupOpen, setProfilePopupOpen] = useState(false)
  const { user, requireAuth, signOut } = useAuth()

  return (
    <>
      {/* ── Desktop: logo top-left ── */}
      <div className="fixed top-4 left-4 z-20 hidden items-center gap-2 rounded-full bg-primary px-4 py-2 sm:flex">
        <span className="text-lg font-bold tracking-tight text-white">
          MASSIV Cart{" "}
          <span className="rounded-full bg-white px-1 text-primary">AI</span>
        </span>
      </div>

      {/* ── Mobile: logo left, burger circle right ── */}
      <div className="sm:hidden">
        {/* Logo pill — left */}
        <div className="fixed top-4 left-4 z-30 flex items-center rounded-full bg-primary px-4 py-2 shadow-lg">
          <span className="text-base font-bold tracking-tight text-white">
            MASSIV Cart{" "}
            <span className="rounded-full bg-white px-1 text-primary">AI</span>
          </span>
        </div>

        {/* Categories button — left of location */}
        <div className="fixed top-4 right-28 z-30">
          <GridMenu selectedType={activeCategory} onSelect={onCategoryChange} />
        </div>

        {/* Location button — left of burger */}
        <button
          onClick={() => locateRef?.current?.()}
          className="fixed top-4 right-16 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground shadow-lg transition-colors hover:bg-muted"
          aria-label="My location"
        >
          <LocateFixed className="h-4 w-4" />
        </button>

        {/* Burger circle — right */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="fixed top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary/90"
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile dropdown — anchored top-right below burger */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="fixed top-16 right-4 z-50 flex min-w-55 flex-col items-stretch gap-1 rounded-2xl border border-border bg-popover p-3 shadow-xl">
              <button className={rowBtn}>
                <Bell className="h-4 w-4 shrink-0" />
                Notifications
              </button>

              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className={rowBtn}
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4 shrink-0" />
                ) : (
                  <Moon className="h-4 w-4 shrink-0" />
                )}
                {mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </button>

              <div className="mt-1 border-t border-border pt-2">
                {user ? (
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      className={rowBtn}
                      onClick={() => {
                        setMenuOpen(false)
                        setProfilePopupOpen(true)
                      }}
                    >
                      <User className="h-4 w-4 shrink-0 text-primary" />
                      User profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        signOut()
                        setMenuOpen(false)
                      }}
                      className={cn(rowBtn, "text-destructive hover:bg-destructive/10")}
                    >
                      <LogOut className="h-4 w-4 shrink-0 text-destructive" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => requireAuth(() => {})}
                    className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    SIGN UP
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Desktop: action buttons top-right ── */}
      <div className="fixed top-4 right-4 z-30 hidden items-center gap-2 sm:flex sm:gap-3">
        <button onClick={() => locateRef?.current?.()} className={iconBtn} title="Go to my location">
          <LocateFixed className="h-4 w-4 text-gray-600 dark:text-foreground" />
        </button>

        <GridMenu selectedType={activeCategory} onSelect={onCategoryChange} />

        <NotificationBell />

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={iconBtn}
          title="Toggle theme"
          suppressHydrationWarning
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4 text-gray-600 dark:text-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-gray-600 dark:text-foreground" />
          )}
        </button>

        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {(
                  user.user_metadata?.display_name as string
                )?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
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
                <div className="absolute top-full right-0 z-[9999] mt-2 flex min-w-[180px] flex-col rounded-xl border border-border bg-popover py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      setProfilePopupOpen(true)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    User profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      signOut()
                      setUserMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => requireAuth(() => {})}
            className="rounded-full border-2 border-white/20 bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/40"
          >
            SIGN UP
          </button>
        )}
      </div>

      <ProfilePopup
        open={profilePopupOpen}
        onClose={() => setProfilePopupOpen(false)}
      />
    </>
  )
}
