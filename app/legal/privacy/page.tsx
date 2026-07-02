import { LegalPage, LegalSection } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="2 July 2026">
      <LegalSection title="1. What we collect">
        <p>
          Account details (name, email), listing content and photos you
          upload, messages exchanged through the platform, viewing requests,
          reviews, and contact form or waitlist submissions.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use it">
        <p>
          To operate the marketplace: publishing listings, enabling search
          and messaging, generating AI listing content from the facts and
          photos you provide, verifying owners and properties, and replying
          to enquiries or support requests.
        </p>
      </LegalSection>

      <LegalSection title="3. AI processing">
        <p>
          Photos and property facts you submit may be processed by AI
          services (our own systems, or third-party AI providers when
          configured) to generate listing descriptions, FAQs, translations,
          and AI assistant responses. We do not use your data to train
          third-party foundation models beyond what is required to generate
          your own listing content.
        </p>
      </LegalSection>

      <LegalSection title="4. Storage">
        <p>
          When connected, listing data and photos are stored using Supabase
          (database, authentication and file storage). If Supabase is not
          configured, the demo runs in a local mock mode and some data (such
          as saved homes or draft listings) is stored only in your browser.
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing">
        <p>
          We do not sell personal data. Listing details you choose to
          publish are visible to other users of the marketplace by design.
          Messages are visible only to the participants in a conversation.
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>
          You may request access to, correction of, or deletion of your
          personal data by contacting us through the{" "}
          <a href="/contact" className="underline hover:text-navy-900">contact page</a>.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          We use essential cookies/local storage required for authentication
          sessions and basic functionality (such as remembering saved
          homes). We do not currently use third-party advertising trackers.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
