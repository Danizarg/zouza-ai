import { UserRound } from "lucide-react";
import Image from "next/image";

/**
 * The hero's right-side portrait — Suzi as an actual human presence, not
 * an icon. No licensed photo exists yet, so this renders an intentional
 * placeholder (not a broken image) until one is provided.
 *
 * To swap in the real photo: drop the file at
 * `public/images/suzi-portrait.jpg`, then pass
 * `src="/images/suzi-portrait.jpg"` from the caller (components/home/hero.tsx).
 */
export function HeroPortraitPanel({ src }: { src?: string }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-line shadow-card sm:aspect-[3/4]">
      {src ? (
        <Image
          src={src}
          alt="Suzi, your AI real estate partner"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-3"
          style={{
            background:
              "radial-gradient(circle at 65% 20%, #E8CFA0 0%, #B3945A 38%, #0F1B33 100%)",
          }}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ivory/15 text-ivory">
            <UserRound className="h-8 w-8" aria-hidden />
          </span>
          <span className="rounded-full bg-navy-950/40 px-3 py-1 text-xs font-medium text-ivory/80 backdrop-blur-sm">
            Suzi portrait — placeholder
          </span>
        </div>
      )}
    </div>
  );
}
