import { watches } from "./original-watches";
export const products = watches.map((p) => ({
  ...p,
  slug: p.id.toLowerCase(),
  image: p.image
    .replace("assets/Watch/", "/images/optimized/")
    .replace(/\.(png|jpg)$/i, ".$1.webp"),
}));
export type Product = (typeof products)[number];
export const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
export const collections = [...new Set(products.map((p) => p.category))].map(
  (name, i) => {
    // Portrait compositions selected from the same collection, without changing
    // product records or substituting a different watch for any product card.
    const preferred =
      name === "Minimal Collection"
        ? "linea"
        : name === "Limited Edition"
          ? "eclipse"
          : undefined;
    const product =
      products.find((p) => p.slug === preferred) ??
      products.find((p) => p.category === name)!;
    return {
      name,
      image: product.image,
      imageProduct: product.slug,
      description:
        [
          "Enduring forms. An effortless presence.",
          "For the moments that move you.",
          "Extraordinary details. A different perspective.",
          "Precision in every passing second.",
          "Less, considered more.",
        ][i] || "A considered expression of time.",
    };
  },
);
