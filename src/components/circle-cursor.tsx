"use client";

import { useEffect, useId, useRef } from "react";
import { usePathname } from "next/navigation";

const nativeSelector = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-native-cursor], [draggable="true"], iframe, video, audio, canvas';

export function CircleCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const gooId = `cursor-goo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const root = document.documentElement;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let ringX = 0, ringY = 0, speed = 0, ringScale = 1;
    let lastMove = 0, lastFrame = 0;
    const checkView = () => {
      frame = 0;
      const now = performance.now();
      const dt = lastFrame ? Math.min(40, now - lastFrame) : 16;
      lastFrame = now;
      const follow = 1 - Math.exp(-dt / 32);
      ringX += (pointerX - ringX) * follow;
      ringY += (pointerY - ringY) * follow;
      const motionSpeed = speed * Math.exp(-Math.max(0, now - lastMove - 16) / 90);
      ringScale += (1 + Math.min(0.16, motionSpeed * 0.055) - ringScale) * (1 - Math.exp(-dt / 80));
      node.style.setProperty("--halo-x", Math.max(-10, Math.min(10, ringX - pointerX)) + "px");
      node.style.setProperty("--halo-y", Math.max(-10, Math.min(10, ringY - pointerY)) + "px");
      node.style.setProperty("--halo-scale", ringScale.toFixed(4));
      node.style.setProperty("--ink-stretch", Math.min(0.09, motionSpeed * 0.025).toFixed(4));
      const hit = document.elementFromPoint(pointerX, pointerY);
      const editorial = pathname.startsWith("/collections") && Boolean(hit?.closest("[data-editorial-view]"));
      const view = editorial || (pathname === "/" && Boolean(hit?.closest(".collection-carousel-viewport")));
      node.dataset.editorial = String(editorial);
      node.dataset.view = String(view);
      const arrow = hit?.closest<HTMLButtonElement>(".collection-carousel-controls button:not(:disabled)");
      node.dataset.arrow = String(Boolean(arrow));
      node.dataset.direction = arrow?.getAttribute("aria-label") === "Previous collection" ? "previous" : "next";
      const rect = (arrow || (view ? hit?.closest(".collection-image") : null))?.getBoundingClientRect();
      const strength = arrow ? 0.12 : 0.015;
      const maximum = arrow ? 3 : 2;
      const x = rect ? pointerX + Math.max(-maximum, Math.min(maximum, (rect.left + rect.width / 2 - pointerX) * strength)) : pointerX;
      const y = rect ? pointerY + Math.max(-maximum, Math.min(maximum, (rect.top + rect.height / 2 - pointerY) * strength)) : pointerY;
      node.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      if (view && node.dataset.visible === "true") frame = requestAnimationFrame(checkView);
    };
    const hide = () => {
      node.dataset.visible = "false";
      node.dataset.view = "false";
      node.dataset.arrow = "false";
      cancelAnimationFrame(frame);
      frame = 0;
      lastMove = lastFrame = 0;
      speed = 0;
      ringScale = 1;
      delete root.dataset.circleCursor;
    };
    const move = (event: PointerEvent) => {
      const target = event.target;
      if (!media.matches || event.pointerType !== "mouse" || (event.buttons && !(target instanceof Element && target.closest(".collection-carousel-viewport"))) || document.hidden || event.clientX < 0 || event.clientY < 0 || event.clientX >= root.clientWidth || event.clientY >= root.clientHeight || !(target instanceof Element) || target.closest(nativeSelector) || window.getSelection()?.isCollapsed === false) {
        hide();
        return;
      }
      const now = performance.now();
      if (node.dataset.visible !== "true") {
        ringX = event.clientX;
        ringY = event.clientY;
        speed = 0;
      } else if (lastMove) {
        const elapsed = Math.max(8, now - lastMove);
        speed = speed * 0.35 + Math.min(5, Math.hypot(event.clientX - pointerX, event.clientY - pointerY) / elapsed) * 0.65;
      }
      lastMove = now;
      pointerX = event.clientX;
      pointerY = event.clientY;
      node.style.transform = "translate3d(" + event.clientX + "px," + event.clientY + "px,0)";
      node.dataset.hover = String(Boolean(target.closest('a[href], button:not(:disabled), summary, [role="button"]')));
      node.dataset.visible = "true";
      root.dataset.circleCursor = "active";
      cancelAnimationFrame(frame);
      checkView();
    };
    const down = (event: PointerEvent) => { if (!(event.target instanceof Element && event.target.closest(".collection-carousel-viewport"))) hide(); };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    const selection = () => { if (window.getSelection()?.isCollapsed === false) hide(); };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    root.addEventListener("pointerleave", hide, { passive: true });
    root.addEventListener("mouseleave", hide, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointercancel", hide, { passive: true });
    document.addEventListener("dragstart", hide);
    document.addEventListener("keydown", hide);
    document.addEventListener("selectionchange", selection);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    media.addEventListener("change", hide);
    return () => {
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
      root.removeEventListener("pointerleave", hide);
      root.removeEventListener("mouseleave", hide);
      document.removeEventListener("pointerdown", hide);
      document.removeEventListener("pointercancel", hide);
      document.removeEventListener("dragstart", hide);
      document.removeEventListener("keydown", hide);
      document.removeEventListener("selectionchange", selection);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
      media.removeEventListener("change", hide);
    };
  }, [pathname]);

  return <div ref={ref} className="circle-cursor" data-visible="false" aria-hidden="true"><svg width="0" height="0" aria-hidden="true"><defs><filter id={gooId} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop" /></filter></defs></svg><span className="circle-cursor-halo" style={{ filter: `url(#${gooId})` }}><span className="cursor-liquid-core" /><span className="cursor-liquid-tail" /></span><span className="circle-cursor-ring"><span className="circle-cursor-dot" /><span className="circle-cursor-label"><span className="cursor-drag-label">DRAG</span><span className="cursor-view-label">VIEW</span></span></span></div>;
}
