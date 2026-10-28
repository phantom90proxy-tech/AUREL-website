"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { collections, products, money } from "@/data/products";
import { useMotionPreference } from "@/hooks/use-motion-preference";

export const priceBounds = { min: Math.min(...products.map(p => p.price)), max: Math.max(...products.map(p => p.price)) };
export interface CatalogFilters { category: string; min: number; max: number }

export function FilterDrawer({ filters, search, onApply }: { filters: CatalogFilters; search: string; onApply: (filters: CatalogFilters) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(filters.category);
  const [minimum, setMinimum] = useState(String(filters.min));
  const [maximum, setMaximum] = useState(String(filters.max));
  const [error, setError] = useState("");
  const reduced = useMotionPreference() !== false;
  const min = minimum === "" ? priceBounds.min : Number(minimum);
  const max = maximum === "" ? priceBounds.max : Number(maximum);
  const count = products.filter(p => (!category || p.category === category) && p.price >= min && p.price <= max && (p.name + " " + p.category + " " + p.color).toLowerCase().includes(search.trim().toLowerCase())).length;
  const active = Number(Boolean(filters.category)) + Number(filters.min > priceBounds.min || filters.max < priceBounds.max);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);
  useEffect(() => () => { animation.current?.stop(); }, []);
  const close = () => {
    if (!dialog.current?.open || !panel.current) return;
    animation.current?.stop();
    if (reduced) { dialog.current.close(); setOpen(false); return; }
    animation.current = animate(panel.current, { x: [0, "100%"], opacity: [1, 0] }, { duration: 0.22, ease: [0.22, 1, 0.36, 1] });
    void animation.current.then(() => { dialog.current?.close(); setOpen(false); });
  };
  const show = () => {
    setCategory(filters.category); setMinimum(String(filters.min)); setMaximum(String(filters.max)); setError("");
    dialog.current?.showModal(); setOpen(true);
    if (panel.current) {
      animation.current?.stop();
      animation.current = animate(panel.current, { x: [reduced ? 0 : "100%", 0], opacity: [reduced ? 1 : 0, 1] }, { duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] });
    }
  };
  return <>
    <button type="button" className="catalog-filter-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={show}><SlidersHorizontal size={16} aria-hidden="true" />Filters{active > 0 && <span className="catalog-filter-count">{active}</span>}</button>
    <dialog ref={dialog} className="catalog-filter-dialog" aria-labelledby="catalog-filter-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={panel} className="catalog-filter-sheet">
        <div className="catalog-filter-heading"><div><p className="eyebrow">REFINE YOUR SELECTION</p><h2 id="catalog-filter-title">Filters</h2></div><button type="button" className="catalog-filter-close" aria-label="Close filters" onClick={close}><X size={20} /></button></div>
        <form onSubmit={event => { event.preventDefault(); if (min > max) { setError("Minimum price must not exceed maximum price."); return; } onApply({ category, min, max }); close(); }}>
          <div className="catalog-filter-body">
            <label className="drawer-field"><span>Collection</span><select aria-label="Filter by collection" value={category} onChange={event => setCategory(event.target.value)}><option value="">All watches</option>{collections.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></label>
            <fieldset><legend>Price range</legend><p className="catalog-price-note">{money(priceBounds.min)} to {money(priceBounds.max)}</p><div className="catalog-price-fields"><label>Minimum price<input type="number" inputMode="numeric" min={priceBounds.min} max={priceBounds.max} step="1" value={minimum} onChange={event => { setMinimum(event.target.value); setError(""); }} /></label><label>Maximum price<input type="number" inputMode="numeric" min={priceBounds.min} max={priceBounds.max} step="1" value={maximum} onChange={event => { setMaximum(event.target.value); setError(""); }} /></label></div>{error && <p className="catalog-filter-error" role="alert">{error}</p>}</fieldset>
            <button type="button" className="drawer-clear" onClick={() => { setCategory(""); setMinimum(String(priceBounds.min)); setMaximum(String(priceBounds.max)); setError(""); }}>Clear filters</button>
          </div>
          <div className="catalog-filter-footer"><button className="button" type="submit">Show {count} {count === 1 ? "timepiece" : "timepieces"}</button></div>
        </form>
      </div>
    </dialog>
  </>;
}
