"use client";
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { usePathname as useNavPathname } from "next/navigation";
import {
  LazyMotion,
  domAnimation,
  m,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";

/* --------- defer heavy UI to a separate chunk (no SSR needed) --------- */
const ScrollProgress = dynamic(
  () => import("@/components/ui/scroll-progress").then((m) => m.ScrollProgress),
  { ssr: false, loading: () => null }
);

/* ============================== CONSTANTS ============================== */
const COLORS = Object.freeze({
  title: "#0B0833",
  tagline: "#7BBF31",
  accent: "#7BBF31",
  navSolid: "#0A0833",
});

const TRANSITION = Object.freeze({
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.22,
});

// Product dropdown image specs (for preloading)
const PRODUCT_IMAGE_SPECS = Object.freeze([
  { src: "/Products/PassengerNew.avif", width: 140, height: 74 },
  { src: "/Products/HospitalNew.avif",  width: 140, height: 74 },
  { src: "/Products/HydraulicNew.avif", width: 140, height: 74 },
  { src: "/Products/GoodsNew.avif",     width: 140, height: 74 },
  { src: "/Products/RauliNew.avif",     width: 140, height: 74 },
]);

/* ============================== UTILS ============================== */
/** Media query hook */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Hover intent to avoid flicker (smooth open/close) */
function useHoverIntent({ onOpen, onClose, openDelay = 70, closeDelay = 120 }) {
  const openT = useRef(null);
  const closeT = useRef(null);
  // Prevent accidental opens during scroll-driven pointerenter (e.g., sticky header under pointer)
  const lastScrollAt = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      lastScrollAt.current = Date.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pointerEnter = useCallback(() => {
    // Ignore hover open if it was triggered immediately after scroll
    if (Date.now() - lastScrollAt.current < 180) return;
    if (closeT.current) {
      clearTimeout(closeT.current);
      closeT.current = null;
    }
    if (!openT.current) {
      openT.current = setTimeout(() => {
        onOpen?.();
        openT.current = null;
      }, openDelay);
    }
  }, [onOpen, openDelay]);

  const pointerLeave = useCallback(() => {
    if (openT.current) {
      clearTimeout(openT.current);
      openT.current = null;
    }
    if (!closeT.current) {
      closeT.current = setTimeout(() => {
        onClose?.();
        closeT.current = null;
      }, closeDelay);
    }
  }, [onClose, closeDelay]);

  useEffect(() => () => {
    if (openT.current) clearTimeout(openT.current);
    if (closeT.current) clearTimeout(closeT.current);
  }, []);

  return { pointerEnter, pointerLeave };
}

/** Decide if route prefetching should be allowed (skip on data-saver/2G). */
function useShouldPrefetch() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const saveData = !!conn?.saveData;
      const slow = typeof conn?.effectiveType === "string" && /(^|-)2g$/i.test(conn.effectiveType || "");
      setOk(!(saveData || slow));
    } catch {
      // default true
    }
  }, []);
  return ok;
}

/* ============================== MOTION VARS ============================== */
const VARS = Object.freeze({
  mobileMenu: {
    hidden: { opacity: 0, x: "-100%" },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: "-100%" },
  },
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  menuItem: {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  dropdown: {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6, scale: 0.98 },
  },
});

/* ============================== PRIMITIVES ============================== */
const SolidPanel = memo(({ children }) => (
  <m.div
    initial={false}
    transition={TRANSITION}
    className="relative rounded-2xl border shadow-xl overflow-hidden text-white"
    style={{
      borderColor: "rgba(255,255,255,0.20)",
      background: COLORS.navSolid,
      boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
      contain: "content",
      willChange: "transform, opacity",
    }}
  >
    <div className="relative w-max h-full p-5">{children}</div>
  </m.div>
));

