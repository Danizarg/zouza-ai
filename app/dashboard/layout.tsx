import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// isSupabaseConfigured() short-circuits before any dynamic API (cookies())
// is touched, so Next's static analysis can't tell this layout needs a
// per-request auth check — without this, it gets prerendered once at build
// time (when Supabase is never configured) and the redirect would never run
// again in production. Force it dynamic so the check always executes.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Mock mode (no Supabase configured) stays open for demoability. Once
  // Supabase is configured, a real session is required — auth pages simulate
  // success and redirect here in mock mode only, so this never locks out the
  // demo flow.
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/auth/sign-in");
    }
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
