import Link from "next/link";

const links = [
  { href: "/rent", label: "Rent" },
  { href: "/buy", label: "Buy" },
  { href: "/rent-out", label: "Rent out" },
  { href: "/sell", label: "Sell" },
  { href: "/create-listing", label: "AI Listing Creator" },
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
          <span className="h-2 w-2 rounded-full bg-terra-600" aria-hidden />
          <span className="font-display text-lg font-semibold tracking-tight text-navy-950">
            Zouza.ai
          </span>
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
            © {new Date().getFullYear()} Zouza.ai. Zouza.ai is an independent
            concept and is not affiliated with Airbnb, Idealista, ThinkSpain,
            Zillow, Booking, or any other rental or property platform. Zouza.ai
            acts as a pure intermediary and does not provide legal advice,
            payment processing, escrow, deposit management, rent guarantees, or
            tax advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
