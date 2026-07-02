import { LegalPage, LegalSection } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="2 July 2026">
      <LegalSection title="Independent concept">
        <p>
          Aurora Homes is an independent concept and is not affiliated with,
          endorsed by, sponsored by, or otherwise connected to Airbnb,
          Idealista, ThinkSpain, Zillow, Booking.com, or any other rental or
          property platform. Any resemblance in category or function is
          coincidental to operating in the same industry.
        </p>
      </LegalSection>

      <LegalSection title="No payment processing or escrow">
        <p>
          Aurora Homes does not process rent, deposits, or sale payments,
          and does not hold funds in escrow. Any transfer of money between
          users happens entirely outside of Aurora Homes and at users&rsquo;
          own risk. Never send money to someone you have not verified
          independently, and never send money before signing a proper
          contract.
        </p>
      </LegalSection>

      <LegalSection title="No rent or outcome guarantees">
        <p>
          Aurora Homes does not guarantee rental income, a successful sale,
          tenant or buyer reliability, or that any listing is free of
          defects or misrepresentation. Verification badges reflect a
          best-effort check, not a guarantee — see{" "}
          <a href="/trust" className="underline hover:text-navy-900">Trust &amp; verification</a>.
        </p>
      </LegalSection>

      <LegalSection title="No legal, tax, or financial advice">
        <p>
          Nothing on Aurora Homes constitutes legal, tax, financial, or
          investment advice. Price breakdowns (including tax and notary fee
          placeholders) are illustrative estimates only. Always consult an
          independent lawyer, notary, and tax advisor before signing a
          contract or completing a transaction.
        </p>
      </LegalSection>

      <LegalSection title="AI-generated content">
        <p>
          Listing descriptions, FAQs, translations, and AI assistant answers
          may be generated or assisted by artificial intelligence based on
          information supplied by the property owner. This content may
          contain errors or omissions. Owners are responsible for reviewing
          AI-generated content, and users should independently verify any
          material fact before relying on it.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
