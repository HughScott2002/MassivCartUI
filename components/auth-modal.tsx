"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { X } from "lucide-react";

const PASSWORD_MIN_LENGTH = 12;

function validatePassword(value: string): string[] {
  const validationErrors: string[] = [];
  if (value.length > 0 && value.length < PASSWORD_MIN_LENGTH) {
    validationErrors.push("Must be at least 12 characters");
  }
  if (value.length > 0 && !/[A-Z]/.test(value)) {
    validationErrors.push("Must include an uppercase letter");
  }
  if (value.length > 0 && !/[a-z]/.test(value)) {
    validationErrors.push("Must include a lowercase letter");
  }
  if (value.length > 0 && !/\d/.test(value)) {
    validationErrors.push("Must include a number");
  }
  if (value.length > 0 && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    validationErrors.push("Must include a special character");
  }
  if (/\s/.test(value)) {
    validationErrors.push("Password cannot contain spaces");
  }
  return validationErrors;
}

function isPasswordValid(value: string): boolean {
  return (
    value.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(value) &&
    !/\s/.test(value)
  );
}

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setPasswordErrors(validatePassword(value));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "signup" && !isPasswordValid(password)) return;
    setLoading(true);

    const err =
      mode === "signup"
        ? await signUp(email, password, displayName)
        : await signIn(email, password);

    setLoading(false);

    if (err) {
      setError(err);
    }
  };

  const passwordValid = mode === "signin" || isPasswordValid(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-card text-foreground rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-1">
          {mode === "signup" ? "Create account" : "Sign in"}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          {mode === "signup"
            ? "Join MASSIV Cart and start saving."
            : "Welcome back."}
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors mb-4"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="border border-border bg-background rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-border bg-background rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              minLength={mode === "signup" ? PASSWORD_MIN_LENGTH : 1}
              className="border border-border bg-background rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 w-full"
            />
            {mode === "signup" && passwordErrors.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {passwordErrors.map((msg) => (
                  <li key={msg} className="text-xs text-amber-600 dark:text-amber-500">
                    • {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !passwordValid}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-60"
          >
            {loading ? "..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === "signup" ? "Already have an account?" : "No account yet?"}{" "}
          <button
            onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); setPasswordErrors([]); }}
            className="text-primary font-semibold hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
