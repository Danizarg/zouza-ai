"use client";

import { useRef, useSyncExternalStore } from "react";

function noopSubscribe() {
  return () => {};
}

/**
 * Reads a browser-only value (localStorage, etc.) safely across SSR and
 * hydration via useSyncExternalStore, instead of the `useEffect` +
 * `setState` pattern (which triggers cascading renders and is flagged by
 * the `react-hooks/set-state-in-effect` rule).
 *
 * Caches by serialized value so array/object snapshots return a stable
 * reference when the underlying data hasn't actually changed — required
 * by useSyncExternalStore's contract to avoid re-render loops.
 */
export function useClientSnapshot<T>(getSnapshot: () => T, serverSnapshot: T): T {
  const cache = useRef<{ serialized: string; value: T } | null>(null);

  function getCachedSnapshot(): T {
    const next = getSnapshot();
    const serialized = JSON.stringify(next);
    if (cache.current && cache.current.serialized === serialized) {
      return cache.current.value;
    }
    cache.current = { serialized, value: next };
    return next;
  }

  return useSyncExternalStore(noopSubscribe, getCachedSnapshot, () => serverSnapshot);
}
