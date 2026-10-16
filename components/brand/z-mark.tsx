import { cn } from "@/lib/utils";
import type { SVGProps } from "react";
import styles from "./z-mark.module.css";

/**
 * Z mark B ("Voice") — the one brand mark for Zouza and Suzi
 * (design system v2, decided 2026-10-16). A rounded-stroke Z that ends
 * in a listening dot. Stroke-based and currentColor, so it works mono on
 * any band: white on brand-500, brand-300 on brand-900, ink on paper.
 *
 * Server-safe: no hooks, no framer-motion. The three exports are
 *
 *   <ZMark />   the bare mark, sized by className or `size`
 *   <ZBadge />  the wordmark tile: brand-300 mark on a brand-900 rounded-lg square
 *   <ZPulse />  the mark with a state: ready | listening | thinking
 *
 * Canonical treatments (design.md "Brand mark" + "What pages MUST share"):
 *
 *   Wordmark tile  — <ZBadge />: `bg-brand-900 text-brand-300 rounded-lg`,
 *                    beside the "Zouza" word in header, footer and landing.
 *                    app/icon.svg and the OG share card are this tile in hex.
 *   Suzi orb       — a *circle* (`rounded-full bg-brand-500 text-white`)
 *                    holding <ZPulse />: the floating avatar button and every
 *                    chat header (Suzi panel, per-listing chat). It is round
 *                    because it is an avatar, not the wordmark.
 *   Inline mark    — bare <ZMark /> in currentColor next to text.
 *
 * Nothing else: no other background/foreground pairings for the mark.
 *
 * Decorative by default (aria-hidden). Pass `title` only when the mark
 * stands alone as the accessible name of a link or button.
 */

type MarkProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  /** Width and height in px. Omit to size with className (e.g. `h-4 w-4`). */
  size?: number;
  title?: string;
};

const MARK_ATTRS = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function ZMark({ size, title, className, ...props }: MarkProps) {
  return (
    <svg
      {...MARK_ATTRS}
      width={size}
      height={size}
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M14 14h32" />
      <path d="M50 14 14 50" />
      <path d="M14 50h22" />
      <circle cx="50" cy="50" r="5.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * The wordmark tile used by the header, footer and landing: the mark in
 * brand-300 on a brand-900 `rounded-lg` square (6.98:1), exactly as
 * design.md "What pages MUST share" specifies. `size` is the square's edge
 * in px (28 in the header/footer, 32 on the landing); the radius is the
 * design system's `rounded-lg`, not derived from `size`, so the tile shares
 * its corner with every other `rounded-lg` control at those sizes.
 */
export function ZBadge({
  size = 28,
  title,
  className,
}: {
  size?: number;
  title?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-brand-900 text-brand-300",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <ZMark title={title} style={{ width: "57%", height: "57%" }} />
    </span>
  );
}

export type ZPulseState = "ready" | "listening" | "thinking";

/**
 * The mark as Suzi's status light. `listening` breathes the dot
 * (scale 1 → 1.25 → 1, 1.6s); `thinking` draws the stroke (1.8s loop);
 * `ready` is still. Both animations are CSS-only and switched off under
 * prefers-reduced-motion (see z-mark.module.css), so the parent never
 * needs to know about the user's motion preference.
 */
export function ZPulse({
  state = "ready",
  size,
  title,
  className,
  ...props
}: MarkProps & { state?: ZPulseState }) {
  const stateClass =
    state === "listening" ? styles.listening : state === "thinking" ? styles.thinking : undefined;

  return (
    <svg
      {...MARK_ATTRS}
      width={size}
      height={size}
      className={cn(stateClass, className)}
      data-state={state}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path className={styles.segTop} pathLength={1} d="M14 14h32" />
      <path className={styles.segDiag} pathLength={1} d="M50 14 14 50" />
      <path className={styles.segBottom} pathLength={1} d="M14 50h22" />
      <circle className={styles.dot} cx="50" cy="50" r="5.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
