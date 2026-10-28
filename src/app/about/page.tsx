import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { developer } from "@/data/developer";

export const metadata = {
  title: "About Us",
  description:
    "Meet AUREL: an online watch store built around considered design, personal style, and individual expression.",
};

export default function AboutPage() {
  return (
    <>
      <section className="info-introduction about-introduction">
        <div className="section about-introduction-layout">
          <Reveal duration={0.55} className="about-introduction-logo">
            <Image src="/images/logo/aurel-logo-updated.png" alt="AUREL — Your time, your story" width={1254} height={1254} sizes="(max-width: 760px) 220px, 360px" preload />
          </Reveal>
          <Reveal duration={0.55} className="about-introduction-copy">
          <p className="eyebrow">ABOUT AUREL</p>
          <h1>
            Your time.
            <br />
            <em>Your story.</em>
          </h1>
          <p>An online watch store for the many ways you express yourself.</p>
          </Reveal>
        </div>
      </section>
      <section
        className="section about-story"
        aria-labelledby="about-story-title"
      >
        <Reveal>
          <p className="eyebrow">A PERSONAL PERSPECTIVE</p>
          <h2 id="about-story-title">
            A watch becomes yours
            <br />
            through the moments
            <br />
            <em>you make with it.</em>
          </h2>
        </Reveal>
        <div className="info-prose">
          <p>
            AUREL brings together a curated collection of watches for different
            styles, occasions, and everyday rhythms. We believe choosing a
            timepiece should begin with what feels right for you.
          </p>
          <p>
            From timeless classics and quiet minimalist designs to sport
            watches, chronographs, and distinctive limited editions, our
            collections offer different expressions of the same idea: personal
            style has no single definition.
          </p>
          <p>
            Our goal is to make discovering the right watch simple, enjoyable,
            and personal. Explore at your own pace, compare the details, and
            keep the pieces that speak to you close.
          </p>
        </div>
      </section>
      <section
        className="section about-values"
        aria-label="The AUREL philosophy"
      >
        {[
          [
            "01",
            "Personal by nature",
            "A timepiece is an extension of your individuality. Your preferences, your occasions, your way of wearing it.",
          ],
          [
            "02",
            "A considered selection",
            "Classic, Minimal, Sport, Chronograph, and Limited Edition collections give you room to find your own expression.",
          ],
          [
            "03",
            "Discovery, made simple",
            "Clear product details, thoughtfully organized collections, and a personal wishlist help you make a considered choice.",
          ],
        ].map(([number, title, text]) => (
          <article key={number}>
            <p className="eyebrow">{number} / OUR PHILOSOPHY</p>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="about-developer" aria-labelledby="about-developer-title">
        <div className="section about-developer-layout">
          <Reveal duration={0.55} className="about-developer-heading">
            <p className="eyebrow">BEHIND THE EXPERIENCE</p>
            <h2 id="about-developer-title">Meet the Developer.</h2>
          </Reveal>
          <Reveal duration={0.55} className="about-developer-portrait">
            <Image src="/images/developer-simon-christian-carmen.jpg" alt="Portrait of Simon Christian Carmen, AUREL website developer" width={1425} height={1528} sizes="(max-width: 760px) 80vw, 300px" />
          </Reveal>
          <Reveal duration={0.55} className="about-developer-profile">
            <p className="eyebrow">{developer.role}</p>
            <h3>{developer.name}</h3>
            <p className="about-developer-introduction">{developer.introduction}</p>
            <p>{developer.description}</p>
          </Reveal>
        </div>
      </section>
      <section className="section info-closing">
        <div>
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h2>Find the watch that feels like you.</h2>
        </div>
        <Link href="/watches" className="button">
          Explore our watches <ArrowUpRight size={17} />
        </Link>
        <Link href="/contact" className="text-link">
          Get in touch <ArrowUpRight size={16} />
        </Link>
      </section>
    </>
  );
}
