"use client";

import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/rent", label: "Rent" },
  { href: "/buy", label: "Buy" },
  { href: "/rent-out", label: "Rent out" },
  { href: "/sell", label: "Sell" },
  { href: "/create-listing", label: "AI Listing Creator" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ivory/95 backdrop-blur-md">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Zouza.ai home">
          <span className="h-2 w-2 rounded-full bg-terra-600" aria-hidden />
          <span className="font-display text-lg font-semibold tracking-tight text-navy-950">
            Zouza.ai
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                pathname === link.href
                  ? "font-medium text-navy-950"
                  : "text-navy-600 hover:text-navy-950",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/login" className="text-sm font-medium text-navy-700 hover:text-navy-950">
            Log in
          </Link>
          <Link href="/create-listing" className={buttonClasses("primary", "sm")}>
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-900 hover:bg-parchment lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-ivory lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-base",
                  pathname === link.href
                    ? "bg-parchment font-medium text-navy-950"
                    : "text-navy-700",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className={buttonClasses("outline", "md", "flex-1")}>
                Log in
              </Link>
              <Link href="/create-listing" onClick={() => setOpen(false)} className={buttonClasses("primary", "md", "flex-1")}>
                Get started
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
