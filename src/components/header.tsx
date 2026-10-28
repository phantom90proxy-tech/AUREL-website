"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { useStore } from "./store";

const links = [
  ["Home", "/"],
  ["All Watches", "/watches"],
  ["Collections", "/collections"],
  ["Limited Editions", "/limited-editions"],
  ["About Us", "/about"],
  ["Contact", "/contact"],
];
const ease = [0.22, 1, 0.36, 1] as const;
function subscribeMobile(callback: () => void) {
  const query = window.matchMedia("(max-width: 1000px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function mobileSnapshot() {
  return window.matchMedia("(max-width: 1000px)").matches;
}

export function Header() {
  const path = usePathname();
  const { state } = useStore();
  const reduce = useMotionPreference() !== false;
  const mobile = useSyncExternalStore(
    subscribeMobile,
    mobileSnapshot,
    () => false,
  );
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const compactRef = useRef(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const utilityButton = useRef<HTMLButtonElement>(null);
  const utilityGroup = useRef<HTMLDivElement>(null);
  const brand = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const pinned = useRef(false);
  const pointerFocus = useRef(false);
  const suppressFocus = useRef(false);

  const closeUtilities = () => {
    pinned.current = false;
    setUtilitiesOpen(false);
  };
  const closeNavigation = () => {
    setOpen(false);
    closeUtilities();
  };

  useEffect(() => {
    let frame = 0;
    let focusFrame = 0;
    const update = () => {
      frame = 0;
      const next = compactRef.current
        ? window.scrollY > 88
        : window.scrollY >= 140;
      if (next === compactRef.current) return;
      if (next && brand.current?.contains(document.activeElement)) {
        const target = mobileSnapshot()
          ? menuButton.current
          : navigation.current?.querySelector("a");
        target?.focus({ preventScroll: true });
      }
      const keepFocusedControls =
        next && Boolean(utilityGroup.current?.contains(document.activeElement));
      if (!next && document.activeElement === utilityButton.current) {
        focusFrame = requestAnimationFrame(() => {
          utilityGroup.current
            ?.querySelector<HTMLAnchorElement>(".utility-icons a")
            ?.focus({ preventScroll: true });
        });
      }
      compactRef.current = next;
      pinned.current = false;
      setUtilitiesOpen(keepFocusedControls);
      setCompact(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (focusFrame) cancelAnimationFrame(focusFrame);
    };
  }, []);

  useEffect(() => {
    if (!open && !utilitiesOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (utilitiesOpen) {
        pinned.current = false;
        setUtilitiesOpen(false);
        suppressFocus.current = true;
        utilityButton.current?.focus({ preventScroll: true });
        suppressFocus.current = false;
      } else {
        setOpen(false);
        menuButton.current?.focus({ preventScroll: true });
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        utilitiesOpen &&
        !utilityGroup.current?.contains(event.target as Node)
      ) {
        pinned.current = false;
        setUtilitiesOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open, utilitiesOpen]);

  const visibleUtilities = !compact || utilitiesOpen;
  const actions = [
    {
      id: "search",
      href: "/watches?search=1",
      label: "Search watches",
      icon: <Search size={19} />,
    },
    {
      id: "wishlist",
      href: "/wishlist",
      label: `Wishlist, ${state.wishlist.length} saved watches`,
      icon: (
        <>
          <Heart size={19} />
          {state.wishlist.length > 0 && <b>{state.wishlist.length}</b>}
        </>
      ),
    },
    {
      id: "bag",
      href: "/bag",
      label: "Shopping bag",
      icon: (
        <>
          <ShoppingBag size={19} />
          <span className="bag-count">
            {Object.values(state.bag).reduce((a, b) => a + b, 0)}
          </span>
        </>
      ),
    },
  ];
  const duration = reduce ? 0 : 0.32;
  return (
    <motion.header
      className="header"
      data-compact={compact}
      data-utilities-open={compact && utilitiesOpen}
      initial={false}
      animate={{
        backgroundColor: compact ? "rgba(255,255,255,0)" : "#ffffff",
        borderBottomColor: compact ? "rgba(234,233,229,0)" : "#eae9e5",
      }}
      transition={{ duration, ease }}
    >
      <motion.div
        className="header-inner"
        initial={false}
        animate={{
          width: compact
            ? mobile
              ? utilitiesOpen
                ? 208
                : 208
              : utilitiesOpen
                ? 924
                : 772
            : "100%",
          height: compact ? (mobile ? 56 : 60) : "var(--header-full-height)",
          y: compact ? 14 : 0,
          borderRadius: compact ? 999 : 0,
          paddingLeft: compact ? (mobile ? 14 : 20) : "4%",
          paddingRight: compact ? (mobile ? 14 : 20) : "4%",
          backgroundColor: compact
            ? "rgba(245,245,245,0.78)"
            : "rgba(245,245,245,0)",
          boxShadow: compact
            ? "0 4px 18px rgba(8,8,8,0.06)"
            : "0 0px 0px rgba(8,8,8,0)",
        }}
        transition={{ duration, ease }}
      >
        <motion.div
          ref={brand}
          className="brand-slot"
          inert={compact}
          aria-hidden={compact}
          initial={false}
          animate={{ opacity: compact ? 0 : 1, width: compact ? 0 : "auto" }}
          transition={{ duration: reduce ? 0 : 0.22, ease }}
        >
          <Link href="/" className="brand" aria-label="AUREL home">
            <span className="logo-crop">
              <Image
                src="/images/logo/aurel-logo-updated.png"
                alt=""
                width={1254}
                height={1254}
              />
            </span>
            <span>AUREL</span>
          </Link>
        </motion.div>
        <nav
          ref={navigation}
          className="desktop-nav"
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={closeNavigation}
              aria-current={
                (href === "/" ? path === "/" : path.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="utilities">
          <div
            className="utility-group"
            ref={utilityGroup}
            role="group"
            aria-label="Header utilities"
            onPointerDownCapture={() => {
              pointerFocus.current = true;
            }}
            onKeyDownCapture={() => {
              pointerFocus.current = false;
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                hovered.current = true;
                if (compact) setUtilitiesOpen(true);
              }
            }}
            onPointerLeave={() => {
              hovered.current = false;
              if (!pinned.current && !focused.current) setUtilitiesOpen(false);
            }}
            onFocusCapture={(event) => {
              focused.current = true;
              if (
                compact &&
                !suppressFocus.current &&
                (!pointerFocus.current ||
                  (event.target as HTMLElement).matches(":focus-visible")) &&
                !event.currentTarget.contains(event.relatedTarget as Node)
              )
                setUtilitiesOpen(true);
            }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                focused.current = false;
                pinned.current = false;
                if (!hovered.current) setUtilitiesOpen(false);
              }
            }}
          >
            <button
              ref={utilityButton}
              className="utility-toggle"
              type="button"
              aria-label="Search, wishlist and shopping bag"
              aria-expanded={compact && utilitiesOpen}
              aria-controls="header-utility-actions"
              onClick={(event) => {
                setOpen(false);
                const next =
                  event.detail === 0 ? !utilitiesOpen : !pinned.current;
                pinned.current = next;
                setUtilitiesOpen(next);
              }}
            >
              <MoreHorizontal size={20} />
            </button>
            <motion.div
              id="header-utility-actions"
              className="utility-actions"
              initial={false}
              inert={!visibleUtilities}
              aria-hidden={!visibleUtilities}
              animate={{
                width: compact ? (utilitiesOpen ? 156 : 0) : "auto",
                opacity: visibleUtilities ? 1 : 0,
              }}
              transition={{ duration: reduce ? 0 : 0.24, ease }}
            >
              <div className="utility-icons">
                {actions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={false}
                    animate={{
                      opacity: visibleUtilities ? 1 : 0,
                      x: visibleUtilities ? 0 : -4,
                    }}
                    transition={{
                      duration: reduce ? 0 : 0.18,
                      delay: reduce || !visibleUtilities ? 0 : index * 0.025,
                      ease,
                    }}
                  >
                    <Link
                      href={action.href}
                      aria-label={action.label}
                      onClick={() => {
                        closeUtilities();
                        if (compact)
                          utilityButton.current?.focus({ preventScroll: true });
                      }}
                    >
                      {action.icon}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          <Link
            href="/profile"
            className="profile-link"
            aria-label="Your profile"
            aria-current={path === "/profile" ? "page" : undefined}
            onClick={closeNavigation}
          >
            <UserRound size={19} />
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="mobile-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => {
              closeUtilities();
              setOpen(!open);
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="mobile-nav"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.24, ease }}
          >
            {links.map(([label, href]) => (
              <Link
                href={href}
                key={href}
                onClick={closeNavigation}
                aria-current={
                  (href === "/" ? path === "/" : path.startsWith(href))
                    ? "page"
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
