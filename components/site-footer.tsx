import { Sparkles } from "lucide-react";
import Link from "next/link";

const columns = [
  {
    title: "Marketplace",
    links: [
      { href: "/rent", label: "Rent a home" },
      { href: "/buy", label: "Buy a home" },
      { href: "/rent-out", label: "Rent out your property" },
      { href: "/sell", label: "Sell your property" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/create-listing", label: "AI Listing Creator" },
      { href: "/pricing", label: "Pricing & fees" },
      { href: "/trust", label: "Trust & verification" },
      { href: "/about", label: "About Zouza" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/legal/terms", label: "Terms of use" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/disclaimer", label: "Disclaimer" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-parchment">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-gold-300">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-display text-lg font-semibold text-navy-900">
              Zouza.ai
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-600">
            Professional property marketing, powered by AI. Verified homes,
            transparent prices, direct owners. Spain first — global next.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="font-sans text-sm font-semibold text-navy-900">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-600 transition-colors hover:text-navy-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page py-6">
          <p className="text-xs leading-relaxed text-navy-500">
            © {new Date().getFullYear()} Zouza.ai. Zouza.ai is an independent
            concept and is not affiliated with Airbnb, Idealista, ThinkSpain, Zillow,
            Booking, or any other rental or property platform. Zouza.ai acts as a
            pure intermediary and does not provide legal advice, payment processing,
            escrow, deposit management, rent guarantees, or tax advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
