import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { requireViewer } from "@/lib/auth/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The proxy already turns signed-out visitors away; this is the authoritative check.
  await requireViewer("/dashboard");
  return (
    <div className="flex flex-col lg:flex-row">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
