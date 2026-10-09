import { HeroPortraitPanel } from "@/components/home/hero-portrait-panel";

/** A single portrait keeps the hero focused on the conversation entry point. */
export function SuziHeroVisual({ portraitSrc }: { portraitSrc?: string }) {
  return <HeroPortraitPanel src={portraitSrc} />;
}
