"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
}

export function ProfilePopup({ open, onClose }: ProfilePopupProps) {
  const { user } = useAuth();
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user?.id) return;
    supabase
      .from("users")
      .select("created_at")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setCreatedAt(data?.created_at ?? null);
      });
  }, [open, user?.id]);

  if (!open || !user) return null;

  const joinDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const content = (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        role="presentation"
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(400px,95vw)] flex flex-col bg-card rounded-2xl shadow-2xl z-[9999] border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
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
        <div className="p-5 space-y-4">
          {joinDate && (
            <p className="text-sm text-muted-foreground">Member since {joinDate}</p>
          )}
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
      </div>
    </>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
