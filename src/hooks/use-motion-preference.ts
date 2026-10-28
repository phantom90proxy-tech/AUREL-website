"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query);
  let frame = 0;
  const notify = () => {
    // Let other media-query listeners (including Motion's imperative renderer)
    // update their caches before React effects start newly enabled animations.
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(onChange);
  };
  media.addEventListener("change", notify);
  return () => {
    cancelAnimationFrame(frame);
    media.removeEventListener("change", notify);
  };
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

function getServerSnapshot(): null {
  return null;
}

/**
 * Motion 12.43's useReducedMotion snapshots useState without subscribing React
 * to later preference changes. Read the browser's live preference instead.
 * A null server snapshot keeps SSR/hydration identical and defers autoplay.
 */
export function useMotionPreference(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
