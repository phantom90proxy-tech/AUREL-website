"use client";

import { WatchImage as Image } from "@/components/watch-image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

export function LimitedGallery({ name, artwork, alternate, ratio }: { name: string; artwork: string; alternate?: string; ratio?: string }) {
  const images = [{ src: artwork, label: "Original artwork" }, ...(alternate && alternate !== artwork ? [{ src: alternate, label: "Studio artwork" }] : [])];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const reduced = useMotionPreference() !== false;
  return <div className="limited-gallery">
    <button type="button" className={"gallery-main limited-gallery-main" + (zoom ? " zoomed" : "")} style={ratio ? { aspectRatio: ratio } : undefined} aria-label={zoom ? "Show full watch" : "Enlarge watch image"} aria-pressed={zoom} onClick={() => setZoom(value => !value)}>
      <AnimatePresence initial={false} mode="wait"><motion.span key={images[active].src} className="limited-gallery-frame" initial={{ opacity: reduced ? 1 : 0.3 }} animate={{ opacity: 1 }} exit={{ opacity: reduced ? 1 : 0.3 }} transition={{ duration: reduced ? 0 : 0.2 }}>
        <Image src={images[active].src} fit="contain" alt={name + " - " + images[active].label} fill sizes="(max-width: 760px) 90vw, 540px" preload={active === 0} />
      </motion.span></AnimatePresence>
      <span className="limited-gallery-zoom" aria-hidden="true">{zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}</span>
    </button>
    <div className="limited-gallery-bottom"><p>{images[active].label}</p><span>{active + 1} / {images.length}</span></div>
    {images.length > 1 && <div className="gallery-thumbnails" role="group" aria-label="Product image views">{images.map((image, index) => <button type="button" key={image.src} aria-label={"Show view " + (index + 1)} aria-pressed={active === index} onClick={() => { setActive(index); setZoom(false); }}><Image src={image.src} alt={image.label} fill sizes="70px" /></button>)}</div>}
  </div>;
}
