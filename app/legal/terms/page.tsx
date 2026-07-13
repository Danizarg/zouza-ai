import { LegalPage, LegalSection } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="2 July 2026">
      <LegalSection title="1. What Zouza.ai is">
        <p>
          Zouza.ai is an independent marketplace and AI marketing
          platform for property listings. Zouza.ai acts as a pure
          intermediary: we help owners present properties professionally and
          help tenants and buyers find and evaluate them. We are not a party
          to any rental or sale agreement made between users.
        </p>
      </LegalSection>

      <LegalSection title="2. No affiliation">
        <p>
          Zouza.ai is an independent concept and is not affiliated with,
          endorsed by, or connected to Airbnb, Idealista, ThinkSpain, Zillow,
          Booking.com, or any other rental or property platform.
        </p>
      </LegalSection>

      <LegalSection title="3. What Zouza.ai does not provide">
        <p>
          In this version of the product, Zouza.ai does not provide
          payment processing, rent collection, escrow services, deposit
          management, rent guarantees, or legal or tax advice. Any financial
          or legal transaction — including payment of rent, deposits, or
          purchase prices — takes place directly between users, outside of
          Zouza.ai, under agreements you are responsible for reviewing.
        </p>
      </LegalSection>

      <LegalSection title="4. AI-generated content">
        <p>
          Listing descriptions, FAQs, translations and AI assistant answers
          may be generated or assisted by AI. Owners are responsible for
          reviewing and correcting AI-generated content before publishing,
          and for the accuracy of the final listing. AI assistant answers are
          derived from listing data provided by the owner and may be
          incomplete or, occasionally, incorrect.
        </p>
      </LegalSection>

      <LegalSection title="5. Verification">
        <p>
          Verification badges reflect a best-effort review process and are
          not a guarantee. See our{" "}
          <a href="/trust" className="underline hover:text-navy-900">Trust &amp; verification</a>{" "}
          page for details.
        </p>
      </LegalSection>

      <LegalSection title="6. User conduct">
        <p>
          Users must provide accurate information, respect other users, and
          must not use Zouza.ai to post fraudulent, misleading, or
          illegal listings. We may remove listings or suspend accounts that
          violate these terms or are reported and confirmed as problematic.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>
          Zouza.ai is provided on an &ldquo;as is&rdquo; basis during this
          early stage of the product. To the maximum extent permitted by
          law, Zouza.ai is not liable for losses arising from
          transactions between users, inaccurate listing content, or
          reliance on AI-generated information.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          We may update these terms as the product evolves. Continued use of
          Zouza.ai after changes constitutes acceptance of the updated
          terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
