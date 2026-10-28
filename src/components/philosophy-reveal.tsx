"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, useInView } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const ease = [0.22, 1, 0.36, 1] as const;

/** Content is visible in server HTML; motion progressively enhances it. */
export function PhilosophyReveal({
  image,
  children,
}: {
  image: ReactNode;
  children: ReactNode;
}) {
  const imageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const imageVisible = useInView(imageRef, { once: true, amount: 0.12 });
  const copyVisible = useInView(copyRef, { once: true, amount: 0.15 });
  const reduced = useMotionPreference();

  useEffect(() => {
    const image = imageRef.current?.querySelector("img");
    if (!image || !imageVisible || reduced !== false) return;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const animation = animate(
      image,
      { opacity: [0, 1], y: [mobile ? 10 : 18, 0] },
      { duration: 0.8, delay: 0.45, ease },
    );
    const reset = () => {
      image.style.removeProperty("opacity");
      image.style.removeProperty("transform");
    };
    void animation.then(reset);
    return () => {
      animation.stop();
      reset();
    };
  }, [imageVisible, reduced]);

  useEffect(() => {
    const copy = copyRef.current;
    if (!copy || !copyVisible || reduced !== false) return;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const elements = Array.from(copy.children) as HTMLElement[];
    const animations = elements.map((element, index) =>
      animate(
        element,
        { opacity: [0, 1], y: [mobile ? 10 : 18, 0] },
        {
          duration: index === 1 ? 0.7 : 0.5,
          delay: index * 0.15,
          ease,
        },
      ),
    );
    const reset = () =>
      elements.forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
      });
    void Promise.all(animations).then(reset);
    return () => {
      animations.forEach((animation) => animation.stop());
      reset();
    };
  }, [copyVisible, reduced]);

  return (
    <section
      className="watch-philosophy"
      aria-labelledby="watch-philosophy-title"
    >
      <div ref={copyRef} className="section philosophy-copy">
        {children}
      </div>
      <div ref={imageRef} className="watch-detail">
        {image}
      </div>
    </section>
  );
}
