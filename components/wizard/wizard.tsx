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
import { saveLocalListing } from "@/lib/local-listings";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  GeneratedListingContent,
  Listing,
  ListingFacts,
  ListingIntent,
} from "@/lib/types";
import { slugify, totalMoveIn } from "@/lib/utils";
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
  platform_fee_percent: 2,
  available_from: "",
  owner_rules: "",
  notes: "",
  photo_count: 0,
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
];

function buildListing(
  facts: ListingFacts,
  content: GeneratedListingContent,
  imageUrls: string[],
): Listing {
  const isRent = facts.intent === "rent_out";
  const slug = `${slugify(content.title)}-${Date.now().toString(36)}`;
  const listing: Listing = {
    id: `draft-${slug}`,
    owner_id: "local-owner",
    mode: isRent ? "rent" : "buy",
    intent: facts.intent,
    title: content.title,
    slug,
    summary: content.summary,
    description: content.description,
    city: facts.city,
    country: facts.country,
    address_area: facts.address_area,
    latitude: null,
    longitude: null,
    property_type: facts.property_type,
    bedrooms: facts.bedrooms,
    bathrooms: facts.bathrooms,
    size_m2: facts.size_m2,
    floor: facts.floor,
    price_monthly: isRent ? facts.price : null,
    price_sale: isRent ? null : facts.price,
    utilities_monthly: isRent ? facts.utilities_monthly : null,
    deposit: isRent ? facts.deposit : null,
    platform_fee_percent: isRent ? facts.platform_fee_percent : null,
    total_move_in_cost: null,
    available_from: facts.available_from || null,
    minimum_stay: null,
    maximum_stay: null,
    term: null,
    pets_allowed: facts.pets_allowed,
    pool: facts.pool,
    sea_view: facts.sea_view,
    garage: facts.garage,
    furnished: facts.furnished,
    new_build: false,
    direct_owner: true,
    verified_owner: false,
    verified_property: false,
    last_verified_at: null,
    status: "published",
    owner_rules: facts.owner_rules || null,
    owner_name: "You",
    rating: null,
    review_count: 0,
    images: imageUrls.length > 0 ? imageUrls : FALLBACK_IMAGES,
    features: content.featureBullets,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (isRent) listing.total_move_in_cost = totalMoveIn(listing);
  return listing;
}

export function Wizard() {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<ListingIntent | null>(null);
  const [photos, setPhotos] = useState<WizardPhoto[]>([]);
  const [facts, setFacts] = useState<ListingFacts>(DEFAULT_FACTS);
  const [content, setContent] = useState<GeneratedListingContent | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [publishing, setPublishing] = useState(false);
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

  function handleFactsSubmit() {
    setStep(4);
    animationDoneRef.current = false;
    generatedRef.current = null;
    setContent(null);
    generateListingAction({ ...facts, photo_count: photos.length }).then((generated) => {
      generatedRef.current = generated;
      tryAdvancePastGenerating();
    });
  }

  async function handlePublish() {
    if (!content) return;
    setPublishing(true);

    let imageUrls = photos.map((p) => p.previewUrl);
    const supabase = getSupabaseBrowserClient();
    if (supabase && photos.length > 0) {
      try {
        const uploaded = await Promise.all(
          photos.map(async (p, i) => {
            const path = `${Date.now()}-${i}-${p.file.name}`;
            const { error } = await supabase.storage.from("listing-photos").upload(path, p.file);
            if (error) return null;
            return supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
          }),
        );
        const clean = uploaded.filter((u): u is string => Boolean(u));
        if (clean.length > 0) imageUrls = clean;
      } catch {
        // fall back to local preview URLs
      }
    }

    const finalListing = buildListing(facts, content, imageUrls);

    if (supabase) {
      try {
        await supabase.from("listings").insert({ ...finalListing, images: undefined, features: undefined });
      } catch {
        // mock-mode fallback below always runs too, so this never blocks the demo
      }
    }
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
        <StepPreview
          listing={buildListing(facts, content, photos.map((p) => p.previewUrl))}
          onBack={() => setStep(5)}
          onPublish={handlePublish}
          publishing={publishing}
        />
      ) : null}

      {step === 7 && listing ? <StepPublish listing={listing} /> : null}

      {!isSupabaseConfigured() && step < 7 ? (
        <p className="mt-10 text-center text-xs text-navy-400">
          Demo mode — no Supabase connection configured. Your listing will be
          saved locally in this browser.
        </p>
      ) : null}
    </div>
  );
}
