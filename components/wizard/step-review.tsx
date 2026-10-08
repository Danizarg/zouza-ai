"use client";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import type { GeneratedListingContent } from "@/lib/types";
import { Circle } from "lucide-react";

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
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Review your generated listing</h1>
      <p className="mt-2 text-muted">Everything below is editable — make it yours before publishing.</p>

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
          <p className="rounded-xl border border-border bg-paper-2 px-4 py-3 text-sm leading-relaxed text-ink-2">
            {content.priceExplanation}
          </p>
        </div>

        <div>
          <Label>Verification checklist</Label>
          <ul className="space-y-1.5">
            {content.verificationChecklist.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted">
                <Circle className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label>FAQ</Label>
          <div className="space-y-3">
            {content.faq.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-4">
                <p className="text-sm font-semibold text-ink">{item.question}</p>
                <p className="mt-1 text-sm text-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onContinue}>Preview listing</Button>
      </div>
    </div>
  );
}