const ProductItem = memo(
  ({ title, description, href, src, onClick, isActive = false, objectPos = "top" }) => (
    <Link
      href={href}
      prefetch={useShouldPrefetch()}
      className="flex items-start gap-3 min-w-[260px] group"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <Image
        src={src}
        width={140}
        height={74}
        alt={title}
        className={`w-[140px] h-[74px] rounded-md shadow-2xl object-cover ${
          objectPos === "bottom"
            ? "object-bottom"
            : objectPos === "center"
            ? "object-center"
            : "object-top"
        } ${isActive ? "ring-2 ring-[#7BBF31]/70" : ""}`}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 45vw, 140px"
        priority={false}
        unoptimized={/\.svg$/i.test(src)}
      />
      <div>
        <h4
          className={`text-base font-bold mb-1 transition-colors ${
            isActive ? "text-[#7BBF31]" : "text-white group-hover:text-[#7BBF31]"
          }`}
        >
          {title}
        </h4>
        <p className="text-white/85 text-sm max-w-[12rem]">{description}</p>
      </div>
    </Link>
  )
);

/* ↓ enableHover gates hover-only effects on desktop pointer */
const NavLabel = memo(({ children, isActive, enableHover }) => (
  <m.span
    initial={false}
    animate={{ color: isActive ? COLORS.accent : "#FFFFFF" }}
    whileHover={enableHover ? { color: COLORS.accent } : undefined}
    transition={{ duration: 0.15 }}
    className="cursor-pointer font-extrabold tracking-wider uppercase text-xs sm:text-sm md:text-[12px] lg:text-sm xl:text-base"
  >
    {children}
  </m.span>
));

const BarItem = memo(({ label, href, setHoverKey, pathname, onClick, enableHover }) => {
  const prefetchAllowed = useShouldPrefetch();
  const isActive = useMemo(() => {
    if (href === "/") return pathname === "/";
    const p = pathname.toLowerCase().replace(/\/$/, "");
    const h = href.toLowerCase().replace(/\/$/, "");
    return p === h || p.startsWith(h + "/");
  }, [pathname, href]);

  const onEnter = useCallback(() => setHoverKey(null), [setHoverKey]);

  return (
    <div onPointerEnter={onEnter} className="relative px-1 sm:px-2 lg:px-3 py-3 lg:py-4">
      <Link
        href={href}
        prefetch={prefetchAllowed}
        className="inline-block"
        aria-current={isActive ? "page" : undefined}
        onClick={onClick}
      >
        <NavLabel isActive={isActive} enableHover={enableHover}>
          {label}
        </NavLabel>
      </Link>
    </div>
  );
});

