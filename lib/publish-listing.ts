import { buildListing, FALLBACK_IMAGES, toListingRow } from "@/lib/build-listing";
import type { GeneratedListingContent, Listing, ListingFacts } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type PublishResult =
  | { ok: true; listing: Listing }
  | { ok: false; error: string; needsSignIn?: boolean };

const BUCKET = "listing-images";
const MAX_FEATURES = 30;

function describe(error: { code?: string; message?: string } | null): string {
  switch (error?.code) {
    case "23514":
      return error.message?.includes("content_rejected")
        ? "Some of the wording was rejected by our content filter. Adjust the text and try again."
        : "One of the values isn't valid. Check the facts and try again.";
    case "42501":
      return "You don't have permission to publish this listing. Sign in again and retry.";
    default:
      return error?.message
        ? `Could not publish: ${error.message}`
        : "Could not publish the listing. Please try again.";
  }
}

/**
 * Publishes under the signed-in owner, in the browser, through row-level security:
 * the listing row first (the database assigns the id, slug and owner name), then the photos
 * into the owner's own folder of the public bucket, then the image and feature rows.
 *
 * Nothing is faked: if the listing cannot be written the caller gets the reason, not a local
 * copy that looks published.
 */
export async function publishListing(
  supabase: SupabaseClient,
  input: { facts: ListingFacts; content: GeneratedListingContent; photos: File[] },
): Promise<PublishResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to publish your listing.", needsSignIn: true };

  const draft = buildListing(input.facts, input.content, [], user.id);

  const { data: inserted, error } = await supabase
    .from("listings")
    .insert(toListingRow(draft, user.id))
    .select("id, slug, owner_name, created_at, updated_at")
    .single();
  if (error || !inserted) return { ok: false, error: describe(error) };

  const urls: string[] = [];
  for (const [i, file] of input.photos.entries()) {
    const ext =
      (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${user.id}/${inserted.id}/${String(i).padStart(2, "0")}-${Date.now().toString(36)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (uploadError) {
      console.warn("[publish] photo skipped:", uploadError.message);
      continue;
    }
    urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }

  if (urls.length > 0) {
    const { error: imagesError } = await supabase
      .from("listing_images")
      .insert(urls.map((url, sort_order) => ({ listing_id: inserted.id, url, sort_order })));
    if (imagesError) console.warn("[publish] image rows failed:", imagesError.message);
  }

  const features = draft.features
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, MAX_FEATURES);
  if (features.length > 0) {
    const { error: featuresError } = await supabase
      .from("listing_features")
      .insert(features.map((label) => ({ listing_id: inserted.id, label })));
    if (featuresError) console.warn("[publish] feature rows failed:", featuresError.message);
  }

  return {
    ok: true,
    listing: {
      ...draft,
      id: inserted.id,
      slug: inserted.slug ?? draft.slug,
      owner_name: inserted.owner_name || draft.owner_name,
      images: urls.length > 0 ? urls : FALLBACK_IMAGES,
      features,
      created_at: inserted.created_at ?? draft.created_at,
      updated_at: inserted.updated_at ?? draft.updated_at,
    },
  };
}
