"use client";

import { generateListingAction } from "@/app/actions";
import { StepChatFacts } from "@/components/wizard/step-chat-facts";
import { StepGenerating } from "@/components/wizard/step-generating";
import { StepIntent } from "@/components/wizard/step-intent";
import { StepPhotos, type WizardPhoto } from "@/components/wizard/step-photos";
import { StepPreview } from "@/components/wizard/step-preview";
import { StepPublish } from "@/components/wizard/step-publish";
import { StepReview } from "@/components/wizard/step-review";
import { WizardProgress } from "@/components/wizard/progress";
import { buildListing } from "@/lib/build-listing";
import { saveLocalListing } from "@/lib/local-listings";
import { publishListing } from "@/lib/publish-listing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  GeneratedListingContent,
  Listing,
  ListingFacts,
  ListingIntent,
} from "@/lib/types";
import Link from "next/link";
import { useRef, useState } from "react";

const DEFAULT_FACTS: ListingFacts = {
  intent: "rent_out",
  title: "",
  address_area: "",
  city: "",
  country: "Spain",
  property_type: "apartment",
  bedrooms: 2,
  bathrooms: 1,
  size_m2: 70,
  floor: null,
  pool: false,
  sea_view: false,
  garage: false,
  pets_allowed: false,
  furnished: true,
  price: 1200,
  utilities_monthly: 120,
  deposit: 1200,
  available_from: "",
  owner_rules: "",
  notes: "",
  photo_count: 0,
};

export function Wizard() {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<ListingIntent | null>(null);
  const [photos, setPhotos] = useState<WizardPhoto[]>([]);
  const [facts, setFacts] = useState<ListingFacts>(DEFAULT_FACTS);
  const [content, setContent] = useState<GeneratedListingContent | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<{ message: string; needsSignIn: boolean } | null>(null);
  const animationDoneRef = useRef(false);
  const generatedRef = useRef<GeneratedListingContent | null>(null);

  // The generation screen only advances once its animation has played *and*
  // the (mock or real) AI call has resolved — whichever finishes last calls
  // this. Using refs + direct calls (rather than a `content`/`animationDone`
  // state pair watched by an effect) avoids deriving state from state.
  function tryAdvancePastGenerating() {
    if (animationDoneRef.current && generatedRef.current) {
      setContent(generatedRef.current);
      setStep(5);
    }
  }

  // `finalFacts` comes from the chat step rather than this component's
  // `facts` state: the callback the chat step holds was created before the
  // last answer was applied, so its closure would generate the listing from
  // facts missing that answer (the price, for a sale).
  function handleFactsSubmit(finalFacts: ListingFacts) {
    setFacts(finalFacts);
    setStep(4);
    animationDoneRef.current = false;
    generatedRef.current = null;
    setContent(null);
    generateListingAction({ ...finalFacts, photo_count: photos.length }).then((generated) => {
      generatedRef.current = generated;
      tryAdvancePastGenerating();
    });
  }

  async function handlePublish() {
    if (!content) return;
    setPublishing(true);
    setPublishError(null);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      // Supabase mode: a real row under the signed-in owner, or a clear reason why not.
      // No local copy — a listing that failed to save must not look published.
      const result = await publishListing(supabase, {
        facts,
        content,
        photos: photos.map((p) => p.file),
      });
      setPublishing(false);
      if (!result.ok) {
        setPublishError({ message: result.error, needsSignIn: Boolean(result.needsSignIn) });
        return;
      }
      setListing(result.listing);
      setStep(7);
      return;
    }

    // Mock mode: the browser is the database.
    const finalListing = buildListing(facts, content, photos.map((p) => p.previewUrl));
    saveLocalListing(finalListing);
    setListing(finalListing);
    setPublishing(false);
    setStep(7);
  }

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      {step < 7 ? (
        <div className="mb-10">
          <WizardProgress step={step} />
        </div>
      ) : null}

      {step === 1 ? (
        <StepIntent
          value={intent}
          onSelect={(v) => {
            setIntent(v);
            setFacts((f) => ({ ...f, intent: v }));
          }}
          onContinue={() => intent && setStep(2)}
        />
      ) : null}

      {step === 2 ? (
        <StepPhotos
          photos={photos}
          onChange={setPhotos}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      ) : null}

      {step === 3 ? (
        <StepChatFacts
          facts={facts}
          onChange={setFacts}
          onBack={() => setStep(2)}
          onContinue={handleFactsSubmit}
        />
      ) : null}

      {step === 4 ? (
        <StepGenerating
          onDone={() => {
            animationDoneRef.current = true;
            tryAdvancePastGenerating();
          }}
        />
      ) : null}

      {step === 5 && content ? (
        <StepReview
          content={content}
          onChange={setContent}
          onBack={() => setStep(3)}
          onContinue={() => setStep(6)}
        />
      ) : null}

      {step === 6 && content ? (
        <>
          {publishError ? (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-ink-2"
            >
              <p>{publishError.message}</p>
              {publishError.needsSignIn ? (
                <Link
                  href="/auth/sign-in?next=%2Flist-with-ai"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          ) : null}
          <StepPreview
            listing={buildListing(facts, content, photos.map((p) => p.previewUrl))}
            onBack={() => setStep(5)}
            onPublish={handlePublish}
            publishing={publishing}
          />
        </>
      ) : null}

      {step === 7 && listing ? <StepPublish listing={listing} /> : null}

      {!isSupabaseConfigured() && step < 7 ? (
        <p className="mt-10 text-center text-xs text-muted">
          Demo mode — no Supabase connection configured. Your listing will be
          saved locally in this browser.
        </p>
      ) : null}
    </div>
  );
}
