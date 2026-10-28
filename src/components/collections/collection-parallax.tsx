"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

/** Moves only the photograph; the link, campaign dimensions and copy stay fixed. */
export function CollectionParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference() !== false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["-1.8%", "1.8%"]);
  return <div ref={ref} className="collection-parallax">
    <motion.div className="collection-parallax-art" initial={false} style={{ y: reduced ? 0 : drift }} animate={{ scale: reduced ? 1 : 1.05 }} transition={{ duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
  </div>;
}
