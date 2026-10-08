import { ZBadge } from "@/components/brand/z-mark";
import Link from "next/link";

/* Row 1: brand + the site's doors. Row 2: legal microtext + the
   intermediary / non-affiliation sentence. Nothing else lives here. */
const SITE_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/explore", label: "Explore" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/pro", label: "Pro" },
] as const;

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
] as const;

/* Every footer link keeps a 44px-tall hit box (touch target) without
   adding visible chrome; the row paddings stay slim. */
const LINK_CLASSES = "inline-flex min-h-11 items-center text-muted transition-colors hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-2">
            <ZBadge />
            <span className="text-lg font-semibold tracking-tight text-ink">Zouza</span>
          </span>
          <span className="text-xs text-muted">Powered by AI. Guided by Suzi.</span>
        </div>
        <nav className="flex flex-wrap gap-x-5 text-sm" aria-label="Footer">
          {SITE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK_CLASSES}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-y-1 py-2 text-xs lg:flex-row lg:items-center lg:justify-between lg:gap-x-8">
          <nav className="flex flex-wrap gap-x-5" aria-label="Legal">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={LINK_CLASSES}>
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="max-w-3xl pb-2 leading-relaxed text-muted lg:pb-0 lg:text-right">
            © {new Date().getFullYear()} Zouza. Zouza is an independent concept and is not
            affiliated with any real estate or rental platform. Zouza acts as a pure
            intermediary and does not provide legal advice, payment processing, escrow,
            deposit management, rent guarantees, or tax advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
