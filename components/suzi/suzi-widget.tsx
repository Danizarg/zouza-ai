"use client";

import { openSuziPanel, SUZI_OPEN_EVENT } from "@/lib/suzi-events";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";

/**
 * Lazy-loads the global Suzi assistant on the client only, so
 * framer-motion, the assistant brain and the mock inventory stay out of
 * every route's first-load JavaScript. `ssr: false` is only allowed inside
 * a Client Component, which is why this wrapper exists; the avatar is
 * position:fixed chrome, so appearing after hydration shifts nothing.
 */
const SuziAvatarAssistant = dynamic(
  () => import("@/components/suzi/suzi-avatar-assistant").then((m) => m.SuziAvatarAssistant),
  { ssr: false },
);

export function SuziWidget() {
  // The header's "Talk to Suzi" fires SUZI_OPEN_EVENT. If it fires before
  // the chunk has mounted nobody is listening yet, so remember the request
  // and re-dispatch it once the assistant reports that it is ready.
  const ready = useRef(false);
  const pendingOpen = useRef(false);

  useEffect(() => {
    function onOpen() {
      if (!ready.current) pendingOpen.current = true;
    }
    window.addEventListener(SUZI_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(SUZI_OPEN_EVENT, onOpen);
  }, []);

  const handleReady = useCallback(() => {
    ready.current = true;
    if (pendingOpen.current) {
      pendingOpen.current = false;
      window.setTimeout(openSuziPanel, 0);
    }
  }, []);

  return <SuziAvatarAssistant onReady={handleReady} />;
}
