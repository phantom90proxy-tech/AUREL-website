"use client";

import Image from "next/image";
import { motion, useInView } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const photographs = [
  { name: "Glen", src: "/images/hero/glen.webp", alt: "Glen green-dial watch with a dark green leather strap on an ivory surface" },
  { name: "Aurora Emerald", src: "/images/hero/aurora-emerald.webp", alt: "Aurora emerald-green dial watch with rose-gold case and green leather strap on an ivory surface" },
  { name: "Aurora", src: "/images/hero/aurora.webp", alt: "Aurora blue-dial watch with moon detail and dark leather strap in soft ivory light" },
];

export function HeroPhotography() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const reduced = useMotionPreference() !== false;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (reduced || paused || !inView || !visible) return;
    const timer = window.setInterval(() => setActive(value => (value + 1) % photographs.length), 7000);
    return () => window.clearInterval(timer);
  }, [reduced, paused, inView, visible, active]);

  return <div ref={ref} className="hero-photography" role="group" aria-label="AUREL editorial watch photography" data-active={active}>
    {photographs.map((photo, index) => <motion.div key={photo.name} className="hero-photograph" initial={false} animate={{ opacity: active === index ? 1 : 0 }} transition={{ duration: reduced ? 0 : 1, ease: "easeInOut" }} aria-hidden={active !== index}>
      <Image src={photo.src} alt={photo.alt} fill sizes="100vw" preload={index === 0} loading={index === 0 ? undefined : "eager"} />
    </motion.div>)}
    <div className="hero-photo-controls">
      {photographs.map((photo, index) => <button type="button" key={photo.name} className="hero-photo-indicator" aria-label={"Show " + photo.name + " photograph"} aria-pressed={active === index} onClick={() => { setActive(index); setPaused(true); }}><span /></button>)}
      <button type="button" className="hero-photo-pause" aria-label={paused || reduced ? "Play hero photographs" : "Pause hero photographs"} disabled={reduced} onClick={() => setPaused(value => !value)}>{paused || reduced ? <Play size={13} /> : <Pause size={13} />}</button>
    </div>
  </div>;
}
