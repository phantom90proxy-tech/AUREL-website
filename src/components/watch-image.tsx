import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";
import { watchImageCrops } from "@/data/watch-image-crops";

/** Crop the source's top edge in the layout, without retouching the photograph. */
export function WatchImage({ fit = "cover", ...props }: ImageProps & { fit?: "cover" | "contain" }) {
  const crop = typeof props.src === "string" ? watchImageCrops[props.src] : undefined;
  if (!crop || !props.fill) return <Image {...props} alt={props.alt} />;
  const ratio = crop.width / (crop.height * (1 - crop.top));
  const sizing = fit === "contain" ? "min" : "max";
  const frame: CSSProperties = {
    position: "absolute", inset: 0, overflow: "hidden", display: "grid",
    placeItems: "center", containerType: "size", pointerEvents: "none",
  };
  return <span style={frame} data-watch-crop="top-edge">
    <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", overflow: "hidden", width: `${sizing}(100cqw, ${ratio * 100}cqh)`, height: `${sizing}(100cqh, ${100 / ratio}cqw)` }}>
      <span style={{ position: "absolute", left: 0, width: "100%", height: `${100 / (1 - crop.top)}%`, top: `${-100 * crop.top / (1 - crop.top)}%` }}>
        <Image {...props} alt={props.alt} />
      </span>
    </span>
  </span>;
}
