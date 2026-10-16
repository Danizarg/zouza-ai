import { WaitlistForm } from "@/components/waitlist-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zouza Pro",
  description:
    "Suzi for agents and agencies: enquiries answered, leads qualified, viewings booked. Coming soon — join the early-access list.",
};

/* Visible words: eyebrow 4 · h1 2 · line 12 · form 4 = 22 (budget 60). */
export default function ProPage() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="max-w-xl">
        <p className="eyebrow">For agents and agencies</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">Zouza Pro</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Suzi answers enquiries, qualifies leads and books viewings for you. Coming soon.
        </p>
        <div className="mt-8">
          <WaitlistForm interest="agent" />
        </div>
      </div>
    </section>
  );
}
