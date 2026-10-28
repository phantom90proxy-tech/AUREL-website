"use client";

import { useEffect, useState } from "react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

export function EditorialNavigation({ items }: { items: { id: string; name: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const reduced = useMotionPreference() !== false;
  useEffect(() => {
    const update = () => {
      const sections = items.map(item => document.getElementById(item.id)).filter((node): node is HTMLElement => Boolean(node));
      const current = sections.filter(node => node.getBoundingClientRect().top <= innerHeight * 0.4).at(-1) ?? sections[0];
      if (current) setActive(current.id);
    };
    let frame = 0;
    const scroll = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); };
    window.addEventListener("scroll", scroll, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", scroll); cancelAnimationFrame(frame); };
  }, [items]);
  return <nav className="editorial-collection-nav" aria-label="Explore the collections">{items.map(item => <a key={item.id} href={"#" + item.id} aria-current={active === item.id ? "location" : undefined} onClick={(event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(item.id);
    if (!section) return;
    event.preventDefault();
    history.replaceState(null, "", "#" + item.id);
    section.focus({ preventScroll: true });
    section.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
    setActive(item.id);
  }}>{item.name}</a>)}</nav>;
}
