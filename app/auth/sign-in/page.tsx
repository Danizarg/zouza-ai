"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/** Only same-site paths may be used as the after-sign-in destination. */
function safeNextPath(raw: string | null, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  return raw;
}

const LINK_ERRORS: Record<string, string> = {
  link: "That link has expired or was already used. Sign in, or request a new one below.",
  missing: "That link was incomplete. Sign in, or request a new one below.",
};

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const linkError = LINK_ERRORS[params.get("error") ?? ""] ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setStatus("error");
        return;
      }
    }
    router.push(next);
    // Server Components (the dashboard) read the session from cookies: re-render them.
    router.refresh();
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle={
        isSupabaseConfigured()
          ? "Sign in to your Zouza account."
          : "Demo mode — any email and password works."
      }
      footer={
        <>
          New to Zouza?{" "}
          <Link
            href={`/auth/sign-up?next=${encodeURIComponent(next)}`}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Create an account
          </Link>
        </>
      }
    >
      {linkError ? (
        <p
          role="status"
          className="mb-4 rounded-xl border border-border bg-paper-2 p-3 text-sm text-ink-2"
        >
          {linkError}
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="mb-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {status === "error" ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function SignInPage() {
  // useSearchParams needs a Suspense boundary for the static shell.
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
