import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Truck, ShieldCheck, Wrench } from "lucide-react";
import { products, money, type Product } from "@/data/products";
import { customerCare } from "@/data/customer-care";
import { limitedPresentations } from "@/data/limited-edition-presentation";
import { ProductActions } from "@/components/shopping";
import { ProductGrid } from "@/components/products";
import { Reveal } from "@/components/motion";
import { ProductDisclosure } from "@/components/products/product-disclosure";
import { LimitedGallery } from "./limited-gallery";
import { LimitedAnatomy } from "./limited-anatomy";
import { getLimitedAnatomy } from "@/data/limited-anatomy";

const icons = { truck: Truck, "shield-check": ShieldCheck, wrench: Wrench };

export function LimitedProductDetail({ product: p }: { product: Product }) {
  const presentation = limitedPresentations[p.slug];
  const related = products.filter(product => product.category === "Limited Edition" && product.slug !== p.slug);
  return <div className="limited-product-detail" data-product-template="limited-edition">
    <div className="section limited-product-introduction">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/watches">All watches</Link><span aria-hidden="true">/</span><Link href="/watches?collection=Limited%20Edition">Limited Edition</Link><span aria-hidden="true">/</span><span aria-current="page">{p.name}</span></nav>
      <div className="limited-product-hero">
        <Reveal duration={0.65} className="limited-product-photography"><LimitedGallery name={p.name} artwork={presentation.artwork} alternate={presentation.alternate} ratio={presentation.galleryRatio} /></Reveal>
        <Reveal duration={0.6} className="limited-product-copy">
          <p className="eyebrow">AUREL / LIMITED EDITION</p>
          <h1>{p.name}</h1>
          <p className="limited-product-description">{p.description}</p>
          <p className="limited-product-price">{money(p.price)}</p>
          <dl className="limited-product-identity"><div><dt>Collection</dt><dd>{p.category}</dd></div><div><dt>Color</dt><dd>{p.color}</dd></div></dl>
          <ProductActions product={p} />
          <a href="#limited-anatomy" className="limited-details-link">Explore the timepiece <ArrowDown size={15} /></a>
        </Reveal>
      </div>
    </div>
    <LimitedAnatomy name={p.name} image={presentation.artwork} components={getLimitedAnatomy(p)} />
    <section className="limited-product-story" aria-labelledby="limited-story-title">
      <Reveal className="limited-story-copy" duration={0.65}><p className="eyebrow">THE EXPRESSION OF {p.name.toUpperCase()}</p><h2 id="limited-story-title">{presentation.heading}</h2><p>{p.description}</p></Reveal>
      <Reveal className={"limited-story-image limited-story-" + presentation.storyRatio} duration={0.75}><Image src={presentation.storyImage} alt={p.name + " - existing AUREL editorial artwork"} width={presentation.storyRatio === "wide" ? 1672 : 1280} height={presentation.storyRatio === "wide" ? 941 : 1280} sizes="(max-width: 760px) 100vw, 85vw" /></Reveal>
    </section>
    <section className="section limited-technical" id="limited-specifications" aria-labelledby="limited-technical-title">
      <Reveal className="limited-technical-heading" duration={0.55}><p className="eyebrow">MODEL INFORMATION</p><h2 id="limited-technical-title">Considered in every detail.</h2><p>{p.name} specifications, as recorded in the AUREL catalog.</p></Reveal>
      <Reveal className="limited-technical-content" duration={0.65} delay={0.08} distance={18}><dl>{p.details.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl><ProductDisclosure title="Model care guide"><p>{p.details.careGuide}</p></ProductDisclosure></Reveal>
    </section>
    <section className="limited-product-services" aria-labelledby="limited-services-title"><div className="section">
      <Reveal duration={0.55}><p className="eyebrow">AUREL / AT YOUR SIDE</p><h2 id="limited-services-title">Care, considered.</h2></Reveal>
      <div className="limited-services-grid">{customerCare.items.map((item, index) => { const Icon = icons[item.icon]; return <Reveal className="limited-service" key={item.id} duration={0.6} delay={index * 0.06} distance={14}><Icon size={22} strokeWidth={1.4} aria-hidden="true" /><ProductDisclosure title={item.title}><p className="limited-service-status">{item.status}</p>{item.details.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</ProductDisclosure></Reveal>; })}</div>
    </div></section>
    <section className="section limited-related" aria-labelledby="limited-related-title"><Reveal duration={0.55}><p className="eyebrow">ANOTHER EXPRESSION</p><h2 id="limited-related-title">Discover More Limited Editions</h2></Reveal><ProductGrid items={related} /></section>
  </div>;
}
