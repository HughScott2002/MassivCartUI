"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { AuthModal } from "@/components/auth-modal";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  authReady: boolean; // true once initial session + is_admin have been resolved
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  showAuthModal: boolean;
  requireAuth: (pendingFn: () => void) => void;
  showTutorial: boolean;
  dismissTutorial: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const fetchIsAdmin = useCallback((userId: string) => {
    supabase
      .from("users")
      .select("is_admin")
      .eq("id", userId)
      .single()
      .then(({ data }) => setIsAdmin(data?.is_admin ?? false));
  }, []);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      if (existing?.user) {
        setSession(existing);
        supabase
          .from("users")
          .select("is_admin")
          .eq("id", existing.user.id)
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.is_admin ?? false);
            setAuthReady(true);
          });
      } else {
        setAuthReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          if (pendingAction.current) {
            const fn = pendingAction.current;
            pendingAction.current = null;
            setTimeout(fn, 0);
          }
          setShowAuthModal(false);
        }
        if (newSession?.user) {
          fetchIsAdmin(newSession.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchIsAdmin]);

  const requireAuth = useCallback((pendingFn: () => void) => {
    if (session) {
      pendingFn();
    } else {
      pendingAction.current = pendingFn;
      setShowAuthModal(true);
    }
  }, [session]);

  // Returns error message or null on success
  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return error?.message ?? null;
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // X button — cancel the pending action and close
  const handleModalDismiss = () => {
    pendingAction.current = null;
    setShowAuthModal(false);
  };

  const dismissTutorial = useCallback(() => setShowTutorial(false), []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isAdmin, authReady, signIn, signUp, signInWithGoogle, signOut, showAuthModal, requireAuth, showTutorial, dismissTutorial }}>
      {children}
      {showAuthModal && <AuthModal onClose={handleModalDismiss} onSignedUp={() => setShowTutorial(true)} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
