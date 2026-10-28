"use client";

import { useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

export function ProductDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduced = useMotionPreference() !== false;
  return <div className="product-disclosure">
    <h3><button type="button" id={id + "-trigger"} aria-expanded={open} aria-controls={id + "-panel"} onClick={() => setOpen(value => !value)}>{title}<Plus size={18} aria-hidden="true" /></button></h3>
    <motion.div id={id + "-panel"} role="region" aria-labelledby={id + "-trigger"} aria-hidden={!open} inert={!open} className="product-disclosure-panel" initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}><div>{children}</div></motion.div>
  </div>;
}
