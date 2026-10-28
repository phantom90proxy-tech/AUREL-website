import type { Product } from "./products";

export type ComponentType = "dial" | "movement" | "case" | "strap" | "additional";
export interface TimepieceComponent {
  productId: string;
  type: ComponentType;
  title: string;
  navigation: string;
  description: string;
  specifications: { label: string; value: string }[];
  image?: { src: string; alt: string; caption: string };
}

/** Keep the catalog authoritative. General product colors are not dial or strap specifications. */
export function getLimitedAnatomy(product: Product): TimepieceComponent[] {
  const definitions: { type: ComponentType; title: string; navigation: string; labels: string[]; description: string; fallback: string }[] = [
    { type: "dial", title: "The Dial", navigation: "Dial", labels: ["Dial", "Dial Color", "Dial Finish", "Hour Markers", "Hands"], description: "The recorded dial details of this timepiece.", fallback: "Dial details not yet available" },
    { type: "movement", title: "The Calibre / Movement", navigation: "Calibre", labels: ["Movement", "Calibre", "Power Reserve"], description: "The documented movement specifications. A calibre designation has not been recorded.", fallback: "Movement details not yet available" },
    { type: "case", title: "The Case & Crown", navigation: "Case", labels: ["Case", "Case Material", "Case Diameter", "Case Finish", "Crown", "Bezel"], description: "The recorded case specification. Crown and bezel details have not been documented.", fallback: "Case details not yet available" },
    { type: "strap", title: "The Strap / Bracelet", navigation: "Strap", labels: ["Strap", "Bracelet", "Buckle", "Clasp"], description: "The strap information documented for this watch.", fallback: "Strap details not yet available" },
    { type: "additional", title: "Additional Details", navigation: "Additional", labels: ["Water Resistance", "Crystal", "Caseback", "Functions", "Display", "Dimensions"], description: "Further specifications recorded in the AUREL catalog.", fallback: "Additional details not yet available" },
  ];
  return definitions.map(({ labels, fallback, ...definition }) => {
    const specifications = product.details.specifications.filter(spec => labels.includes(spec.label));
    const assetParts: Partial<Record<ComponentType, string>> = { dial: "Dial", movement: "Calibre-Concept", case: "Case", strap: "Strap" };
    const part = assetParts[definition.type];
    const hasComponentArtwork = ["aurora", "eclipse", "solace", "glen"].includes(product.slug);
    const concept = definition.type === "movement";
    const image = part && hasComponentArtwork ? {
      src: `/images/AUREL-Limited-Edition-16-Components/AUREL-${product.name}-${part}.webp`,
      alt: `${product.name} — ${concept ? "calibre concept illustration" : definition.navigation.toLowerCase() + " detail artwork"}`,
      caption: concept ? `${product.name} / Calibre concept illustration — not a verified movement photograph` : `${product.name} / ${definition.navigation} detail`,
    } : undefined;
    return { ...definition, productId: product.id, specifications, image, description: specifications.length ? definition.description : fallback };
  });
}
