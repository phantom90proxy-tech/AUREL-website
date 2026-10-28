import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { products, money } from "@/data/products";
import { limitedPresentations } from "@/data/limited-edition-presentation";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Limited Editions" };

export default function Page() {
  const editions = products.filter(product => product.category === "Limited Edition");
  return <div className="limited-overview">
    <section className="section limited-overview-intro" aria-labelledby="limited-overview-title">
      <Reveal duration={0.6}>
        <p className="eyebrow">AUREL / LIMITED EDITIONS</p>
        <h1 id="limited-overview-title">Beyond the ordinary.</h1>
      </Reveal>
      <Reveal duration={0.6} className="limited-overview-lead">
        <p>Four individual perspectives.<br />{" "}A lasting impression.</p>
        <span>Aurora. Eclipse. Solace. Glen.</span>
      </Reveal>
    </section>
    <section className="section limited-overview-gallery" aria-label="Discover the four Limited Editions">
      {editions.map((product, index) => <Reveal key={product.slug} duration={0.65} delay={(index % 2) * 0.06} distance={18}>
        <article className="limited-overview-card" data-edition={product.slug}>
          <Link className="limited-overview-image" href={"/watches/" + product.slug} aria-label={"View " + product.name + " watch"}>
            <Image src={limitedPresentations[product.slug].storyImage} alt={product.name + " ? AUREL Limited Edition campaign photograph"} fill sizes="(max-width: 760px) 88vw, (max-width: 1600px) 44vw, 640px" preload={index === 0} />
            <span className="limited-overview-image-action" aria-hidden="true"><ArrowUpRight size={19} /></span>
          </Link>
          <div className="limited-overview-card-info">
            <p className="eyebrow">{String(index + 1).padStart(2, "0")} / LIMITED EDITION</p>
            <div className="limited-overview-title-row"><h2><Link href={"/watches/" + product.slug}>{product.name}</Link></h2><p className="limited-overview-price">{money(product.price)}</p></div>
            <p className="limited-overview-description">{product.description}</p>
            <Link className="limited-overview-discover" href={"/watches/" + product.slug}>Discover {product.name}<ArrowUpRight size={15} /></Link>
          </div>
        </article>
      </Reveal>)}
    </section>
    <div className="section limited-overview-closing"><p>A different expression. The same attention to detail.</p><Link href="/watches" className="text-link">Explore all watches <ArrowUpRight size={16} /></Link></div>
  </div>;
}
