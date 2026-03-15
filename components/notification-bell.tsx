"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2.5 rounded-full bg-card border border-border hover:bg-muted transition-colors shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm text-foreground">Notifications</span>
            </div>
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          </div>
        </>
      )}
    </div>
  );
}
