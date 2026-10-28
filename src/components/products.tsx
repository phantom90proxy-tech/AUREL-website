import { WatchImage as Image } from "./watch-image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Product, money, collections } from "@/data/products";
import { WishlistButton } from "./shopping";
import type { CSSProperties } from "react";
import { imageFraming } from "@/data/image-framing";
import { GridEntrance } from "./motion";
export function ProductCard({ product: p }: { product: Product }) {
  const framing = imageFraming[p.slug];
  const cutout = Boolean(framing.cardImage);
  return (
    <article className="product-card" data-product={p.slug}>
      <div className="product-image">
        <Link href={`/watches/${p.slug}`} aria-label={`Discover ${p.name}`}>
          <Image
            src={framing.cardImage ?? p.image}
            alt={`${p.name} — ${p.color}`}
            fill
            sizes="(max-width:580px) 55vw,(max-width:760px) 60vw,(max-width:1600px) 30vw,480px"
            style={{
              objectFit: cutout ? "contain" : "cover",
              objectPosition: "center",
            }}
            className={
              p.slug === "aster" ? "product-photo-balanced" : undefined
            }
          />
        </Link>
        <WishlistButton id={p.slug} />
      </div>
      <div className="product-info">
        <div>
          <p className="eyebrow">{p.category}</p>
          <Link href={`/watches/${p.slug}`}>
            <h3>{p.name}</h3>
          </Link>
          <p className="muted">{p.color}</p>
        </div>
        <span>{money(p.price)}</span>
      </div>
    </article>
  );
}
export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <GridEntrance>
      {items.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </GridEntrance>
  );
}
export function CollectionCard({
  collection: c,
  index = 0,
  showCaption = true,
}: {
  collection: (typeof collections)[number];
  index?: number;
  showCaption?: boolean;
}) {
  return (
    <Link
      href={`/watches?collection=${encodeURIComponent(c.name)}`}
      className="collection-card"
      data-collection-product={c.imageProduct}
    >
      <div
        className="collection-image"
        style={
          {
            "--collection-scale": c.imageProduct === "aster" ? 1.08 : 1,
            "--collection-hover-scale":
              (c.imageProduct === "aster" ? 1.08 : 1) * 1.025,
          } as CSSProperties
        }
      >
        <Image
          src={c.image}
          alt={c.name}
          fill
          sizes="(max-width:600px) 90vw,33vw"
          style={{
            objectPosition: c.imageProduct === "chrono" ? "50% 54%" : "50% 50%",
          }}
        />
      </div>
      {showCaption && (
        <div className="collection-caption">
          <span className="eyebrow">0{index + 1} / THE COLLECTION</span>
          <h3>
            {c.name.replace(" Collection", "")}
            <ArrowUpRight size={22} />
          </h3>
          <p>{c.description}</p>
        </div>
      )}
    </Link>
  );
}
