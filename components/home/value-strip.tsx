import { MessageCircle, ShieldCheck, Sparkles, Timer } from "lucide-react";

const VALUES = [
  { icon: MessageCircle, text: "Just talk to Suzi" },
  { icon: Sparkles, text: "AI that understands you" },
  { icon: Timer, text: "Saves you time" },
  { icon: ShieldCheck, text: "You're in control" },
] as const;

export function ValueStrip() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {VALUES.map((v) => (
        <div key={v.text} className="flex items-center gap-2.5 text-sm font-medium text-navy-800">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-parchment text-navy-700">
            <v.icon className="h-4 w-4" aria-hidden />
          </span>
          {v.text}
        </div>
      ))}
    </div>
  );
}