/* ======================= DESKTOP PRODUCTS (HOVER INTENT) ======================= */
const ProductsBarItem = memo(({ hoverKey, setHoverKey, pathname, enableHover }) => {
  const KEY = "PRODUCTS";

  const isActive = useMemo(() => {
    const p = pathname.toLowerCase().replace(/\/$/, "");
    return p === "/products" || p.startsWith("/products/");
  }, [pathname]);

  const isHrefActive = useCallback(
    (href) => {
      const p = pathname.toLowerCase().replace(/\/$/, "");
      const h = (href || "").toLowerCase().replace(/\/$/, "");
      return p === h || p.startsWith(h + "/");
    },
    [pathname]
  );

  const open = useCallback(() => setHoverKey(KEY), [setHoverKey]);
  const close = useCallback(() => setHoverKey(null), [setHoverKey]);

  const { pointerEnter, pointerLeave } = useHoverIntent({
    onOpen: open,
    onClose: close,
  });

  // Keyboard accessibility: open on focus, close on blur
  const onFocus = useCallback(() => open(), [open]);
  const onBlur = useCallback((e) => {
    // Close only if focus left the whole block
    if (!e.currentTarget.contains(e.relatedTarget)) close();
  }, [close]);

  return (
    <div
      className="relative px-1 sm:px-2 lg:px-3 py-3 lg:py-4"
      onPointerEnter={enableHover ? pointerEnter : undefined}
      onPointerLeave={enableHover ? pointerLeave : undefined}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <Link
        href="/products"
        prefetch={useShouldPrefetch()}
        className="inline-block"
        aria-current={isActive ? "page" : undefined}
        aria-haspopup="true"
        aria-expanded={hoverKey === KEY}
      >
        <NavLabel isActive={isActive} enableHover={enableHover}>{KEY}</NavLabel>
      </Link>

      {/* Dropdown (desktop only) */}
      {enableHover && hoverKey === KEY && (
        <AnimatePresence>
          <m.div
            key="products-dropdown"
            variants={VARS.dropdown}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-6 z-[60] transform-gpu hidden lg:block will-change-transform"
          >
            <SolidPanel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ProductItem
                  title="Passenger Elevators"
                  description="Smooth, silent rides for apartments & offices."
                  href="/products/passenger"
                  src="/Products/PassengerNew.avif"
                  isActive={isHrefActive("/products/passenger")}
                />
                <ProductItem
                  title="Hospital Elevators"
                  description="Stretcher-friendly, precision leveling."
                  href="/products/hospital"
                  src="/Products/HospitalNew.avif"
                  isActive={isHrefActive("/products/hospital")}
                />
                <ProductItem
                  title="Hydraulic Elevators"
                  description="Reliable lifts for low-rise buildings."
                  href="/products/hydraulic"
                  src="/Products/HydraulicNew.avif"
                  objectPos="center"
                  isActive={isHrefActive("/products/hydraulic")}
                />
                <ProductItem
                  title="Goods Elevators"
                  description="Heavy-duty performance for industry."
                  href="/products/goods"
                  src="/Products/GoodsNew.avif"
                  objectPos="bottom"
                  isActive={isHrefActive("/products/goods")}
                />
                <div className="sm:col-span-2 flex justify-center">
                  <ProductItem
                    title="Rauli Elevators"
                    description="Heavy-duty performance for industry."
                    href="/products/rauli"
                    src="/Products/RauliNew.avif"
                    isActive={isHrefActive("/products/rauli")}
                  />
                </div>
              </div>
            </SolidPanel>
          </m.div>
        </AnimatePresence>
      )}
    </div>
  );
});

/* ↓ CTA kept lightweight; hover gated to desktop only */
const ContactCta = memo(({ pathname, setHoverKey, isMobile = false, enableHover }) => {
  const prefetchAllowed = useShouldPrefetch();
  const isActive = useMemo(() => {
    const p = (pathname || "").toLowerCase();
    return p === "/contactus" || p.startsWith("/contactus/");
  }, [pathname]);
  const onEnter = useCallback(() => setHoverKey(null), [setHoverKey]);
  return (
    <div onPointerEnter={onEnter} className="relative px-1 py-2">
      <Link href="/contactus" prefetch={prefetchAllowed} className="inline-block" aria-current={isActive ? "page" : undefined}>
        <m.span
          initial={false}
          whileHover={enableHover ? { scale: 1.03 } : undefined}
          transition={{ duration: 0.15 }}
          className={`inline-flex items-center rounded-full font-extrabold uppercase ${
            isMobile ? "px-2 py-1 text-xs" : "px-2 sm:px-3 py-1 text-xs sm:text-sm md:text-[13px] lg:text-sm"
          }`}
          style={{
            backgroundColor: COLORS.accent,
            color: "#0A0833",
            boxShadow: isActive
              ? "0 0 0 3px rgba(255,255,255,0.35)"
              : "0 6px 18px rgba(0,0,0,0.18)",
            willChange: "transform",
          }}
        >
          CONTACT US
        </m.span>
      </Link>
    </div>
  );
});

/* ====================== Hamburger → Close (GPU cheap) ====================== */
const MobileToggleButton = memo(({ open, onToggle }) => (
  <button
    type="button"
    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 touch-manipulation"
    aria-label={open ? "Close main menu" : "Open main menu"}
    aria-expanded={open}
    aria-controls="mobile-menu"
    onClick={onToggle}
  >
    <m.svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      {/* Top */}
      <m.line
        x1="4"
        x2="20"
        y1="7"
        y2="7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={open ? { y1: 12, y2: 12, rotate: 45 } : { y1: 7, y2: 7, rotate: 0 }}
        style={{ originX: 0.5, originY: 0.5 }}
        transition={{ duration: 0.22 }}
      />
      {/* Middle */}
      <m.line
        x1="4"
        x2="20"
        y1="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={open ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.18 }}
      />
      {/* Bottom */}
      <m.line
        x1="4"
        x2="20"
        y1="17"
        y2="17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={open ? { y1: 12, y2: 12, rotate: -45 } : { y1: 17, y2: 17, rotate: 0 }}
        style={{ originX: 0.5, originY: 0.5 }}
        transition={{ duration: 0.22 }}
      />
    </m.svg>
  </button>
));

