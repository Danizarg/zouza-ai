import { HeroPortraitPanel } from "@/components/home/hero-portrait-panel";
import { SuziIntroCard } from "@/components/home/suzi-intro-card";

/**
 * The hero's "Suzi module" — the intro card and portrait as plain flex
 * siblings, never overlapping. Mobile stacks the portrait above the card;
 * desktop places them side by side (card left, portrait right). No
 * absolute positioning is used for this relationship on purpose — a card
 * floated over the portrait previously hid most of the person, which is
 * exactly what this component exists to avoid.
 */
export function SuziHeroVisual({ portraitSrc }: { portraitSrc?: string }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="order-2 lg:order-1 lg:w-[280px] lg:shrink-0">
        <SuziIntroCard />
      </div>
      <div className="relative order-1 min-w-0 flex-1 lg:order-2">
        <div className="pointer-events-none absolute inset-6 -z-10 rounded-full bg-gold-300/25 blur-3xl" aria-hidden />
        <HeroPortraitPanel src={portraitSrc} />
      </div>
    </div>
  );
}
