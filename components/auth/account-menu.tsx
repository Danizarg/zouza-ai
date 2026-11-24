"use client";

import { buttonClasses } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AccountState = { kind: "unknown" } | { kind: "out" } | { kind: "in"; name: string };

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || "Account";
}

/**
 * The header's account slot. Reads the session in the browser so marketing pages stay static
 * (a server read in the root layout would make every page dynamic), and follows sign-in and
 * sign-out events live. Until the first read resolves it keeps the slot's width and shows
 * nothing, so a signed-in visitor never sees "Sign in" flash.
 */
export function AccountMenu({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [state, setState] = useState<AccountState>(supabase ? { kind: "unknown" } : { kind: "out" });

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const apply = (user: { id: string; user_metadata?: Record<string, unknown> } | null) => {
      if (cancelled) return;
      if (!user) {
        setState({ kind: "out" });
        return;
      }
      const meta = user.user_metadata?.full_name;
      setState({ kind: "in", name: typeof meta === "string" && meta ? meta : "Account" });
    };

    supabase.auth.getUser().then(({ data }) => apply(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    onNavigate?.();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const mobile = variant === "mobile";
  const size = mobile ? "md" : "sm";

  if (state.kind === "unknown") {
    return <span aria-hidden className={cn("inline-block", mobile ? "h-11 flex-1" : "h-9 w-20")} />;
  }

  if (state.kind === "out") {
    return (
      <Link
        href="/auth/sign-in"
        onClick={onNavigate}
        className={buttonClasses("ghost", size, mobile ? "flex-1" : undefined)}
      >
        Sign in
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={buttonClasses("ghost", size, mobile ? "flex-1" : undefined)}
        title={state.name}
      >
        <UserIcon className="h-4 w-4" aria-hidden />
        <span className="max-w-[9rem] truncate">{firstName(state.name)}</span>
      </Link>
      <button
        type="button"
        onClick={signOut}
        className={buttonClasses("ghost", size, mobile ? "flex-1" : undefined)}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        {mobile ? "Sign out" : null}
      </button>
    </>
  );
}
