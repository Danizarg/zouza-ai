"use client";

import { cn } from "@/lib/utils";
import {
  Building2,
  Heart,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "My listings", icon: Building2 },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard#saved", label: "Saved homes", icon: Heart },
  { href: "/dashboard#verification", label: "Verification", icon: ShieldCheck },
  { href: "/dashboard#profile", label: "Profile", icon: User },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line bg-white px-4 py-3 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-56 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:p-4">
      {links.map((link) => {
        const active = pathname === link.href.split("#")[0] && !link.href.includes("#");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-parchment text-navy-900" : "text-navy-600 hover:bg-parchment hover:text-navy-900",
            )}
          >
            <link.icon className="h-4 w-4" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
