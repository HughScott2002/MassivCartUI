"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, User, Flame, Award, Shield, Receipt } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
}

// Demo data for charts
const monthlySpending = [
  { month: "Oct", spent: 12400 },
  { month: "Nov", spent: 15800 },
  { month: "Dec", spent: 18900 },
  { month: "Jan", spent: 14200 },
  { month: "Feb", spent: 16700 },
  { month: "Mar", spent: 15200 },
];

const categorySpending = [
  { category: "Grocery", spent: 4200, color: "bg-emerald-500" },
  { category: "Hardware", spent: 2800, color: "bg-orange-500" },
  { category: "Pharmacy", spent: 1500, color: "bg-pink-500" },
  { category: "Fuel", spent: 2100, color: "bg-amber-500" },
  { category: "Other", spent: 1100, color: "bg-slate-400" },
];

const totalCategory = categorySpending.reduce((a, b) => a + b.spent, 0);
const maxMonthly = Math.max(...monthlySpending.map((m) => m.spent));

export function ProfilePopup({ open, onClose }: ProfilePopupProps) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<{
    created_at: string | null;
    points: number | null;
    tier: string | null;
    streak_days: number | null;
  } | null>(null);

  useEffect(() => {
    if (!open || !user?.id) return;
    supabase
      .from("users")
      .select("created_at, points, tier, streak_days")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setUserData(data ? {
          created_at: data.created_at ?? null,
          points: data.points ?? 0,
          tier: data.tier ?? null,
          streak_days: data.streak_days ?? 0,
        } : null);
      });
  }, [open, user?.id]);

  if (!open || !user) return null;

  const joinDate = userData?.created_at
    ? new Date(userData.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const points = userData?.points ?? 0;
  const tier = userData?.tier ?? "Shopper";
  const streak = userData?.streak_days ?? 0;

  const content = (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        role="presentation"
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,95vw)] max-h-[min(90vh,640px)] flex flex-col bg-card rounded-2xl shadow-2xl z-[9999] border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-foreground" />
            <h2 className="text-base font-semibold text-foreground">User profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0">
          {joinDate && (
            <p className="text-sm text-muted-foreground">Member since {joinDate}</p>
          )}

          {/* Stats row: streak, points, tier */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-muted/50 p-3 text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-lg font-bold text-foreground">{streak}</p>
              <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">Streak days</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-3 text-center">
              <Award className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold text-foreground">{points}</p>
              <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">Points</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-3 text-center">
              <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-sm font-bold text-foreground truncate" title={tier}>{tier}</p>
              <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">Tier</p>
            </div>
          </div>

          {/* Profile fields */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Display name</p>
              <p className="font-medium text-foreground">
                {(user.user_metadata?.display_name as string) ?? "—"}
              </p>
            </div>
          </div>

          {/* Monthly spending graph */}
          <div>
            <p className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5" />
              Monthly spending
            </p>
            <div className="flex items-end gap-2 h-20">
              {monthlySpending.map((m) => {
                const heightPct = maxMonthly > 0 ? (m.spent / maxMonthly) * 100 : 0;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[0.6rem] text-muted-foreground">J${(m.spent / 1000).toFixed(1)}k</span>
                    <div
                      style={{ height: `${Math.max(heightPct, 8)}%` }}
                      className="w-full rounded-t-md bg-primary/80 min-h-[6px] transition-all duration-500 ease-out"
                    />
                    <span className="text-[0.65rem] text-muted-foreground">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div>
            <p className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Spending by category
            </p>
            <div className="space-y-2">
              {categorySpending.map((c) => {
                const pct = totalCategory > 0 ? (c.spent / totalCategory) * 100 : 0;
                return (
                  <div key={c.category} className="flex items-center gap-2">
                    <span className="text-[0.7rem] w-16 text-foreground shrink-0">{c.category}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${c.color} transition-all duration-500 ease-out`}
                      />
                    </div>
                    <span className="text-[0.7rem] text-muted-foreground shrink-0">J${c.spent.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
