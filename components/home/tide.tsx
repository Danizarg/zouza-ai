import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import styles from "./landing.module.css";

/*
 * Each path spans 0–2880 with two identical 1440-wide halves, so the SVG
 * (rendered at 200% width) loops seamlessly when translated by -50%.
 * Amplitudes 18 / 30 / 36; wave 2 is phase-shifted half a period so the
 * crests interleave in the still frame.
 */
const W1 =
  "M0 42 C160 42 200 66 360 66 C520 66 560 53 720 53 C880 53 920 78 1080 78 C1240 78 1280 42 1440 42 C1600 42 1640 66 1800 66 C1960 66 2000 53 2160 53 C2320 53 2360 78 2520 78 C2680 78 2720 42 2880 42 L2880 120 L0 120 Z";
const W2 =
  "M0 90 C160 90 200 30 360 30 C520 30 560 71 720 71 C880 71 920 48 1080 48 C1240 48 1280 90 1440 90 C1600 90 1640 30 1800 30 C1960 30 2000 71 2160 71 C2320 71 2360 48 2520 48 C2680 48 2720 90 2880 90 L2880 120 L0 120 Z";
const W3 =
  "M0 24 C160 24 200 73 360 73 C520 73 560 46 720 46 C880 46 920 96 1080 96 C1240 96 1280 24 1440 24 C1600 24 1640 73 1800 73 C1960 73 2000 46 2160 46 C2320 46 2360 96 2520 96 C2680 96 2720 24 2880 24 L2880 120 L0 120 Z";

/* Per-layer constants read by landing.module.css. Nothing here is random. */
type WaveVars = CSSProperties & Record<"--swell" | "--drift" | "--swell-t", string>;

function Wave({ d, layer, top, vars }: { d: string; layer: string; top: string; vars: WaveVars }) {
  return (
    <div className={cn(styles.swell, layer, "absolute inset-x-0 h-[9svh]", top)} style={vars}>
      <svg className={cn(styles.drift, "block h-full")} viewBox="0 0 2880 120" preserveAspectRatio="none" aria-hidden>
        <path d={d} />
      </svg>
    </div>
  );
}

/**
 * The sea at night: a brand-900 water body under three stacked solid wave
 * fills (brand-200 → brand-300 → brand-900) and two slow glints. Pure
 * markup — a server component. Decorative, out of layout and hit-testing.
 *
 * Band = bottom 34svh of the landing. Wave SVGs are 9svh tall and stepped
 * so the deepest trough (10.2svh, +0.7svh at full swell) stays above the
 * water body's straight top edge at 11svh — the visible surface is always
 * wave 3's organic edge.
 */
export function Tide() {
  return (
    <div className={cn(styles.tide, "pointer-events-none absolute inset-x-0 bottom-0 h-[34svh]")} aria-hidden>
      {/* water body — the landing's one brand-900 band */}
      <div className="absolute inset-x-0 bottom-0 h-[23svh] bg-brand-900">
        <div className={cn(styles.ripple, "absolute inset-x-0")} style={{ top: "42%", height: "2px" }}>
          <span className={styles.glint} />
        </div>
        <div className={cn(styles.ripple, "absolute inset-x-0")} style={{ top: "64%", height: "6px" }}>
          <span className={cn(styles.glint, styles.glintB)} />
        </div>
      </div>

      {/* shoreline, painted low → high: foam first so the deep edge covers every body below its surface */}
      <Wave d={W1} layer={styles.wave1} top="top-0" vars={{ "--swell": "5px", "--drift": "26s", "--swell-t": "14s" }} />
      <Wave d={W2} layer={styles.wave2} top="top-[1.5svh]" vars={{ "--swell": "-4px", "--drift": "23s", "--swell-t": "17s" }} />
      <Wave d={W3} layer={styles.wave3} top="top-[3svh]" vars={{ "--swell": "6px", "--drift": "29s", "--swell-t": "19s" }} />

      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="tide-ripple" x="-5%" y="-200%" width="110%" height="500%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.08" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
