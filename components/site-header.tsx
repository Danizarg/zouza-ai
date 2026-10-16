"use client";

import { ZBadge, ZMark } from "@/components/brand/z-mark";
import { buttonClasses } from "@/components/ui/button";
import { openSuziPanel } from "@/lib/suzi-events";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

/* Exactly three doors in the top bar (design system v2). Each label says
   what happens next; the mobile menu adds the browsing/support routes. */
const NAV_LINKS = [
  { href: "/ai-search", label: "Find a home" },
  { href: "/list-with-ai", label: "List your home" },
  { href: "/pricing", label: "Pricing" },
] as const;

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { href: "/explore", label: "Explore" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/contact", label: "Contact" },
] as const;

const MOBILE_MENU_ID = "site-mobile-menu";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/95 backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 rounded-lg" aria-label="Zouza home">
          <ZBadge />
          <span className="text-lg font-semibold tracking-tight text-ink">Zouza</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors",
                  active ? "font-medium text-ink" : "text-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/auth/sign-in" className={buttonClasses("ghost", "sm")}>
            Sign in
          </Link>
          <button type="button" onClick={openSuziPanel} className={buttonClasses("primary", "sm")}>
            <ZMark className="h-4 w-4" />
            Talk to Suzi
          </button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-paper-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={MOBILE_MENU_ID}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <div
          id={MOBILE_MENU_ID}
          className="border-t border-border bg-paper lg:hidden"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeMenu();
              toggleRef.current?.focus();
            }
          }}
        >
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
            {MOBILE_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center rounded-lg px-3 text-base transition-colors",
                    active ? "bg-paper-2 font-medium text-ink" : "text-ink-2 hover:bg-paper-2",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 flex gap-2">
              <Link href="/auth/sign-in" onClick={closeMenu} className={buttonClasses("ghost", "md", "flex-1")}>
                Sign in
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  openSuziPanel();
                }}
                className={buttonClasses("primary", "md", "flex-1")}
              >
                <ZMark className="h-4 w-4" />
                Talk to Suzi
              </button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
