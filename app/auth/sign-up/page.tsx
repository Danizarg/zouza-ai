"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
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
        options: { data: { full_name: name } },
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
    router.push("/dashboard");
  }

  if (status === "confirm") {
    return (
      <AuthCard title="Check your inbox" subtitle="Confirm your email to finish signing up." footer={null}>
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
          <p className="text-sm text-ink-2">
            We sent a confirmation link to {email}.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle={isSupabaseConfigured() ? "Free to join — save homes, enquire, or start a listing." : "Demo mode — this creates a local session only."}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
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
