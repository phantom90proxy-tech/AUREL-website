import type { Product } from "@/data/products";
export interface LimitedPresentation {
  heading: string;
  artwork: string;
  storyImage: string;
  storyRatio: "wide" | "square";
  alternate?: string;
  galleryRatio?: string;
}
export const limitedPresentations: Record<string, LimitedPresentation> = {
  aurora: { heading: "An expression of changing light.", artwork: "/images/optimized/Aurora.jpg.webp", alternate: "/images/optimized/Aurora.png.webp", storyImage: "/images/hero/aurora-malachite-product.webp", storyRatio: "wide" },
  eclipse: { heading: "A distinct point of view.", artwork: "/images/optimized/Eclipse.jpg.webp", alternate: "/images/optimized/Eclipse.png.webp", storyImage: "/images/collections/eclipse-v2.webp", storyRatio: "wide" },
  solace: { heading: "Quietly balanced.", artwork: "/images/optimized/Solace.png.webp", alternate: "/images/optimized/Solace (2).png.webp", storyImage: "/images/hero/solace-travertine.webp", storyRatio: "wide" },
  glen: { heading: "A relaxed classic.", artwork: "/images/optimized/Glen.png.webp", alternate: "/images/optimized/Glen (2).png.webp", storyImage: "/images/hero/glen-mossy-stone.webp", storyRatio: "wide" },
};
export function isLimitedEdition(product: Product) {
  return product.category === "Limited Edition" && Object.hasOwn(limitedPresentations, product.slug);
}
