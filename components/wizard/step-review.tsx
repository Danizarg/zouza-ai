"use client";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { TRANSLATION_LANGUAGES, type GeneratedListingContent } from "@/lib/types";
import { CheckCircle2, Circle } from "lucide-react";

export function StepReview({
  content,
  onChange,
  onBack,
  onContinue,
}: {
  content: GeneratedListingContent;
  onChange: (content: GeneratedListingContent) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  function set<K extends keyof GeneratedListingContent>(key: K, value: GeneratedListingContent[K]) {
    onChange({ ...content, [key]: value });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950 sm:text-3xl">Review your generated listing</h1>
      <p className="mt-2 text-navy-600">Everything below is editable — make it yours before publishing.</p>

      <div className="mt-8 space-y-8">
        <div>
          <Label htmlFor="gen-title">Title</Label>
          <Input id="gen-title" value={content.title} onChange={(e) => set("title", e.target.value)} />
        </div>

        <div>
          <Label htmlFor="gen-summary">Short summary</Label>
          <Input id="gen-summary" value={content.summary} onChange={(e) => set("summary", e.target.value)} />
        </div>

        <div>
          <Label htmlFor="gen-desc">Long description</Label>
          <Textarea
            id="gen-desc"
            className="min-h-48"
            value={content.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div>
          <Label>Feature bullets</Label>
          <ul className="grid gap-2 sm:grid-cols-2">
            {content.featureBullets.map((f, i) => (
              <li key={i}>
                <Input
                  value={f}
                  onChange={(e) => {
                    const next = [...content.featureBullets];
                    next[i] = e.target.value;
                    set("featureBullets", next);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label htmlFor="gen-ideal">Ideal tenant / buyer profile</Label>
          <Textarea id="gen-ideal" value={content.idealProfile} onChange={(e) => set("idealProfile", e.target.value)} />
        </div>

        <div>
          <Label>Price explanation</Label>
          <p className="rounded-xl border border-line bg-parchment px-4 py-3 text-sm leading-relaxed text-navy-700">
            {content.priceExplanation}
          </p>
        </div>

        <div>
          <Label>Verification checklist</Label>
          <ul className="space-y-1.5">
            {content.verificationChecklist.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-navy-600">
                <Circle className="h-3.5 w-3.5 text-gold-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label>FAQ</Label>
          <div className="space-y-3">
            {content.faq.map((item, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-4">
                <p className="text-sm font-semibold text-navy-900">{item.question}</p>
                <p className="mt-1 text-sm text-navy-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Translations</Label>
          <div className="flex flex-wrap gap-2">
            {TRANSLATION_LANGUAGES.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy-700"
              >
                {content.translations[lang] === "ready" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold-600" aria-hidden />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-navy-300" aria-hidden />
                )}
                {lang}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-navy-500">
            English is generated immediately; other languages are prepared on
            publish (placeholder in this demo).
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onContinue}>Preview listing</Button>
      </div>
    </div>
  );
}
