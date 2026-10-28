"use client";
import { WatchImage as Image } from "./watch-image";
import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import type { Product } from "@/data/products";
const alternatives: Record<string, string> = {
  aurora: "/images/optimized/Aurora.png.webp",
  eclipse: "/images/optimized/Eclipse.png.webp",
  solace: "/images/optimized/Solace.png.webp",
  glen: "/images/optimized/Glen.png.webp",
};
export function ProductGallery({ product: p }: { product: Product }) {
  const images = [...new Set([p.image, alternatives[p.slug]].filter(Boolean))];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  return (
    <div className="gallery">
      <button
        className={`detail-image gallery-main ${zoom ? "zoomed" : ""}`}
        aria-label={zoom ? "Show full watch" : "Enlarge watch image"}
        aria-pressed={zoom}
        onClick={() => setZoom(!zoom)}
      >
        <span className="gallery-zoom-control" aria-hidden="true">{zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}</span>
        <Image
          src={images[active]}
          fit="contain"
          alt={`${p.name} in ${p.color}, view ${active + 1}`}
          fill
          preload
          sizes="(max-width:700px) 100vw,50vw"
        />
      </button>
      {images.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Product image views">
          {images.map((src, i) => (
            <button
              key={src}
              aria-label={`Show view ${i + 1}`}
              aria-pressed={active === i}
              onClick={() => {
                setActive(i);
                setZoom(false);
              }}
            >
              <Image src={src} alt="" fill sizes="75px" />
            </button>
          ))}
        </div>
      )}
      <p className="small muted">
        {p.name} / {p.color} / Select image to enlarge
      </p>
    </div>
  );
}
