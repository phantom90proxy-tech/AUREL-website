"use client";

import type { PointerEvent, ReactNode } from "react";

export function CollectionArrow({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  const origin = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--ink-x", Math.max(0, Math.min(rect.width, event.clientX - rect.left - button.clientLeft)) + "px");
    button.style.setProperty("--ink-y", Math.max(0, Math.min(rect.height, event.clientY - rect.top - button.clientTop)) + "px");
  };
  return <button type="button" aria-label={label} onClick={onClick} onPointerEnter={origin} onPointerLeave={origin} onFocus={(event) => {
    if (event.currentTarget.matches(":focus-visible")) {
      event.currentTarget.style.setProperty("--ink-x", "50%");
      event.currentTarget.style.setProperty("--ink-y", "50%");
    }
  }}><span className="carousel-arrow-ink" aria-hidden="true" />{children}</button>;
}
