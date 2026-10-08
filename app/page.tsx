import { Doors } from "@/components/home/doors";
import { Landing } from "@/components/home/landing";
import { NlSearchDemo } from "@/components/home/nl-search-demo";
import { ListingCard } from "@/components/listing-card";
import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import { interpretSearchQuery } from "@/lib/ai/service";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { Camera, MessageCircle, Rocket } from "lucide-react";
import Link from "next/link";

/** The example in the prompt's empty field — the campaign's "flat in Valencia" line. */
const SUZI_PLACEHOLDER = "A flat in Valencia near the beach, under €1,500 a month…";

/**
 * The same ask, phrased so the deterministic parser ranks rentals only. It
 * has no model to infer that "a month" means rent (the model path does), so
 * the seeded results below the field show what Suzi would actually answer.
 */
const SEED_QUERY = "A flat to rent in Valencia near the beach, under €1,500 a month";

const steps = [
  { icon: Camera, label: "Upload photos" },
  { icon: MessageCircle, label: "Answer a few questions" },
  { icon: Rocket, label: "Go live" },
] as const;

/*
 * Visible words (excluding listing-card data, header/footer, the Suzi widget
 * and transient states): landing 23 · §1 36 (incl. the three "% match"
 * badges) · §2 21 · §3 5 · §4 11 = 96, under the 140 budget. Section
 * headings stay at or under six words.
 */
export default function HomePage() {
  // Ranked here, on the server, so the client demo never imports the inventory.
  const seeded = interpretSearchQuery(SEED_QUERY, MOCK_LISTINGS);
  const featured = MOCK_LISTINGS.filter((l) => l.verified_owner && l.verified_property).slice(0, 3);

  return (
    <>
      <Landing />

      {/* §1 Ask Suzi */}
      <section id="suzi" className="container-page scroll-mt-14 py-16 md:py-20" aria-labelledby="suzi-title">
        <Reveal>
          <h2 id="suzi-title" className="text-3xl font-semibold text-ink sm:text-4xl">
            Hi, I&rsquo;m Suzi.
          </h2>
          <p className="mt-3 max-w-lg text-muted">Your AI real estate partner. Tell me what you need.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 max-w-3xl">
            <NlSearchDemo placeholder={SUZI_PLACEHOLDER} seedQuery={SEED_QUERY} initialResults={seeded} />
          </div>
        </Reveal>
      </section>

      {/* §2 List your home — the page's one paper-2 band */}
      <section className="border-y border-border bg-paper-2 py-16 md:py-20" aria-labelledby="list-title">
        <div className="container-page">
          <Reveal>
            <h2 id="list-title" className="text-3xl font-semibold text-ink sm:text-4xl">
              Photos in. Listing out.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal>
              <Link
                href="/list-with-ai"
                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-strong bg-surface p-10 text-center transition-colors hover:border-brand-500"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Camera className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-semibold text-ink">Start your listing</span>
                <span className="text-xs text-muted">Free to create. €20/month once live.</span>
              </Link>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.label} delay={0.06 + i * 0.06} className="h-full">
                  <div className="h-full border-t-2 border-brand-500 pt-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-brand-300">
                      <s.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-ink">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* §3 Homes on Zouza */}
      <section className="container-page py-16 md:py-20" aria-labelledby="homes-title">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="homes-title" className="text-3xl font-semibold text-ink sm:text-4xl">
              Homes on Zouza
            </h2>
            <Link href="/explore" className={buttonClasses("outline", "md")}>
              View all
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l, i) => (
            <Reveal key={l.id} delay={i * 0.06} className="h-full">
              <ListingCard listing={l} />
            </Reveal>
          ))}
        </div>
      </section>

      {/*
       * §4 Closing — a surface band. The tide's brand-900 water is this page's
       * single dark band, so the closing stays light and the two brand-500
       * doors read as primaries on it.
       */}
      <section className="border-t border-border bg-surface py-16 md:py-20" aria-labelledby="close-title">
        <div className="container-page">
          <Reveal className="mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 id="close-title" className="text-3xl font-semibold text-ink sm:text-4xl">
              Tell Suzi what you need.
            </h2>
            <Doors className="mt-8" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
