"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { products, collections } from "@/data/products";
import { ProductGrid } from "./products";
import { FilterDrawer, priceBounds } from "./catalog/filter-drawer";
export function SearchBar({
  value,
  onChange,
  focus,
}: {
  value: string;
  onChange: (s: string) => void;
  focus?: boolean;
}) {
  return (
    <label className="search-bar">
      <Search size={18} aria-hidden="true" />
      <input
        autoFocus={focus}
        type="search"
        placeholder="Find your timepiece"
        aria-label="Search watches"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function FilterControls({
  sort,
  setSort,
}: {
  sort: string;
  setSort: (s: string) => void;
}) {
  return (
    <div className="filter-controls">
      <label>
        <span className="catalog-filter-label" aria-hidden="true">Sort by</span>
        <span className="catalog-select-value" aria-hidden="true">{{ featured: "Featured", low: "Price: Low to high", high: "Price: High to low", name: "Name: A?Z" }[sort]}</span>
        <select
          aria-label="Sort watches"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="low">Price: Low to high</option>
          <option value="high">Price: High to low</option>
          <option value="name">Name: A–Z</option>
        </select>
        <ChevronDown className="catalog-select-arrow" size={15} aria-hidden="true" />
      </label>
    </div>
  );
}
export function Catalog() {
  const query = useSearchParams();
  return (
    <CatalogContent
      key={query.toString()}
      initialCategory={query.get("collection") || ""}
      focus={query.get("search") === "1"}
    />
  );
}
function CatalogContent({
  initialCategory,
  focus,
}: {
  initialCategory: string;
  focus: boolean;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const [range, setRange] = useState({ min: priceBounds.min, max: priceBounds.max });
  const [visibleCount, setVisibleCount] = useState(12);
  const changeCategory = (value: string) => { setCategory(value); setVisibleCount(12); };
  const changeSearch = (value: string) => { setSearch(value); setVisibleCount(12); };
  const changeSort = (value: string) => { setSort(value); setVisibleCount(12); };
  const clear = () => { setSearch(""); setCategory(""); setSort("featured"); setRange({ min: priceBounds.min, max: priceBounds.max }); setVisibleCount(12); };
  const filtered = Boolean(search || category || sort !== "featured" || range.min > priceBounds.min || range.max < priceBounds.max);
  const items = products
    .filter(
      (p) =>
        (!category || p.category === category) && p.price >= range.min && p.price <= range.max &&
        `${p.name} ${p.category} ${p.color}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : 0,
    );
  return (
    <>
      <div className="catalog-collection-shortcuts" role="group" aria-label="Quick collection filters">
        {[{ name: "All watches", value: "" }, ...collections.map(collection => ({ name: collection.name, value: collection.name }))].map(collection => <button type="button" key={collection.name} aria-label={collection.name} aria-pressed={category === collection.value} onClick={() => changeCategory(collection.value)}><span>{collection.name}</span><span className="catalog-category-count" aria-hidden="true">{collection.value ? products.filter(product => product.category === collection.value).length : products.length}</span></button>)}
      </div>
      <div className="catalog-controls">
        <SearchBar value={search} onChange={changeSearch} focus={focus} />
      </div>
      <div className="catalog-results-toolbar">
        <div className="catalog-toolbar-leading">
          <FilterDrawer filters={{ category, ...range }} search={search} onApply={next => { setCategory(next.category); setRange({ min: next.min, max: next.max }); setVisibleCount(12); }} />
          <p className="result-count" aria-live="polite">{items.length} timepieces{category ? ` / ${category}` : ""}</p>
        </div>
        <FilterControls sort={sort} setSort={changeSort} />
        {filtered && <button className="catalog-reset" type="button" onClick={clear}>Reset filters <span aria-hidden="true">&times;</span></button>}
      </div>
      {items.length ? (
        <ProductGrid items={items.slice(0, visibleCount)} />
      ) : (
        <div className="empty-state">
          <h2>No timepieces found.</h2>
          <button
            className="button"
            onClick={clear}
          >
            Clear filters
          </button>
        </div>
      )}
      {items.length > 0 && <div className="catalog-load-more"><p aria-live="polite">Showing {Math.min(visibleCount, items.length)} of {items.length} timepieces</p>{visibleCount < items.length && <button type="button" className="catalog-see-more" onClick={() => setVisibleCount(value => value + 12)}>See more</button>}</div>}
      <div className="catalog-end">
        <span>Find a watch that feels like you.</span>
        <Link href="/collections">
          Explore the collections <ArrowUpRight size={16} />
        </Link>
      </div>
    </>
  );
}
