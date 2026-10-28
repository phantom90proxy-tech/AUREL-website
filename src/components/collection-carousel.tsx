"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import { CollectionArrow } from "@/components/collection-arrow";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { collectionGeometry } from "@/lib/collection-geometry";

function PerspectiveSlide({
  children,
  index,
  position,
  reduced,
  count,
  metrics,
}: {
  children: ReactNode;
  index: number;
  position: MotionValue<number>;
  reduced: boolean;
  count: number;
  metrics: MotionValue<{ stride: number; width: number }>;
}) {
  const geometry = useTransform(() =>
    collectionGeometry(
      index - position.get(),
      metrics.get().stride,
      metrics.get().width,
    ),
  );
  const scale = useTransform(geometry, (value) => value.scale);
  const rotate = useTransform(geometry, (value) => value.rotateY);
  const depth = useTransform(geometry, (value) => value.z);
  const horizontal = useTransform(geometry, (value) => value.x);
  return (
    <div
      className="collection-carousel-slide"
      role="group"
      aria-roledescription="slide"
      aria-label={`${(index % count) + 1} of ${count}`}
      data-copy={index >= count && index < count * 2 ? "main" : "buffer"}
      aria-hidden={index < count || index >= count * 2 ? true : undefined}
    >
      <motion.div
        className="collection-carousel-surface"
        style={{
          scale: reduced ? 1 : scale,
          rotateY: reduced ? 0 : rotate,
          z: reduced ? 0 : depth,
          x: reduced ? 0 : horizontal,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function CollectionCarousel({
  children,
  names,
}: {
  children: ReactNode[];
  names: string[];
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stride = useRef(1);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const count = names.length;
  const position = useMotionValue(count + 2);
  const metrics = useMotionValue({ stride: 400, width: 1440 });
  const camera = useTransform(
    () =>
      `${position.get() * metrics.get().stride + metrics.get().width / 2}px calc(var(--carousel-photo-height) * 0.5555556)`,
  );
  const animating = useRef(false);
  const suppressFocus = useRef(false);
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [active, setActive] = useState(2);
  const [ready, setReady] = useState(false);
  const reduced = useMotionPreference() !== false;
  const logical = (index: number) => ((index % count) + count) % count;

  useMotionValueEvent(position, "change", (value) =>
    setActive(logical(Math.round(value))),
  );

  useEffect(() => {
    if (!reduced) return;
    animation.current?.stop();
    animating.current = false;
    viewport.current?.style.removeProperty("scroll-snap-type");
  }, [reduced]);

  const stop = () => {
    animation.current?.stop();
    animation.current = null;
    animating.current = false;
    if (viewport.current)
      viewport.current.style.removeProperty("scroll-snap-type");
  };

  useLayoutEffect(() => {
    const element = viewport.current;
    const row = track.current;
    if (!element || !row) return;
    const measure = () => {
      animation.current?.stop();
      animating.current = false;
      // Remove the SSR-only centering transform before native scroll snapping
      // measures targets; otherwise transformed snap points shift twice.
      element.style.scrollSnapType = "none";
      element.parentElement!.dataset.ready = "true";
      const first = row.firstElementChild as HTMLElement;
      stride.current =
        first.getBoundingClientRect().width +
        parseFloat(getComputedStyle(row).columnGap);
      metrics.set({ stride: stride.current, width: element.clientWidth });
      element.scrollLeft =
        (count + (((Math.round(position.get()) % count) + count) % count)) *
        stride.current;
      position.set(element.scrollLeft / stride.current);
      row
        .querySelectorAll<HTMLElement>('[data-copy="buffer"] a')
        .forEach((link) => {
          link.tabIndex = -1;
        });
      element.style.removeProperty("scroll-snap-type");
      setReady(true);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      animation.current?.stop();
    };
  }, [position, count, metrics]);

  const recenter = (settled = false) => {
    const element = viewport.current;
    if (!element || animating.current || drag.current?.moved) return;
    const raw = element.scrollLeft / stride.current;
    const value = settled ? Math.round(raw) : raw;
    const normalized = count + (((value % count) + count) % count);
    if (Math.abs(raw - normalized) < 0.01) return;
    element.style.scrollSnapType = "none";
    element.scrollLeft = normalized * stride.current;
    position.set(normalized);
    element.style.removeProperty("scroll-snap-type");
  };

  const goTo = (index: number) => {
    const element = viewport.current;
    if (!element) return;
    stop();
    const target = index * stride.current;
    element.style.scrollSnapType = "none";
    if (reduced) {
      element.scrollLeft = target;
      position.set(index);
      recenter(true);
      element.style.removeProperty("scroll-snap-type");
      return;
    }
    animating.current = true;
    animation.current = animate(element.scrollLeft, target, {
      duration: 0.65,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (value) => {
        element.scrollLeft = value;
      },
      onComplete: () => {
        animating.current = false;
        position.set(index);
        recenter(true);
        element.style.removeProperty("scroll-snap-type");
      },
    });
  };

  return (
    <div
      className="collection-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Watch collections"
      data-ready={ready}
    >
      <div
        ref={viewport}
        className="collection-carousel-viewport"
        onScroll={() => {
          if (viewport.current) {
            const raw = viewport.current.scrollLeft / stride.current;
            position.set(raw);
            if (raw < count - 2 || raw > count * 2 + 1) recenter();
          }
        }}
        onScrollEnd={() => recenter(true)}
        onPointerDown={(event) => {
          stop();
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          event.preventDefault();
          suppressClick.current = false;
          drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state || event.pointerType !== "mouse") return;
          const delta = event.clientX - state.x;
          if (!state.moved && Math.abs(delta) < 6) return;
          state.moved = true;
          suppressClick.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.style.scrollSnapType = "none";
          event.currentTarget.scrollLeft = state.scroll - delta;
        }}
        onPointerUp={(event) => {
          const moved = drag.current?.moved;
          drag.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          if (moved) goTo(Math.round(position.get()));
        }}
        onPointerCancel={() => { drag.current = null; stop(); }}
        onLostPointerCapture={() => { drag.current = null; }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
        }}
        onWheel={stop}
        onKeyDown={(event) => {
          const target =
            event.key === "ArrowRight"
              ? Math.round(position.get()) + 1
              : event.key === "ArrowLeft"
                ? Math.round(position.get()) - 1
                : event.key === "Home"
                  ? count
                  : event.key === "End"
                    ? count * 2 - 1
                    : null;
          if (target === null || event.altKey || event.ctrlKey || event.metaKey)
            return;
          event.preventDefault();
          goTo(target);
          suppressFocus.current = true;
          track.current?.children[count + logical(target)]
            ?.querySelector<HTMLAnchorElement>("a")
            ?.focus({ preventScroll: true });
          suppressFocus.current = false;
        }}
        onFocusCapture={(event) => {
          const slide = (event.target as HTMLElement).closest(
            ".collection-carousel-slide",
          );
          if (slide && (slide as HTMLElement).dataset.copy === "buffer") return;
          if (slide && track.current && !suppressFocus.current)
            goTo(Array.from(track.current.children).indexOf(slide));
        }}
      >
        <motion.div
          className="collection-carousel-track"
          ref={track}
          style={{ perspectiveOrigin: camera }}
        >
          {Array.from({ length: count * 3 }, (_, index) => (
            <PerspectiveSlide
              key={index}
              index={index}
              position={position}
              reduced={reduced}
              count={count}
              metrics={metrics}
            >
              {children[index % count]}
            </PerspectiveSlide>
          ))}
        </motion.div>
      </div>
      <svg
        className="collection-carousel-boundary"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <g className="wall-curve-desktop">
          <path d="M0 0H1000V50Q500 140 0 50Z" />
          <path d="M0 1000H1000V950Q500 860 0 950Z" />
        </g>
        <g className="wall-curve-tablet">
          <path d="M0 0H1000V50Q500 104 0 50Z" />
          <path d="M0 1000H1000V950Q500 896 0 950Z" />
        </g>
        <g className="wall-curve-mobile">
          <path d="M0 0H1000V50Q500 77 0 50Z" />
          <path d="M0 1000H1000V950Q500 923 0 950Z" />
        </g>
      </svg>
      <div className="collection-carousel-controls">
        <CollectionArrow
          label="Previous collection"
          onClick={() => goTo(Math.round(position.get()) - 1)}
        >
          <ArrowLeft size={20} />
        </CollectionArrow>
        <CollectionArrow
          label="Next collection"
          onClick={() => goTo(Math.round(position.get()) + 1)}
        >
          <ArrowRight size={20} />
        </CollectionArrow>
      </div>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {names[active]}, {active + 1} of {names.length}
      </p>
    </div>
  );
}
