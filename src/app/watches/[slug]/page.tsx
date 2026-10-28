import { notFound } from "next/navigation";
import { isLimitedEdition } from "@/data/limited-edition-presentation";
import { LimitedProductDetail } from "@/components/limited-editions/limited-product-detail";
import { ProductGallery } from "@/components/gallery";
import Link from "next/link";
import { products, money } from "@/data/products";
import { ProductActions } from "@/components/shopping";
import { ProductGrid } from "@/components/products";
import { Reveal } from "@/components/motion";
import { ProductDisclosure } from "@/components/products/product-disclosure";
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: products.find((p) => p.slug === slug)?.name || "Watch not found",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  if (isLimitedEdition(p)) return <LimitedProductDetail product={p} />;
  return (
    <>
      <div className="section product-detail detail-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/watches">All watches</Link>
          <span aria-hidden="true">/</span>
          <Link href={"/watches?collection=" + encodeURIComponent(p.category)}>{p.category}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{p.name}</span>
        </nav>
        <div className="detail-grid">
          <ProductGallery product={p} />
          <Reveal className="detail-copy" duration={0.55}>
            <p className="eyebrow">{p.category}</p>
            <h1>{p.name}</h1>
            <p className="detail-price">{money(p.price)}</p>
            <div className="detail-variation"><span>Color</span><strong>{p.color}</strong></div>
            <p className="detail-description">{p.description}</p>
            <ProductActions product={p} />
            <dl className="detail-highlights">
              {p.details.specifications.slice(0, 3).map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
            </dl>
          </Reveal>
        </div>
        <section className="product-information" aria-labelledby="product-information-title">
          <Reveal className="product-specifications" duration={0.55}>
            <p className="eyebrow">A CLOSER LOOK</p>
            <h2 id="product-information-title">The details.</h2>
            <dl>{p.details.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
          </Reveal>
          <Reveal className="product-care-information" duration={0.55}>
            <p className="eyebrow">YOUR TIMEPIECE</p>
            <h2>Care &amp; assurance.</h2>
            <ProductDisclosure title="Care guide"><p>{p.details.careGuide}</p></ProductDisclosure>
            <ProductDisclosure title="Warranty"><p>{p.details.warranty}</p><p className="small muted">Original product information. This demonstration does not process purchases or warranty claims.</p></ProductDisclosure>
          </Reveal>
        </section>
      </div>
      <section className="section detail-related">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CONTINUE EXPLORING</p>
            <h2>A different perspective.</h2>
          </div>
        </div>
        <ProductGrid
          items={products
            .filter((x) => x.slug !== slug && x.category === p.category)
            .slice(0, 4)}
        />
      </section>
    </>
  );
}
