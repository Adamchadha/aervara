"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(
    authError === "auth" ? "Could not complete sign-in. Try again." : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Check your email to confirm your account, then sign in.",
    );
    setLoading(false);
    setMode("signin");
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {mode === "signin"
            ? "Access your property intelligence workspace."
            : "Start tracking zoning and FAR opportunity."}
        </p>
      </div>

      <div className="mb-6 flex rounded-md border border-neutral-200 p-0.5">
        <button
          type="button"
          className={cn(
            "flex-1 rounded-sm py-2 text-sm font-medium transition-colors",
            mode === "signin"
              ? "bg-neutral-950 text-white"
              : "text-neutral-600 hover:text-neutral-950",
          )}
          onClick={() => {
            setMode("signin");
            setMessage(null);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 rounded-sm py-2 text-sm font-medium transition-colors",
            mode === "signup"
              ? "bg-neutral-950 text-white"
              : "text-neutral-600 hover:text-neutral-950",
          )}
          onClick={() => {
            setMode("signup");
            setMessage(null);
          }}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {message ? (
          <p
            className={cn(
              "text-sm",
              message.startsWith("Check your email")
                ? "text-neutral-600"
                : "text-red-600",
            )}
          >
            {message}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        <Link href="/" className="text-neutral-950 underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
