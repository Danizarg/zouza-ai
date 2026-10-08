import { ZBadge } from "@/components/brand/z-mark";
import { Doors } from "@/components/home/doors";
import { Tide } from "@/components/home/tide";
import { TidePause } from "@/components/home/tide-pause";
import { cn } from "@/lib/utils";
import styles from "./landing.module.css";

/**
 * The full-viewport landing above the main site — a server component with
 * a CSS entrance (no framer). Visible words: Zouza (1) · h1 (10) ·
 * doors (6) · support line (5) · Scroll (1) = 23, under the 25 budget.
 *
 * The content's bottom padding clears both the 34svh tide band and the
 * scroll cue that sits just above it, so nothing overlaps on short
 * viewports; the section simply grows past one viewport if it must.
 */
export function Landing() {
  return (
    <section
      id="landing"
      aria-labelledby="landing-title"
      className={cn(styles.landing, "relative isolate flex flex-col overflow-hidden bg-paper")}
    >
      <div className="container-page relative z-10 flex flex-1 flex-col items-center justify-center pt-8 pb-[calc(34svh_+_5.5rem)] text-center">
        <div className={cn(styles.rise, "flex items-center gap-2.5")}>
          <ZBadge size={32} />
          <span className="font-display text-xl font-semibold tracking-tight text-ink">Zouza</span>
        </div>

        <h1
          id="landing-title"
          className={cn(styles.rise, "mt-8 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight text-ink sm:text-5xl")}
          style={{ animationDelay: "0.08s" }}
        >
          Just tell Suzi what you need.
          <span className="block">She&rsquo;ll do the rest.</span>
        </h1>

        <div className={cn(styles.rise, "mt-10 flex w-full justify-center")} style={{ animationDelay: "0.16s" }}>
          <Doors />
        </div>

        <p className={cn(styles.rise, "mt-5 text-sm text-muted")} style={{ animationDelay: "0.24s" }}>
          No fees. One simple subscription.
        </p>
      </div>

      <Tide />

      <a
        href="#suzi"
        className={cn(
          styles.cue,
          "absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 rounded-lg px-4 py-2 text-[0.75rem] font-semibold tracking-[0.14em] text-muted uppercase",
        )}
      >
        Scroll
        <span aria-hidden className={cn(styles.cueLine, "block w-px")} />
      </a>

      <TidePause />
    </section>
  );
}
