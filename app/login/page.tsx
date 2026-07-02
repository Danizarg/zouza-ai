"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
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
    router.push("/dashboard");
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle={isSupabaseConfigured() ? "Log in to your Aurora Homes account." : "Demo mode — any email/password logs you in."}
      footer={
        <>
          New to Aurora?{" "}
          <Link href="/signup" className="font-medium text-terra-600 hover:text-terra-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p className="text-sm text-terra-700">{error}</p> : null}
        <div className="flex items-center justify-between text-sm">
          <span />
          <Link href="/forgot-password" className="text-navy-500 hover:text-navy-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}
