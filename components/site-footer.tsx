import { Sparkles } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/ai-search", label: "AI Search" },
  { href: "/list-with-ai", label: "List with Suzi" },
  { href: "/explore", label: "Explore Homes" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page flex flex-wrap items-baseline justify-between gap-6 py-10">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-950 text-gold-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-navy-950">
            Zouza
          </span>
          <span className="ml-1 hidden text-xs text-navy-400 sm:inline">Powered by AI. Guided by Suzi.</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-600" aria-label="Footer">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-navy-950">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-page py-5">
          <p className="text-xs leading-relaxed text-navy-400">
            © {new Date().getFullYear()} Zouza. Zouza is an independent
            concept and is not affiliated with Idealista, Fotocasa,
            ThinkSpain, Airbnb, Vrbo, Zillow, Booking, or any other real
            estate or rental platform. Zouza acts as a pure intermediary and
            does not provide legal advice, payment processing, escrow,
            deposit management, rent guarantees, or tax advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