/* ============================== HEADER ============================== */
export default function Header() {
  // App Router path (available under src/app)
  let navPathname;
  try {
    navPathname = useNavPathname();
  } catch {
    navPathname = undefined;
  }
  // Pages Router path (available under src/pages)
  let pagesRouter;
  try {
    pagesRouter = useRouter();
  } catch {
    pagesRouter = null;
  }
  const pathname = useMemo(() => {
    if (typeof navPathname === "string" && navPathname) return navPathname;
    const asPath = pagesRouter?.asPath;
    if (asPath) return (asPath.split("?")[0] || "/");
    if (typeof window !== "undefined") return window.location?.pathname || "/";
    return "/";
  }, [navPathname, pagesRouter?.asPath]);
  const [hoverKey, setHoverKey] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false); // mobile only
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isServer = typeof window === "undefined";
  const reducedHook = useReducedMotion();
  const prefersReducedMotion = isServer ? true : reducedHook;
  const enableMotion = mounted && !prefersReducedMotion;

  const headerRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);
  const resizeObserverRef = useRef(null);
  const rafRef = useRef(null);

  // Removed duplicate idle preloading; rely on hidden Next <Image> warmup below.

  /* Desktop flag (lg and above) and pointer: fine to gate hover work */
  const isDesktopWidth = useMediaQuery("(min-width: 1024px)");
  const hasFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const enableHover = isDesktopWidth && hasFinePointer;

  /* Lock background scroll when the mobile menu is open */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prev;
      document.body.style.touchAction = prevTouch;
    };
  }, [mobileOpen]);

  /* Close on ESC for accessibility */
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  /* Measure full header height (white strip + blue bar) with ResizeObserver */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setHeaderH(el.offsetHeight || 0));
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      resizeObserverRef.current = new ResizeObserver(update);
      resizeObserverRef.current.observe(el);
    } else {
      window.addEventListener("resize", update, { passive: true });
    }
    return () => {
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      else window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* Scroll-driven micro-polish (skipped if motion reduced) */
  const { scrollY } = useScroll();

  // ALWAYS call useTransform, then conditionally use its value or a static one
  const brandScaleTransform = useTransform(scrollY, [0, 120], [1, 0.94]);
  const headerShadowTransform = useTransform(
    scrollY,
    [0, 10, 120],
    [
      "0 0 0 rgba(0,0,0,0)",
      "0 4px 14px rgba(0,0,0,0.06)",
      "0 10px 26px rgba(0,0,0,0.12)",
    ]
  );
  const barPadTransform = useTransform(scrollY, [0, 120], [12, 6]);
  const navGapTransform = useTransform(scrollY, [0, 120], [24, 14]);
  const sheenXTransform = useTransform(scrollY, [0, 600], [-140, 140]);
  const sheenOpacityTransform = useTransform(scrollY, [0, 30, 120], [0, 0.22, 0.32]);

  // Now, conditionally assign the MotionValue or a static value
  const brandScale = enableMotion ? brandScaleTransform : 1;
  const headerShadow = enableMotion ? headerShadowTransform : "0 4px 14px rgba(0,0,0,0.06)";
  const barPad = enableMotion ? barPadTransform : 8;
  const navGap = enableMotion ? navGapTransform : 16;
  const sheenX = enableMotion ? sheenXTransform : 0;
  const sheenOpacity = enableMotion ? sheenOpacityTransform : 0;


  const toggleMobileMenu = useCallback(() => {
    setHoverKey(null);
    setMobileOpen((v) => !v);
  }, []);
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);
  const toggleProducts = useCallback(() => setProductsOpen((v) => !v), []);

  return (
    <LazyMotion features={domAnimation}>
      <m.header
        ref={headerRef}
        className={`fixed md:sticky top-0 w-full bg-white ${mobileOpen ? "z-[80]" : "z-50"}`}
        style={{ boxShadow: headerShadow, willChange: "box-shadow" }}
      >
        {/* ROW 1: Brand (white strip) */}
        <div className="border-b border-black/5">
          <m.div
            className="max-w-7xl mx-auto px-4 py-2 lg:py-1 flex items-center justify-center gap-2"
            style={{ scale: brandScale, willChange: "transform" }}
          >
            <Link
              href="/"
              aria-label="Go to home"
              className="flex items-center gap-2 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#78A323] rounded"
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/svs-logo.svg"
                alt="SVS Unitech Elevators"
                width={100}
                height={102}
                priority
                className="w-8 h-auto md:w-[80px] lg:w-[80px] shrink-0"
                sizes="(max-width: 768px) 32px, 80px"
              />
              <div className="leading-tight select-none min-w-0 max-w-[72vw] sm:max-w-none flex flex-col items-center">
                <span
                  className="text-xs sm:text-sm md:text-lg lg:text-2xl font-extrabold tracking-wider text-center"
                  style={{ color: COLORS.title }}
                >
                  SVS UNITECH ELEVATORS
                </span>
                <p
                  className="text-[10px] sm:text-xs md:text-base lg:text-xl font-extrabold mt-1 text-center"
                  style={{ color: COLORS.tagline }}
                >
                  Elevating you to new heights !
                </p>
              </div>
            </Link>
          </m.div>
        </div>

        {/* ROW 2: Full-width dark-blue nav bar */}
        <m.div
          className="w-full relative -mt-px"
          style={{
            background: COLORS.navSolid,
            paddingTop: barPad,
            paddingBottom: barPad,
            willChange: "padding-top, padding-bottom",
          }}
          onPointerLeave={(e) => {
            // Keep dropdown open if pointer moves within header
            const to = e?.relatedTarget;
            const headerEl = headerRef.current;
            if (to && headerEl && typeof headerEl.contains === "function") {
              try {
                if (headerEl.contains(to)) return;
              } catch {}
            }
            setHoverKey(null);
          }}
        >
          {/* Sheen overlay – desktop only */}
          <m.span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block"
            style={{ opacity: sheenOpacity }}
          >
            <m.span
              className="block h-full w-[180%]"
              style={{
                x: sheenX,
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 80%)",
                mixBlendMode: "overlay",
                filter: "blur(0.5px)",
                willChange: "transform",
              }}
            />
          </m.span>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden md:block">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
              <m.div
                className="relative flex items-center justify-center"
                style={{ columnGap: navGap, willChange: "column-gap" }}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-6 xl:gap-8">
                  <BarItem
                    label="HOME"
                    href="/"
                    setHoverKey={setHoverKey}
                    pathname={pathname}
                    enableHover={enableHover}
                  />
                  <BarItem
                    label="CUSTOMIZE"
                    href="/customize"
                    setHoverKey={setHoverKey}
                    pathname={pathname}
                    enableHover={enableHover}
                  />
                  <BarItem
                    label="SERVICES"
                    href="/services"
                    setHoverKey={setHoverKey}
                    pathname={pathname}
                    enableHover={enableHover}
                  />
                  <ProductsBarItem
                    hoverKey={hoverKey}
                    setHoverKey={setHoverKey}
                    pathname={pathname}
                    enableHover={enableHover}
                  />
                  <BarItem
                    label="PROJECTS"
                    href="/projects"
                    setHoverKey={setHoverKey}
                    pathname={pathname}
                    enableHover={enableHover}
                  />
                  <BarItem
                    label="ABOUT US"
                    href="/aboutus"
                    setHoverKey={setHoverKey}
                    pathname={pathname}
                    enableHover={enableHover}
                  />
                  <ContactCta
                    pathname={pathname}
                    setHoverKey={setHoverKey}
                    enableHover={enableHover}
                  />
                </div>
              </m.div>
            </div>
          </nav>

          {/* Mobile nav bar: burger + CTA */}
          <div className="md:hidden flex items-center justify-between px-4">
            <MobileToggleButton open={mobileOpen} onToggle={toggleMobileMenu} />
            <ContactCta
              pathname={pathname}
              setHoverKey={setHoverKey}
              isMobile
              enableHover={false}
            />
          </div>
        </m.div>

        {/* Progress bar — sits flush below the blue bar */}
        <ScrollProgress variant="inline" className="bg-[#7BBF31] -mt-[1px]" />
      </m.header>

      {/* Hidden preloader: only raster assets via Next optimizer, low priority */}
      <div aria-hidden className="pointer-events-none absolute w-0 h-0 overflow-hidden" style={{ opacity: 0 }}>
        {PRODUCT_IMAGE_SPECS.filter(({ src }) => /\.(png|jpe?g|webp|avif)$/i.test(src)).map(({ src, width, height }) => (
          <Image
            key={src}
            src={src}
            width={width}
            height={height}
            alt=""
            priority={false}
            loading="eager"
            decoding="async"
            sizes="140px"
            fetchPriority="low"
          />
        ))}
      </div>

      {/* Mobile overlay (drawer appears BELOW the header height) */}
      <AnimatePresence initial={false} mode="wait">
        {mobileOpen && (
          <>
            {/* Backdrop under the header with blur */}
            <m.div
              role="presentation"
              aria-hidden="true"
              className="fixed inset-0 z-[60] md:hidden bg-black/40 backdrop-blur-md backdrop-saturate-150"
              style={{
                top: headerH,
                WebkitBackdropFilter: "blur(12px)",
                backdropFilter: "blur(12px)",
                willChange: "opacity, backdrop-filter",
                contain: "layout style paint",
              }}
              variants={VARS.backdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeMobileMenu}
            />
            <MobileMenu
              onClose={closeMobileMenu}
              pathname={pathname}
              productsOpen={productsOpen}
              setProductsOpen={toggleProducts}
              headerH={headerH}
            />
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header height on mobile */}
      <div className="md:hidden" style={{ height: headerH }} aria-hidden />
    </LazyMotion>
  );
}

