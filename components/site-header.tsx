"use client";

import { buttonClasses } from "@/components/ui/button";
import { openSuziPanel } from "@/lib/suzi-events";
import { cn } from "@/lib/utils";
import { Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/ai-search", label: "AI Search" },
  { href: "/list-with-ai", label: "List with Suzi" },
  { href: "/explore", label: "Explore Homes" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
] as const;

const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/ai-search", label: "AI Search" },
  { href: "/explore", label: "Explore" },
  { href: "/list-with-ai", label: "List with Suzi" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ivory/95 backdrop-blur-md">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Zouza home">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-950 text-gold-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-navy-950">
            Zouza
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
          <Link href="/auth/sign-in" className="text-sm font-medium text-navy-700 hover:text-navy-950">
            Sign in
          </Link>
          <button type="button" onClick={openSuziPanel} className={buttonClasses("primary", "sm", "glow-cta")}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Talk to Suzi
          </button>
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
            {MOBILE_LINKS.map((link) => (
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
              <Link href="/auth/sign-in" onClick={() => setOpen(false)} className={buttonClasses("outline", "md", "flex-1")}>
                Sign in
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openSuziPanel();
                }}
                className={buttonClasses("primary", "md", "flex-1")}
              >
                Talk to Suzi
              </button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
