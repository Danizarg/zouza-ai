/**
 * Cross-component trigger to open the global Suzi avatar panel — used by
 * the header CTA (and anywhere else outside the SuziAvatarAssistant tree)
 * so "Talk to Suzi" opens the conversation instead of navigating away.
 */
export const SUZI_OPEN_EVENT = "suzi:open-panel";

export function openSuziPanel() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SUZI_OPEN_EVENT));
  }
}
