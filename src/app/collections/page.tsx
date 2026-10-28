import Image from "next/image";
import Link from "next/link";
import { collections } from "@/data/products";
import { Reveal } from "@/components/motion";
import { CollectionParallax } from "@/components/collections/collection-parallax";

export const metadata = { title: "The Collections", description: "Explore five distinct AUREL watch collections through photography, considered design, and personal expression." };
const order = ["Sport Collection", "Classic Collection", "Chronograph Collection", "Minimal Collection", "Limited Edition"];
const campaigns = [
  { image: "velocity", alt: "Velocity black sports watch with red accents against a clean black background" },
  { image: "monarch", alt: "Monarch gold watch with Roman numerals resting on polished black ceramic and pale stone" },
  { image: "chrono", alt: "Chrono skeleton watch lying diagonally on dark stone with a brown leather strap" },
  { image: "linea", alt: "Linea minimalist white-dial watch lying on pale architectural stone with a gray strap" },
  { image: "eclipse", alt: "Eclipse blue-dial watch resting on dark rock beneath an eclipse" },
];
const ids = ["sport", "classic", "chronograph", "minimal", "limited-edition"];

export default function Page() {
  const chapters = order.map(name => collections.find(collection => collection.name === name)!);
  return <div className="editorial-collections">
    <header className="editorial-introduction">
      <Reveal duration={0.65}>
        <p className="eyebrow">AUREL / THE COLLECTIONS</p>
        <h1>The Collections.</h1>
        <p>Explore a considered selection of watches created for different styles, occasions, and expressions of individuality.</p>
      </Reveal>
    </header>
    {chapters.map((chapter, index) => {
      const href = "/watches?collection=" + encodeURIComponent(chapter.name);
      const campaign = campaigns[index];
      return <section key={chapter.name} id={ids[index]} tabIndex={-1} aria-labelledby={ids[index] + "-title"} className={"editorial-chapter campaign-panel editorial-chapter-" + ids[index]}>
        <Reveal duration={0.75} className="editorial-visual">
          <div className="editorial-photographs">
            <Link className="editorial-image-link" href={href} data-editorial-view aria-label={"Discover " + chapter.name}>
              <CollectionParallax><Image src={"/images/collections/" + campaign.image + "-v2.webp"} alt={campaign.alt} fill sizes="100vw" preload={index === 0} /></CollectionParallax>
            </Link>
          </div>
        </Reveal>
        <Reveal duration={0.65} className="editorial-chapter-copy">
          <p className="eyebrow">AUREL</p>
          <h2 id={ids[index] + "-title"}>{chapter.name}</h2>
          <p className="sr-only">{chapter.description}</p>
          <Link href={href} className="editorial-discover">Discover Collection</Link>
        </Reveal>
      </section>;
    })}
  </div>;
}
