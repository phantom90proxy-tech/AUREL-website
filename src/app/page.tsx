import Image from "next/image";
import { HeroPhotography } from "@/components/hero-photography";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { collections } from "@/data/products";
import { CollectionCard } from "@/components/products";
import { Reveal } from "@/components/motion";
import { RotatingPhrase } from "@/components/rotating-phrase";
import { PhilosophyReveal } from "@/components/philosophy-reveal";
import { CustomerCare } from "@/components/customer-care";
import { CollectionCarousel } from "@/components/collection-carousel";
export default function Home() {
  const homepageCollections = [...collections].sort((a, b) => {
    const order = [
      "Sport Collection",
      "Classic Collection",
      "Chronograph Collection",
      "Minimal Collection",
      "Limited Edition",
    ];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });
  return (
    <>
      <section
        className="brand-introduction photographic-introduction"
        aria-labelledby="introduction-title"
      >
        <HeroPhotography />
        <div className="brand-introduction-inner">
          <Reveal>
            <p className="eyebrow">WELCOME TO AUREL</p>
            <h1 id="introduction-title">Discover AUREL.</h1>
            <h2>
              Where time meets <RotatingPhrase />
            </h2>
          </Reveal>
          <Reveal>
            <div className="brand-introduction-copy">
              <p>
                Discover AUREL, an online watch store with curated timepieces
                for every style and occasion. Find a watch that tells your
                story.
              </p>
            </div>
            <Link href="/watches" className="button brand-introduction-cta">
              <span>Explore our watches</span> <ArrowUpRight size={17} />
            </Link>
          </Reveal>
          <p className="brand-introduction-tagline">
            AUREL — YOUR TIME. YOUR STORY.
          </p>
        </div>
      </section>
      <PhilosophyReveal
        image={
          <Image
            src="/images/aurel-watch-detail.png"
            alt="Close-up side profile of a black AUREL watch, showing the tachymeter bezel, signed crown, and chronograph pushers"
            width={1774}
            height={887}
            sizes="100vw"
          />
        }
      >
        <p className="eyebrow">THE PHILOSOPHY OF AUREL</p>
        <blockquote>
          <h2 id="watch-philosophy-title">
            &ldquo;Every second tells a story. Every detail makes it
            yours.&rdquo;
          </h2>
        </blockquote>
        <p className="philosophy-attribution">&mdash; AUREL</p>
      </PhilosophyReveal>
      <div className="brand-strip">
        <span>CONSIDERED DESIGN</span>
        <span className="strip-dot">·</span>
        <span>DISTINCTIVE CHARACTER</span>
        <span className="strip-dot">·</span>
        <span>PERSONAL BY NATURE</span>
      </div>
      <Reveal>
        <section className="collections-section home-collections">
          <div className="section home-collections-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">FIND YOUR EXPRESSION</p>
                <h2>A collection for every chapter.</h2>
              </div>
              <Link href="/collections" className="text-link">
                Explore collections <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
          <CollectionCarousel names={homepageCollections.map((c) => c.name)}>
            {homepageCollections.map((c, i) => (
              <CollectionCard
                key={c.name}
                collection={c}
                index={i}
                showCaption={false}
              />
            ))}
          </CollectionCarousel>
        </section>
      </Reveal>
      <CustomerCare />
      <Reveal>
        <section id="our-story" className="story section">
          <p className="eyebrow">THE AUREL PHILOSOPHY</p>
          <h2>
            Time is what you make of it.
            <br />
            <em>Make it yours.</em>
          </h2>
          <p>
            We believe a watch should feel like an extension of you. Thoughtful
            in its design, distinctive in its character, and effortless in the
            everyday. AUREL brings a personal perspective to the passing of
            time.
          </p>
          <span className="story-signature">Your time. Your story.</span>
        </section>
      </Reveal>
    </>
  );
}
