"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function safeNextPath(raw: string | null, fallback = "/dashboard"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  return raw;
}

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "confirm">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          // The confirmation link comes back through /auth/callback, which exchanges it for a
          // session and continues to `next`. (Must be on the Supabase redirect allow list;
          // otherwise the link lands on the Site URL and the proxy forwards it there.)
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setError(error.message);
        setStatus("error");
        return;
      }
      if (!data.session) {
        setStatus("confirm");
        return;
      }
    }
    router.push(next);
    router.refresh();
  }

  if (status === "confirm") {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle="Confirm your email to finish signing up."
        footer={null}
      >
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
          <p className="text-sm text-ink-2">
            We sent a confirmation link to {email}. Open it in this browser and you&rsquo;ll be
            signed in straight away.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle={
        isSupabaseConfigured()
          ? "Free to join — save homes, enquire, or start a listing."
          : "Demo mode — this creates a local session only."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/auth/sign-in?next=${encodeURIComponent(next)}`}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          <Label htmlFor="password" hint="at least 8 characters">
            Password
          </Label>
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
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