/* ============================== MOBILE MENU ============================== */
const MobileMenu = memo(function MobileMenu({
  onClose,
  pathname,
  productsOpen,
  setProductsOpen,
  headerH,
}) {
  const prefetchAllowed = useShouldPrefetch();
  const navItems = useMemo(
    () => [
      { label: "HOME", href: "/" },
      { label: "CUSTOMIZE", href: "/customize" },
      { label: "SERVICES", href: "/services" },
      { label: "PROJECTS", href: "/projects" },
      { label: "ABOUT US", href: "/aboutus" },
    ],
    []
  );

  const productItems = useMemo(
    () => [
      { label: "Passenger Elevators", href: "/products/passenger", key: "passenger" },
      { label: "Hospital Elevators", href: "/products/hospital", key: "hospital" },
      { label: "Hydraulic Elevators", href: "/products/hydraulic", key: "hydraulic" },
      { label: "Goods Elevators", href: "/products/goods", key: "goods" },
      { label: "Rauli Elevators", href: "/products/rauli", key: "rauli" },
    ],
    []
  );

  const isPathActive = useCallback(
    (path) => {
      if (path === "/") return pathname === "/";
      const p = pathname.toLowerCase().replace(/\/$/, "");
      const h = path.toLowerCase().replace(/\/$/, "");
      return p === h || p.startsWith(h + "/");
    },
    [pathname]
  );

  const isProductActive = useCallback(
    (productKey) => {
      const p = (pathname || "").toLowerCase().replace(/\/$/, "");
      if (!p.startsWith("/products")) return false;
      const slug = p.split("/")[2] || "";
      if (slug === productKey) return true;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get("type");
        const hash = (window.location.hash || "").replace(/^#/, "");
        return typeParam === productKey || hash === productKey;
      } catch {
        return false;
      }
    },
    [pathname]
  );

  /* Autofocus first item for accessibility */
  const firstLinkRef = useRef(null);
  const menuRef = useRef(null);
  const lastFocusRef = useRef(null);
  useEffect(() => {
    firstLinkRef.current?.focus?.({ preventScroll: true });
  }, []);

  // Recompute last focusable when content changes (e.g., productsOpen)
  useEffect(() => {
    const root = menuRef.current;
    if (!root) return;
    const selector = 'a[href], button:not([disabled]), [tabindex="0"]';
    const nodes = Array.from(root.querySelectorAll(selector));
    const visible = nodes.filter((el) => {
      const rects = el.getClientRects();
      return rects && rects.length > 0;
    });
    lastFocusRef.current = visible[visible.length - 1] || firstLinkRef.current;
  }, [productsOpen]);

  const handleProductsClick = useCallback(
    (e) => {
      if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
        onClose();
      } else {
        e.preventDefault();
        setProductsOpen((v) => !v);
      }
    },
    [onClose, setProductsOpen]
  );

  const handleProductClick = useCallback(
    (productKey) => (e) => {
      const url = new URL(window.location);
      url.searchParams.set("type", productKey);
      window.history.pushState({}, "", url);
      onClose();
    },
    [onClose]
  );

  return (
    <m.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      className="fixed left-0 bottom-0 w-4/5 max-w-sm bg-[#0A0833] shadow-xl rounded-r-2xl overflow-hidden z-[70] transform-gpu will-change-transform"
      style={{ top: headerH, contain: "layout paint style" }}
      variants={VARS.mobileMenu}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={TRANSITION}
      ref={menuRef}
    >
      {/* Focus trap sentinels */}
      <span tabIndex={0} aria-hidden="true" className="sr-only" onFocus={() => lastFocusRef.current?.focus?.()} />
      <nav
        className="px-2 pb-2 overflow-y-auto pt-10"
        style={{ maxHeight: `calc(100dvh - ${headerH + 10}px)` }}
      >
        {navItems.map((item, index) => {
          const active = isPathActive(item.href);
          return (
            <m.div
              key={item.label}
              custom={index}
              variants={VARS.menuItem}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={item.href}
                prefetch={prefetchAllowed}
                onClick={onClose}
                ref={index === 0 ? firstLinkRef : undefined}
                className={`flex items-center justify-between px-3 py-3 rounded-lg text-xs sm:text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                  active ? "bg-white/10 text-[#7BBF31]" : "text-white hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </m.div>
          );
        })}

        {/* Products Section */}
        <m.div
          custom={navItems.length}
          variants={VARS.menuItem}
          initial="hidden"
          animate="visible"
        >
          <div
            className={`flex items-center justify-between px-3 py-3 rounded-lg text-xs sm:text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
              isPathActive("/products") ? "bg-white/10 text-[#7BBF31]" : "text-white hover:bg-white/5"
            }`}
          >
            <Link href="/products" onClick={handleProductsClick} className="flex-1">
              PRODUCTS
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setProductsOpen((v) => !v);
              }}
              aria-expanded={productsOpen}
              aria-controls="mobile-products"
              className="ml-2 p-1"
            >
              <m.svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                animate={{ rotate: productsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </m.svg>
            </button>
          </div>

          {/* Products Dropdown (mobile) */}
          <m.div
            id="mobile-products"
            initial={false}
            animate={{
              height: productsOpen ? "auto" : 0,
              opacity: productsOpen ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-1 mb-2 grid grid-cols-1 gap-1 px-1">
              {productItems.map((item, index) => {
                const active = isProductActive(item.key);
                return (
                  <m.div
                    key={item.label}
                    custom={navItems.length + 1 + index}
                    variants={VARS.menuItem}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={item.href}
                      prefetch={prefetchAllowed}
                      onClick={handleProductClick(item.key)}
                      className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center ${
                        active ? "text-[#7BBF31] bg-white/5" : "text-white/90 hover:bg-white/5"
                      }`}
                    >
                      <span className="ml-1">{item.label}</span>
                    </Link>
                  </m.div>
                );
              })}
            </div>
          </m.div>
        </m.div>
      </nav>
      <span tabIndex={0} aria-hidden="true" className="sr-only" onFocus={() => firstLinkRef.current?.focus?.()} />
    </m.div>
  );
});
