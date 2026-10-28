"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, useInView } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { usePathname } from "next/navigation";

const ease = [0.22, 1, 0.36, 1] as const;

/** HTML is visible by default, including when JS or IntersectionObserver fails. */
export function Reveal({
  children,
  className,
  duration = 0.5,
  delay = 0,
  distance = 16,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.12 });
  const reduced = useMotionPreference();
  useEffect(() => {
    const node = ref.current;
    if (!node || !visible || reduced !== false) return;
    const animation = animate(
      node,
      { opacity: [0, 1], y: [distance, 0] },
      { duration, delay, ease },
    );
    const reset = () => {
      node.style.removeProperty("opacity");
      node.style.removeProperty("transform");
    };
    void animation.then(reset);
    return () => {
      animation.stop();
      reset();
    };
  }, [visible, reduced, duration, delay, distance]);
  return (
    <div ref={ref} className={className} data-reveal>
      {children}
    </div>
  );
}

export function GridEntrance({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: "some" });
  const reduced = useMotionPreference();
  useEffect(() => {
    if (!visible || reduced !== false || !ref.current) return;
    const cards = Array.from(ref.current.children) as HTMLElement[];
    // Cap the entire stagger at 100ms, including the full 30-watch catalog.
    const animations = cards.map((card, i) =>
      animate(
        card,
        { opacity: [0.8, 1], y: [8, 0] },
        { duration: 0.3, delay: Math.min(i, 4) * 0.025, ease },
      ),
    );
    const reset = () =>
      cards.forEach((card) => {
        card.style.removeProperty("opacity");
        card.style.removeProperty("transform");
      });
    void Promise.all(animations).then(reset);
    return () => {
      animations.forEach((animation) => animation.stop());
      reset();
    };
  }, [visible, reduced, children]);
  return (
    <div ref={ref} className="product-grid" data-grid-entrance>
      {children}
    </div>
  );
}

/** Animate arriving content without remounting it or intercepting navigation. */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const previous = useRef(path);
  const reduced = useMotionPreference();
  useEffect(() => {
    const changed = previous.current !== path;
    previous.current = path;
    const node = ref.current;
    if (!changed || !node || reduced !== false) return;
    const animation = animate(
      node,
      { opacity: [0.65, 1], y: [6, 0] },
      { duration: 0.26, ease },
    );
    const reset = () => {
      node.style.removeProperty("opacity");
      node.style.removeProperty("transform");
    };
    void animation.then(reset);
    return () => {
      animation.stop();
      reset();
    };
  }, [path, reduced]);
  return (
    <div ref={ref} data-page-transition>
      {children}
    </div>
  );
}
