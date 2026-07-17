import { MessageCircle, ShieldCheck, Sparkles, Timer } from "lucide-react";

const VALUES = [
  {
    icon: MessageCircle,
    title: "Just talk to Suzi",
    text: "No filters. No forms. Just a natural conversation.",
  },
  {
    icon: Sparkles,
    title: "AI that understands you",
    text: "Suzi listens, understands your needs and finds the best matches.",
  },
  {
    icon: Timer,
    title: "Saves you time",
    text: "Smart insights, instant answers and everything in one place.",
  },
  {
    icon: ShieldCheck,
    title: "You're in control",
    text: "100% secure. Your data is always protected.",
  },
] as const;

export function ValueStrip() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {VALUES.map((v) => (
        <div key={v.title} className="group">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-parchment text-navy-700 transition-colors group-hover:bg-gold-100 group-hover:text-gold-700">
            <v.icon className="h-4.5 w-4.5" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-navy-900">{v.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-navy-500">{v.text}</p>
        </div>
      ))}
    </div>
  );
}
