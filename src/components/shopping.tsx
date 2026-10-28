"use client";
import { useState } from "react";
import Link from "next/link";
import { WatchImage as Image } from "./watch-image";
import {
  Heart,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useStore } from "./store";
import { Product, products, money } from "@/data/products";
import { ProductGrid } from "./products";
import { Button } from "./ui";
export function WishlistButton({
  id,
  label = false,
}: {
  id: string;
  label?: boolean;
}) {
  const { state, toggle, ready } = useStore();
  const saved = state.wishlist.includes(id);
  return (
    <button
      disabled={!ready}
      className={label ? "wishlist-text" : "wishlist-button"}
      onClick={() => toggle(id)}
      aria-label={`${saved ? "Remove from" : "Add to"} wishlist`}
      aria-pressed={saved}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
      {label && (saved ? "Saved to wishlist" : "Add to wishlist")}
    </button>
  );
}
export function QuantitySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="quantity">
      <button
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={14} />
      </button>
      <output aria-live="polite">{value}</output>
      <button
        aria-label="Increase quantity"
        disabled={value >= 99}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
export function ProductActions({ product }: { product: Product }) {
  const [n, setN] = useState(1);
  const { add, ready } = useStore();
  return (
    <div className="product-actions">
      <p className="eyebrow">QUANTITY</p>
      <div className="purchase-row">
        <QuantitySelector value={n} onChange={setN} />
        <Button disabled={!ready} onClick={() => add(product.slug, n)}>
          Add to bag <ShoppingBag size={17} />
        </Button>
      </div>
      <WishlistButton id={product.slug} label />
      <p className="small muted">
        A considered choice, at your own pace. Your bag is saved on this device.
      </p>
    </div>
  );
}
export function EmptyState({ kind }: { kind: "wishlist" | "bag" }) {
  return (
    <div className="empty-state">
      {kind === "bag" ? (
        <ShoppingBag size={36} strokeWidth={1} />
      ) : (
        <Heart size={36} strokeWidth={1} />
      )}
      <h2>
        {kind === "bag"
          ? "Your next chapter awaits."
          : "Keep what speaks to you."}
      </h2>
      <p>
        {kind === "bag"
          ? "Your shopping bag is currently empty."
          : "Save your favourite timepieces and revisit them here."}
      </p>
      <Link href="/watches" className="button">
        Explore watches <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function SavedProducts() {
  const { state, ready } = useStore();
  if (!ready) return <p role="status">Loading your wishlist…</p>;
  const items = products.filter((p) => state.wishlist.includes(p.slug));
  return items.length ? (
    <ProductGrid items={items} />
  ) : (
    <EmptyState kind="wishlist" />
  );
}
export function ShoppingBagItem({
  product: p,
  count,
}: {
  product: Product;
  count: number;
}) {
  const { quantity } = useStore();
  return (
    <article className="bag-item">
      <Link href={`/watches/${p.slug}`} className="bag-image">
        <Image src={p.image} alt={p.name} fill sizes="140px" />
      </Link>
      <div>
        <p className="eyebrow">{p.category}</p>
        <Link href={`/watches/${p.slug}`}>
          <h3>{p.name}</h3>
        </Link>
        <p className="muted">
          {p.color} · {money(p.price)} each
        </p>
        <QuantitySelector value={count} onChange={(n) => quantity(p.slug, n)} />
      </div>
      <div className="bag-item-end">
        <span>{money(p.price * count)}</span>
        <button
          aria-label={`Remove ${p.name} from bag`}
          onClick={() => quantity(p.slug, 0)}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}
export function Bag() {
  const { state, ready } = useStore();
  if (!ready) return <p role="status">Loading your bag…</p>;
  const items = products.filter((p) => state.bag[p.slug]);
  if (!items.length) return <EmptyState kind="bag" />;
  const total = items.reduce((sum, p) => sum + p.price * state.bag[p.slug], 0);
  return (
    <div className="bag-layout">
      <div>
        {items.map((p) => (
          <ShoppingBagItem key={p.slug} product={p} count={state.bag[p.slug]} />
        ))}
      </div>
      <aside className="order-summary">
        <p className="eyebrow">YOUR SELECTION</p>
        <h2>Bag summary</h2>
        <div className="summary-line">
          <span>Subtotal</span>
          <span>{money(total)}</span>
        </div>
        <div className="summary-line total">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
        <p className="demo-note">
          This is a demonstration storefront. Checkout and payments are
          unavailable. No order will be placed.
        </p>
        <Link href="/watches" className="button">
          Continue exploring <ArrowRight size={16} />
        </Link>
      </aside>
    </div>
  );
}
