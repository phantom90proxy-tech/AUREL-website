import { Catalog } from "@/components/catalog";
import { Suspense } from "react";
import { Reveal } from "@/components/motion";
export const metadata = { title: "All Watches" };
export default function Page() {
  return <div className="section page-section watches-page luxury-catalog">
    <Reveal className="watches-introduction" duration={0.5}>
      <p className="eyebrow">AUREL / TIMEPIECES</p>
      <h1>All Watches</h1>
      <p className="catalog-intro-description">Discover the AUREL collection. A selection of timepieces for every style, occasion, and moment.</p>
    </Reveal>
    <Suspense fallback={<p>Loading the collection...</p>}><Catalog /></Suspense>
  </div>;
}
