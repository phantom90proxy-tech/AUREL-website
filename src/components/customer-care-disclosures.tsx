"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { Plus, ShieldCheck, Truck, Wrench } from "lucide-react";
import type { CustomerCareItem } from "@/data/customer-care";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const icons = { truck: Truck, "shield-check": ShieldCheck, wrench: Wrench };
const ease = [0.22, 1, 0.36, 1] as const;

function CareDisclosure({
  item,
  index,
}: {
  item: CustomerCareItem;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useMotionPreference() !== false;
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.3 });
  const Icon = icons[item.icon];
  const triggerId = `customer-care-${item.id}-trigger`;
  const panelId = `customer-care-${item.id}-panel`;

  useEffect(() => {
    const column = ref.current;
    if (!column || !visible || reduced) return;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const animation = animate(
      column,
      { opacity: [0, 1], y: [mobile ? 14 : 20, 0] },
      { duration: 0.7, delay: mobile ? 0 : index * 0.12, ease },
    );
    const reset = () => {
      column.style.removeProperty("opacity");
      column.style.removeProperty("transform");
    };
    void animation.then(reset);
    return () => {
      animation.stop();
      reset();
    };
  }, [visible, reduced, index]);

  return (
    <article className="customer-care-item" data-expanded={expanded} ref={ref}>
      <h3>
        <button
          id={triggerId}
          type="button"
          aria-label={item.title}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
        >
          <span className="customer-care-card-meta" aria-hidden="true">
            <span className="customer-care-icon"><Icon size={23} strokeWidth={1.4} /></span>
            <span className="customer-care-number">{String(index + 1).padStart(2, "0")}</span>
          </span>
          <span className="customer-care-card-title">{item.title}</span>
          <span className="customer-care-description">{item.description}</span>
          <span className="customer-care-card-action" aria-hidden="true">
            <span>{expanded ? "Close details" : "View details"}</span>
            <span className="customer-care-indicator"><Plus size={16} /></span>
          </span>
        </button>
      </h3>
      <motion.div
        id={panelId}
        className="customer-care-panel"
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!expanded}
        inert={!expanded}
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.4, ease }}
      >
        <div className="customer-care-panel-content">
          <p className="customer-care-status">{item.status}</p>
          {item.details.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </motion.div>
    </article>
  );
}

export function CustomerCareDisclosures({
  items,
}: {
  items: CustomerCareItem[];
}) {
  return (
    <div className="customer-care-grid">
      {items.map((item, index) => (
        <CareDisclosure item={item} index={index} key={item.id} />
      ))}
    </div>
  );
}
