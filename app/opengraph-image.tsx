import { ImageResponse } from "next/og";

/**
 * Site-wide Open Graph / share card, generated at build time by next/og.
 *
 * Copy is the campaign's: the landing lead line, the support line and the
 * domain. The brand mark is drawn as inline SVG — Satori (the renderer
 * behind ImageResponse) supports svg/g/path/circle/rect children directly,
 * so the exact Z mark B geometry is rendered without a data-URI <img>.
 * Text falls back to Geist Regular, the only font next/og bundles; the
 * site's Fraunces/Inter would need a vendored .ttf (see notes).
 *
 * Routes with their own openGraph.images (e.g. /property/[id]) override
 * this per the metadata merge rules.
 */

export const alt = "Zouza — Just tell Suzi what you need. She'll do the rest.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// design system v2 tokens (app/globals.css @theme), hex for hex
const BRAND_300 = "#C1B3F9";
const BRAND_200 = "#DCD4FC";
const BRAND_500 = "#7255F0";
const BRAND_900 = "#2D1F7A";
const PAPER = "#FAF9FC";

/** Z mark B ("Voice") — the exact brand geometry, coloured for a static image. */
function Mark({ size, stroke, background }: { size: number; stroke: string; background?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {background ? <rect width="64" height="64" rx="18" fill={background} /> : null}
      <g fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14h32" />
        <path d="M50 14 14 50" />
        <path d="M14 50h22" />
      </g>
      <circle cx="50" cy="50" r="5.5" fill={stroke} />
    </svg>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: BRAND_900,
          color: PAPER,
        }}
      >
        {/* A large, faint mark at the edge — the "glint" on a calm sea at night. */}
        <div style={{ display: "flex", position: "absolute", right: -40, top: 90, opacity: 0.12 }}>
          <Mark size={460} stroke={BRAND_300} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Mark size={64} stroke="#FFFFFF" background={BRAND_500} />
          <div style={{ fontSize: 38, letterSpacing: -0.5 }}>Zouza</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 1000 }}>
          <div style={{ fontSize: 58, lineHeight: 1.12 }}>Just tell Suzi what you need.</div>
          <div style={{ fontSize: 58, lineHeight: 1.12, color: BRAND_300 }}>She&apos;ll do the rest.</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: BRAND_200,
          }}
        >
          <div>No fees. One simple subscription.</div>
          <div style={{ color: BRAND_300 }}>zouza.ai</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
