"use client";

import { WatchImage as Image } from "@/components/watch-image";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import type { TimepieceComponent } from "@/data/limited-anatomy";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { Reveal } from "@/components/motion";

export function LimitedAnatomy({ name, image, components }: { name: string; image: string; components: TimepieceComponent[] }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useMotionPreference() !== false;
  const artwork = components[selected].image;
  function navigate(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % components.length;
    else if (event.key === "ArrowLeft") next = (index + components.length - 1) % components.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = components.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }
  return <section className="section limited-anatomy" id="limited-anatomy" aria-labelledby={id + "-heading"}>
    <Reveal duration={0.6} className="anatomy-heading">
      <div><p className="eyebrow">AUREL / THE DETAILS</p>
      <h2 id={id + "-heading"}>Anatomy of a Timepiece.</h2></div>
      <p>Discover the details that define each Limited Edition.</p>
    </Reveal>
    <div className="anatomy-layout">
      <div role="tablist" aria-label={name + " watch components"} className="anatomy-tabs">
        {components.map((component, index) => <button key={component.type} ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={id + "-tab-" + index} aria-controls={id + "-panel-" + index} aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => navigate(event, index)}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{component.navigation}</button>)}
      </div>
      <Reveal className="anatomy-photograph" duration={0.6}>
        <figure><div className="anatomy-image"><motion.div className="anatomy-image-layer" key={artwork?.src ?? image} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}><Image src={artwork?.src ?? image} alt={artwork?.alt ?? name + " — full watch photograph"} fill sizes="(max-width: 760px) 90vw, 45vw" /></motion.div></div><figcaption>{artwork?.caption ?? name + " / Full watch photograph"}</figcaption></figure>
      </Reveal>
      <Reveal className="anatomy-explorer" duration={0.6} delay={0.08} distance={14}>
        <div className="anatomy-panels">
          {components.map((component, index) => <div key={component.type} role="tabpanel" id={id + "-panel-" + index} aria-labelledby={id + "-tab-" + index} hidden={selected !== index} tabIndex={0}>
            <motion.div animate={{ opacity: 1, y: 0 }} initial={selected === index && !reduced ? { opacity: 0, y: 10 } : false} key={selected === index ? component.type + "-active" : component.type} transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <p className="anatomy-number">{String(index + 1).padStart(2, "0")} / {name.toUpperCase()}</p>
              <h3>{component.title}</h3>
              <p className="anatomy-description">{component.description}</p>
              {component.specifications.length > 0 && <dl>{component.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>}
            </motion.div>
          </div>)}
        </div>
        <p className="anatomy-source">Specifications from the AUREL catalog. Component artwork does not establish additional technical specifications.</p>
      </Reveal>
    </div>
  </section>;
}
