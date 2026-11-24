"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Where a password-reset link lands once `/auth/callback` has turned it into a session. */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<
    "checking" | "ready" | "no-session" | "saving" | "error"
  >(isSupabaseConfigured() ? "checking" : "ready");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setStatus(data.user ? "ready" : "no-session");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("The two passwords don't match.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        setStatus("error");
        return;
      }
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (status === "no-session") {
    return (
      <AuthCard
        title="Reset link needed"
        subtitle="Open the link from your reset email in this browser, then choose a new password here."
        footer={
          <Link
            href="/auth/forgot-password"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Send a new reset link
          </Link>
        }
      >
        <p className="text-sm text-muted">The link may have expired or already been used.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle={isSupabaseConfigured() ? "At least 8 characters." : "Demo mode — nothing is saved."}
      footer={
        <Link href="/auth/sign-in" className="font-medium text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="confirm">Repeat it</Label>
          <Input
            id="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {status === "error" ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={status === "checking" || status === "saving"}
          className="w-full"
        >
          {status === "saving" ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </AuthCard>
  );
}
