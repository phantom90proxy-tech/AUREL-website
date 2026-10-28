"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const phrases = [
  "personal style.",
  "timeless elegance.",
  "modern sophistication.",
  "individuality.",
  "everyday moments.",
  "your story.",
] as const;

export function RotatingPhrase() {
  const [index, setIndex] = useState(0);
  const reduced = useMotionPreference();

  useEffect(() => {
    if (reduced !== false) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const phrase = phrases[reduced ? 0 : index];
  return (
    <>
      <span className="sr-only">personal style.</span>
      <em className="rotating-phrase" aria-hidden="true">
        {/* Shared grid cells reserve only the widest phrase's natural bounds. */}
        {phrases.map((text) => (
          <span className="rotating-phrase-measure" key={text}>
            {text}
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span
            className="rotating-phrase-text"
            key={phrase}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -10 }}
            transition={{
              duration: reduced ? 0 : 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {phrase}
          </motion.span>
        </AnimatePresence>
      </em>
    </>
  );
}
