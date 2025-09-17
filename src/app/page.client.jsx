"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import nextDynamic from "next/dynamic";
import {
  ArrowRight,
  Building2,
  Award,
  Crown,
  Download,
  Mail,
  Phone,
  MapPin,
  Home as HomeIcon,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea-glow";
import SafetyShieldIcon from "@/components/icons/SafetyShieldIcon";
import ClockTickIcon from "@/components/icons/ClockTickIcon";

/* ========================= Helpers ========================= */
const cx = (...cls) => cls.filter(Boolean).join(" ");
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
function useCanHover() {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    try {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } catch {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);
  return canHover;
}

// Simple client media query hook (client-only)
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener ? m.addEventListener("change", onChange) : m.addListener(onChange);
    return () => {
      m.removeEventListener ? m.removeEventListener("change", onChange) : m.removeListener(onChange);
    };
  }, [query]);
  return matches;
}

/* =================== Lazy heavier visual effects =================== */
const Spotlight = nextDynamic(() => import("@/components/ui/Spotlight").then(m => m.Spotlight), { ssr: false });
const AuroraBackground = nextDynamic(() => import("@/components/ui/aurora-background").then(m => m.AuroraBackground), { ssr: false });
const ShineBorder = nextDynamic(() => import("@/components/ui/shine-border").then(m => m.ShineBorder), { ssr: false });
const ShootingStars = nextDynamic(() => import("@/components/ui/shooting-stars").then(m => m.ShootingStars), { ssr: false });
const StarsBackground = nextDynamic(() => import("@/components/ui/stars-background").then(m => m.StarsBackground), { ssr: false });
// Client islands (code-split) for heavy sections
const LazyMap = nextDynamic(() => import("./home/LazyMap").then(m => m.LazyMap), { ssr: false });
const MemoImageCarousel = nextDynamic(() => import("./home/ImageCarousel").then(m => m.ImageCarousel), { ssr: false });
const MemoLogosCarousel = nextDynamic(() => import("./home/LogosCarousel").then(m => m.LogosCarousel), { ssr: false });

/* Your static PDFs placed under /public */
// Must match the file under public/. Current location: public/Broucher/Brochure Sample.pdf
const BROCHURE_PDF_URL = "/Broucher/Brochure Sample.pdf";
const PHONE_PREFIX = "+91 ";

// API config
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const joinUrl = (base, path) => `${(base || "").replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
const onlyDigits = (v) => (v || "").replace(/\D/g, "");

// CSRF token fetcher (double submit cookie)
let __csrfToken = null;
async function getCsrfToken() {
  if (typeof window === "undefined") return "";
  if (__csrfToken) return __csrfToken;
  try {
    const res = await fetch(joinUrl(API_BASE, "/csrf"), {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    const body = await res.json().catch(() => ({}));
    __csrfToken = body?.token || "";
  } catch {
    __csrfToken = "";
  }
  return __csrfToken;
}

// Basic validators used by popup forms
const validateName = (name) => {
  const n = (name || "").trim();
  if (!n) return "Please enter your name.";
  if (n.length < 2) return "Name must be at least 2 characters.";
  if (!/^[A-Za-z][A-Za-z\s'.-]*$/.test(n)) return "Use letters and spaces only in name.";
  return null;
};
const validatePhoneDisplay = (display) => {
  const digits = onlyDigits(display).replace(/^91/, "");
  if (digits.length !== 10) return "Phone number must be exactly 10 digits.";
  return null;
};

/* Services-style gradient wrapper (client-only) */
const BackgroundGradient = nextDynamic(
  () =>
    import("@/components/ui/BackgroundGradient").then(
      (m) => m.BackgroundGradient
    ),
  { ssr: false }
);

/* ======================== Static data ======================== */
const LOGOS = [
  { src: "/Clients/MP_developers.avif", alt: "MP Developers" },
  { src: "/Clients/Mara_infra.avif", alt: "Mara Infra Solutions" },
  { src: "/Clients/DAC_developers.avif", alt: "DAC Developers" },
  { src: "/Clients/vinayaga_homes.avif", alt: "Vinayaga Homes" },
  { src: "/Clients/ACS_logo.avif", alt: "ACS Promoters" },
];

const RESIDENTIAL_IMAGES = [
  "https://images.pexels.com/photos/1002638/pexels-photo-1002638.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
  "https://images.pexels.com/photos/1797428/pexels-photo-1797428.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
  "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
];

const COMMERCIAL_IMAGES = [
  "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
  "https://images.pexels.com/photos/1797428/pexels-photo-1797428.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
  "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
];

/* =================== State persistence utils =================== */
const STATE_STORAGE_KEY = "svsUnitechHomeState";
const saveStateToStorage = (state) => {
  try {
    const stateToSave = { ...state, timestamp: Date.now() };
    sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.warn("Failed to save state:", error);
  }
};
const loadStateFromStorage = () => {
  try {
    const saved = sessionStorage.getItem(STATE_STORAGE_KEY);
    if (saved) {
      const parsedState = JSON.parse(saved);
      if (Date.now() - parsedState.timestamp < 3600000) return parsedState; // 1 hour freshness
    }
  } catch (error) {
    console.warn("Failed to load state:", error);
  }
  return null;
};

/* =================== Scroll position management =================== */
const RESTORE_FLAG_KEY = "svsRestoreOnReturn";
const SCROLL_POS_KEY = "svsScrollPosition";
const saveScrollPosition = () => {
  try {
    const scrollPos = {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop,
    };
    sessionStorage.setItem(SCROLL_POS_KEY, JSON.stringify(scrollPos));
  } catch (error) {
    console.warn("Failed to save scroll position:", error);
  }
};
const restoreScrollPosition = () => {
  try {
    const saved = sessionStorage.getItem(SCROLL_POS_KEY);
    if (!saved) return;
    const { x, y } = JSON.parse(saved) || {};
    const targetX = x || 0;
    const targetY = y || 0;

    // Perform instant restore to avoid janky animated scrolling on low-end devices.
    // Do a couple of follow-ups to account for late layout shifts.
    const attempts = [0, 120, 300];
    const restore = () => {
      try {
        window.scrollTo(targetX, targetY);
      } catch {
        /* noop */
      }
    };
    attempts.forEach((delay) => (delay ? setTimeout(restore, delay) : restore()));

    // Cleanup after the last attempt
    const last = attempts[attempts.length - 1] || 0;
    setTimeout(() => {
      sessionStorage.removeItem(SCROLL_POS_KEY);
      sessionStorage.removeItem(RESTORE_FLAG_KEY);
    }, last + 80);
  } catch (error) {
    console.warn("Failed to restore scroll position:", error);
  }
};

/* --------- shared easing for slides ---------- */
// Use a smooth crossfade with subtle scale to avoid any visual gap
// between outgoing and incoming images.
const slideEase = [0.22, 1, 0.36, 1];
const slideVariants = {
  enter: () => ({
    opacity: 0,
    scale: 1.02,
    zIndex: 1,
  }),
  center: {
    opacity: 1,
    scale: 1,
    zIndex: 2,
    transition: { duration: 0.8, ease: slideEase },
  },
  exit: () => ({
    opacity: 0,
    scale: 0.98,
    zIndex: 1,
    transition: { duration: 0.8, ease: slideEase },
  }),
};

/* ---------- Close Button ---------- */
function CustomCloseButton({ onClick, ariaLabel = "Close modal" }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="
        group inline-flex items-center justify-center p-3
        text-red-600 bg-red-50 border border-red-200
        rounded-full shadow-sm
        transition-all duration-300 ease-out
        hover:bg-[#78A323]/10 hover:text-[#78A323] hover:border-[#78A323]/40 hover:shadow-md
      "
    >
      <span className="relative block h-5 w-5">
        <span
          className="
            absolute left-1/2 top-1/2 block h-[2px] w-5
            -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full
            bg-red-600
            transition-all duration-300 ease-out
            group-hover:bg-[#78A323] group-hover:w-6 group-active:scale-95
          "
        />
        <span
          className="
            absolute left-1/2 top-1/2 block h-[2px] w-5
            -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full
            bg-red-600
            transition-all duration-300 ease-out
            group-hover:bg-[#78A323] group-hover:w-6 group-active:scale-95
          "
        />
      </span>
    </button>
  );
}
const MemoCustomCloseButton = React.memo(CustomCloseButton);

/* ---------- Carousel Nav Button ---------- */
function CarouselNavButton({ onClick, ariaLabel, icon: Icon }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className="btn-circle btn-close-anim">
      <Icon className="w-5 h-5" />
    </button>
  );
}
const MemoCarouselNavButton = React.memo(CarouselNavButton);

/* ---------- Contact Card Rows (hover gated) ---------- */
function InfoRow({ icon: Icon, title, desc, href, text, canHover }) {
  const Container = href ? "a" : "div";
  return (
    <motion.div
      whileHover={canHover ? { y: -2 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cx(
        "group relative rounded-2xl ring-1 ring-white/10 bg-white/[0.06] overflow-hidden transition-colors duration-300",
        canHover && "hover:bg-white/[0.08]"
      )}
    >
      <Container
        {...(href
          ? {
              href,
              target: href.startsWith("http") ? "_blank" : undefined,
              rel: "noreferrer",
            }
          : {})}
        className={cx(
          "relative z-10 flex items-start gap-4 p-5 rounded-xl transition-colors duration-300",
          canHover && "hover:bg-white/[0.02]"
        )}
      >
        <div className="relative flex-shrink-0">
          <div
            className={cx(
              "w-12 h-12 rounded-xl bg-white/10 ring-1 ring-[#7BBF31]/35 grid place-items-center transition-all duration-300",
              canHover && "group-hover:ring-[#7BBF31] group-hover:ring-2 group-hover:shadow-[0_0_15px_rgba(123,191,49,0.3)]"
            )}
          >
            <div>
              <Icon className="w-6 h-6 text-[#7BBF31]" />
            </div>
          </div>
        </div>
        <div className={cx("min-w-0", canHover && "cursor-pointer")}>
          <h4 className="text-white font-semibold leading-tight">{title}</h4>
          <p className={cx("text-white/70 text-sm mt-1 leading-relaxed", canHover && "group-hover:text-white/90")}>
            {desc}
          </p>
          {text && href && (
            <span className={cx("mt-2 inline-flex items-center text-sm font-medium text-[#7BBF31]", canHover && "underline group-hover:no-underline")}>
              {text}
              <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          )}
          {text && !href && <span className="mt-2 inline-flex items-center text-sm font-medium text-[#7BBF31]">{text}</span>}
        </div>
      </Container>
    </motion.div>
  );
}
const MemoInfoRow = React.memo(InfoRow);

/* LazyMap moved to client island (./home/LazyMap) */

function ContactInfoCard({ canHover }) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const isDesktopOrTablet = useMediaQuery('(min-width: 768px)');
  const shouldFX = mounted && !reduceMotion && isDesktopOrTablet;
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-[#080331] text-white shadow-2xl h-full min-h-[560px] flex flex-col p-8">
      {shouldFX && (
        <StarsBackground className="pointer-events-none opacity-70 mix-blend-screen z-0" starDensity={0.0008} allStarsTwinkle minTwinkleSpeed={0.6} maxTwinkleSpeed={1.2} />
      )}
      {shouldFX && (
        <ShootingStars
          className="pointer-events-none opacity-40 mix-blend-screen z-0"
          minSpeed={12}
          maxSpeed={26}
          minDelay={1400}
          maxDelay={4200}
          starColor="#A5B4FC"
          trailColor="#7BBF31"
          starWidth={12}
          starHeight={1}
        />
      )}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="mb-8">
          <h3 className="text-2xl font-bold">Contact Information</h3>
          <p className="text-white/75 mt-1">We&apos;re here to help, reach out anytime</p>
        </div>
        <div className="space-y-5">
          <MemoInfoRow canHover={canHover} icon={Phone} title="Phone" desc="Call us for immediate assistance" href="tel:+91 90920 80100" text="+91 90920 80100" />
          <MemoInfoRow canHover={canHover} icon={Mail} title="Email" desc="Send us your requirements and we'll reply promptly" href="mailto:svsunitech@gmail.com" text="svsunitech@gmail.com" />
          <MemoInfoRow
            canHover={canHover}
            icon={MapPin}
            title="Address"
            desc={
              <>
                SVS UNITECH Elevators
                <br />
                No.15, Sarayu Park, New Colony,
                <br />
                2nd Main Road, Chennai – 600044
              </>
            }
            text="Open in Maps"
            href="https://maps.google.com/?q=SVS%20UNITECH%20Elevators%20Bangalore%20560001"
          />
        </div>
        <div className="mt-auto" />
      </div>
    </div>
  );
}

/* ---------- Privacy Notice ---------- */
function PrivacyNoticeCard() {
  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-md shadow-sm p-4 md:p-5" aria-label="Privacy Notice">
      <p className="text-gray-700 text-sm leading-relaxed text-justify">
        <span className="font-semibold text-gray-900">Privacy Notice:</span>{" "}
        We value your privacy and ensure your information is secure. By submitting this form, you agree to be contacted by our team for business purposes only. We will not share your information with
        third parties or use it for marketing without your consent.
      </p>
    </div>
  );
}

/* ---------- Animated Bullet (replaces glow-dot) ---------- */
function AnimatedBullet() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const animateEnabled = mounted && isDesktop && !reduceMotion; // disable on md/sm, respect reduced motion

  const ringInitial = animateEnabled ? { scale: 0.85, opacity: 0 } : { scale: 1, opacity: 1 };
  const drawInitial = animateEnabled ? { pathLength: 0 } : { pathLength: 1 };

  return (
    <span className="relative inline-flex items-center justify-center w-6 h-6">
      <motion.span
        className="absolute inset-0 rounded-full ring-2 ring-[#7BBF31] bg-[#7BBF31]/10"
        initial={ringInitial}
        {...(animateEnabled
          ? {
              whileInView: { scale: 1, opacity: 1 },
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              viewport: { once: true, margin: "-20%" },
            }
          : {})}
        aria-hidden
      />
      <motion.svg
        viewBox="0 0 24 24"
        className="relative w-4 h-4 text-[#7BBF31]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <motion.path
          d="M5 12l4 4L19 6"
          initial={drawInitial}
          {...(animateEnabled
            ? {
                whileInView: { pathLength: 1 },
                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
                viewport: { once: true, margin: "-20%" },
              }
            : {})}
        />
      </motion.svg>
    </span>
  );
}

/* LogosCarousel moved to client island (./home/LogosCarousel) */

/* ImageCarousel moved to client island (./home/ImageCarousel) */

/* ---------- Animated Get Quote Button (hover gated) ---------- */
function AnimatedQuoteButton({ onClick, originalColor = "from-blue-600 to-blue-700", canHover }) {
  const focusRing = canHover ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60" : "focus-visible:outline-none";
  return (
    <button
      onClick={onClick}
      className={cx(
        "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-3 text-white font-medium text-sm shadow-lg whitespace-nowrap btn-raise",
        focusRing,
        "active:scale-[.98]"
      )}
      style={{ background: `linear-gradient(to right, ${originalColor.includes("blue") ? "#3b82f6, #1d4ed8" : "#dc2626, #b91c1c"})` }}
    >
      <span className={cx("pointer-events-none absolute -inset-px rounded-full bg-[radial-gradient(closest-side,rgba(123,191,49,0.18),transparent_70%)] opacity-0 blur-md transition-opacity duration-300", canHover && "group-hover:opacity-100")} aria-hidden />
      <span className={cx("sheen-sweep", !canHover && "hidden")} aria-hidden />
      <span className={cx("absolute inset-0 rounded-full bg-gradient-to-r from-[#7BBF31] to-[#78A323] opacity-0 transition-opacity duration-300", canHover && "group-hover:opacity-100")} aria-hidden />
      <span className="relative z-10">Get Quote</span>
      <span className="relative z-10 inline-flex">
        <ArrowRight className="w-4 h-4 icon-nudge-x" />
      </span>
    </button>
  );
}
const MemoAnimatedQuoteButton = React.memo(AnimatedQuoteButton);

/* ============================== Page ============================== */
export default function Home() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const canHover = useCanHover();
  const isDesktopOrTabletRaw = useMediaQuery('(min-width: 768px)');
  const isDesktopRaw = useMediaQuery('(min-width: 1024px)');
  const isDesktopOrTablet = mounted ? isDesktopOrTabletRaw : false;
  const isDesktop = mounted ? isDesktopRaw : false;
  const hoverEnabled = mounted ? (canHover && isDesktopOrTablet) : false;
  const isMdOrBelow = !isDesktop; // apply lightweight animations to md and smaller
  const rm = mounted ? reduceMotion : false; // stabilize reduced-motion on first client render
  const hasRestoredState = useRef(false);

  // state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [brochureData, setBrochureData] = useState({ name: "", phone: "" });
  // submit state + helpers
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState({ type: null, msg: "" }); // 'ok' | 'err' | null
  const [quoteErrors, setQuoteErrors] = useState({ name: null, phone: null });
  const [quoteSubmitAttempted, setQuoteSubmitAttempted] = useState(false);
  const [brochureSubmitting, setBrochureSubmitting] = useState(false);
  const [brochureStatus, setBrochureStatus] = useState({ type: null, msg: "" });
  const [brochureErrors, setBrochureErrors] = useState({ name: null, phone: null });
  const [brochureSubmitAttempted, setBrochureSubmitAttempted] = useState(false);
  const saveTimerRef = useRef(null);

  // Refs for phone inputs
  const quotePhoneRef = useRef(null);
  const brochurePhoneRef = useRef(null);

  // modal animations (lighter on mobile, respect reduced motion)
  const overlayVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: rm ? 0 : (isMdOrBelow ? 0.18 : 0.28), ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, transition: { duration: rm ? 0 : (isMdOrBelow ? 0.16 : 0.24), ease: [0.22, 1, 0.36, 1] } },
  }), [rm, isMdOrBelow]);
  const modalVariants = useMemo(() => ({
    // Centered modal on all screens; small vertical offset for a gentle feel on md and below
    hidden: { opacity: 0, y: isMdOrBelow ? 12 : 20, scale: rm ? 1 : (isMdOrBelow ? 1 : 0.98) },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: rm ? 0 : (isMdOrBelow ? 0.22 : 0.34), ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: isMdOrBelow ? 12 : 12, scale: rm ? 1 : (isMdOrBelow ? 1 : 0.98), transition: { duration: rm ? 0 : (isMdOrBelow ? 0.2 : 0.3), ease: [0.22, 1, 0.36, 1] } },
  }), [rm, isMdOrBelow]);

  // save state
  useEffect(() => {
    if (!hasRestoredState.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveStateToStorage({ showQuoteModal, selectedProduct, formData, showBrochureModal, brochureData });
    }, 250);
    return () => saveTimerRef.current && clearTimeout(saveTimerRef.current);
  }, [showQuoteModal, selectedProduct, formData, showBrochureModal, brochureData]);

  // restore state + scroll
  useEffect(() => {
    const savedState = loadStateFromStorage();
    if (savedState) {
      if (savedState.showQuoteModal) setShowQuoteModal(savedState.showQuoteModal);
      if (savedState.selectedProduct) setSelectedProduct(savedState.selectedProduct);
      if (savedState.formData) {
        const f = savedState.formData || {};
        setFormData({ name: f.name ?? "", phone: f.phone ?? "" });
      }
      if (savedState.showBrochureModal) setShowBrochureModal(savedState.showBrochureModal);
      if (savedState.brochureData) {
        const b = savedState.brochureData || {};
        setBrochureData({ name: b.name ?? "", phone: b.phone ?? "" });
      }
    }
    if (typeof window !== "undefined" && sessionStorage.getItem(RESTORE_FLAG_KEY) === "1") {
      restoreScrollPosition();
    }
    hasRestoredState.current = true;
  }, []);

  // Focus trap and Escape-to-close for open modal (effect moved below handler declarations)

  // only restore scroll when flagged
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    } catch {}
    const restoreIfFlagged = () => {
      if (sessionStorage.getItem(RESTORE_FLAG_KEY) === "1") {
        setTimeout(restoreScrollPosition, 0);
        setTimeout(restoreScrollPosition, 200);
      }
    };
    const onPageShow = () => restoreIfFlagged();
    const onPopState = () => restoreIfFlagged();
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // body scroll lock for modals (match services modal behavior)
  const scrollYRef = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasModalOpen = showQuoteModal || showBrochureModal;
    if (hasModalOpen) {
      scrollYRef.current =
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden"; // match Services modal
      document.body.style.touchAction = "none";
    } else {
      const y = scrollYRef.current || 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      window.scrollTo(0, y);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [showQuoteModal, showBrochureModal]);

  // Prevent iOS scroll chaining (rubber-banding) inside modals
  const quoteScrollRef = useRef(null);
  const brochureScrollRef = useRef(null);
  // Modal container refs for a11y focus management
  const quoteModalRef = useRef(null);
  const brochureModalRef = useRef(null);
  // Track previously focused element to restore focus on close
  const prevFocusRef = useRef(null);
  useEffect(() => {
    const el = showQuoteModal ? quoteScrollRef.current : showBrochureModal ? brochureScrollRef.current : null;
    if (!el) return;
    const handleTouchMove = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight;
      const t = e.touches[0];
      const c = e.changedTouches[0];
      if (!t || !c) return;
      const movingDown = t.clientY > c.clientY;
      const movingUp = t.clientY < c.clientY;
      if ((atTop && movingDown) || (atBottom && movingUp)) e.preventDefault();
    };
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [showQuoteModal, showBrochureModal]);

  /* ---------- Handlers ---------- */
  const clampPhoneCaret = useCallback((el) => {
    if (!el) return;
    const min = PHONE_PREFIX.length;
    const start = Math.max(min, el.selectionStart ?? 0);
    const end = Math.max(min, el.selectionEnd ?? 0);
    if (start !== el.selectionStart || end !== el.selectionEnd) el.setSelectionRange(start, end);
  }, []);
  // Display phone is always "+91 " prefix plus up to 10 digits

  const handleBrochureInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = onlyDigits(value);
      let local = digits.startsWith("91") ? digits.slice(2) : digits;
      local = local.slice(0, 10);
      const next = PHONE_PREFIX + local;
      setBrochureData((prev) => ({ ...prev, phone: next }));
      requestAnimationFrame(() => clampPhoneCaret(brochurePhoneRef.current));
      if (brochureSubmitAttempted) {
        setBrochureErrors((prev) => ({ ...prev, phone: validatePhoneDisplay(next) }));
      } else {
        setBrochureErrors((prev) => ({ ...prev, phone: null }));
      }
    } else {
      setBrochureData((prev) => ({ ...prev, [name]: value }));
      if (name === "name") {
        if (brochureSubmitAttempted) {
          setBrochureErrors((prev) => ({ ...prev, name: validateName(value) }));
        } else {
          setBrochureErrors((prev) => ({ ...prev, name: null }));
        }
      }
    }
  }, [brochureSubmitAttempted, clampPhoneCaret]);

  const toIntlPhone = (display) => {
    const digits = onlyDigits(display);
    if (!digits) return "";
    return digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
  };

  const downloadBrochurePDF = useCallback(() => {
    const a = document.createElement("a");
    const fileUrl = BROCHURE_PDF_URL;
    const fileName = (fileUrl.split("/").pop() || "").split("?")[0] || "brochure.pdf";
    a.href = encodeURI(fileUrl);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleQuoteClick = useCallback((product) => {
    try { prevFocusRef.current = document.activeElement; } catch {}
    setSelectedProduct(product);
    setQuoteStatus({ type: null, msg: "" });
    setQuoteErrors({ name: null, phone: null });
    setQuoteSubmitAttempted(false);
    setQuoteSubmitting(false);
    setShowQuoteModal(true);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = onlyDigits(value);
      let local = digits.startsWith("91") ? digits.slice(2) : digits;
      local = local.slice(0, 10);
      const next = PHONE_PREFIX + local;
      setFormData((prev) => ({ ...prev, phone: next }));
      requestAnimationFrame(() => clampPhoneCaret(quotePhoneRef.current));
      if (quoteSubmitAttempted) {
        setQuoteErrors((prev) => ({ ...prev, phone: validatePhoneDisplay(next) }));
      } else {
        setQuoteErrors((prev) => ({ ...prev, phone: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "name") {
        if (quoteSubmitAttempted) {
          setQuoteErrors((prev) => ({ ...prev, name: validateName(value) }));
        } else {
          setQuoteErrors((prev) => ({ ...prev, name: null }));
        }
      }
    }
  }, [quoteSubmitAttempted, clampPhoneCaret]);

  const downloadQuotePDF = useCallback(() => {
    if (!selectedProduct?.pdfUrl) {
      console.warn("No PDF URL provided for the selected product.");
      return;
    }
    const fileUrl = selectedProduct.pdfUrl;
    const fileName = (fileUrl.split("/").pop() || "").split("?")[0] || "quote.pdf";
    const a = document.createElement("a");
    a.href = encodeURI(fileUrl);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [selectedProduct]);

  const handleCloseQuoteModal = useCallback(() => {
    setShowQuoteModal(false);
    setSelectedProduct(null);
    setFormData({ name: "", phone: "" });
    setQuoteStatus({ type: null, msg: "" });
    setQuoteErrors({ name: null, phone: null });
    setQuoteSubmitAttempted(false);
    setQuoteSubmitting(false);
    // Restore focus to trigger element
    try { prevFocusRef.current && prevFocusRef.current.focus && prevFocusRef.current.focus(); } catch {}
  }, []);
  const handleCloseBrochureModal = useCallback(() => {
    setShowBrochureModal(false);
    setBrochureData({ name: "", phone: "" });
    setBrochureStatus({ type: null, msg: "" });
    setBrochureErrors({ name: null, phone: null });
    setBrochureSubmitAttempted(false);
    setBrochureSubmitting(false);
    // Restore focus to trigger element
    try { prevFocusRef.current && prevFocusRef.current.focus && prevFocusRef.current.focus(); } catch {}
  }, []);

  const handleOpenBrochureModal = useCallback(() => {
    try { prevFocusRef.current = document.activeElement; } catch {}
    setBrochureStatus({ type: null, msg: "" });
    setBrochureSubmitting(false);
    setBrochureErrors({ name: null, phone: null });
    setBrochureSubmitAttempted(false);
    setShowBrochureModal(true);
  }, []);

  // Focus trap and Escape-to-close for open modal (placed after handler declarations to avoid TDZ)
  useEffect(() => {
    const container = showQuoteModal ? quoteModalRef.current : showBrochureModal ? brochureModalRef.current : null;
    if (!container) return;

    const selector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(container.querySelectorAll(selector));

    // Initial focus
    const nodes = getFocusable();
    if (nodes.length) { try { nodes[0].focus(); } catch {} }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (showQuoteModal) handleCloseQuoteModal();
        else if (showBrochureModal) handleCloseBrochureModal();
        return;
      }
      if (e.key === 'Tab') {
        const items = getFocusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !container.contains(active)) { e.preventDefault(); try { last.focus(); } catch {} }
        } else {
          if (active === last || !container.contains(active)) { e.preventDefault(); try { first.focus(); } catch {} }
        }
      }
    };

    container.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showQuoteModal, showBrochureModal, handleCloseQuoteModal, handleCloseBrochureModal]);

  // Smooth scroll helper with reduced-motion + capability guards
  const scrollToPremiumElevators = useCallback(() => {
    const element = document.getElementById("premium-elevators");
    if (!element) return;
    try {
      const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const supportsSmooth = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('scroll-behavior', 'smooth');
      const rect = element.getBoundingClientRect();
      const targetY = (window.pageYOffset || document.documentElement.scrollTop || 0) + rect.top;
      if (reduce || !supportsSmooth) {
        window.scrollTo(0, Math.max(0, targetY));
      } else {
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    } catch {
      element.scrollIntoView();
    }
  }, []);

  // data refs
  const logos = LOGOS;
  const residentialImages = RESIDENTIAL_IMAGES;
  const commercialImages = COMMERCIAL_IMAGES;

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative min-h-[80vh] sm:min-h-[60vh] md:min-h-[81vh] lg:min-h-[83vh] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <video autoPlay muted loop playsInline preload="metadata" className="w-full h-full object-cover" aria-hidden>
            <source src="/Home/hero-1080p24.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white flex flex-col items-center space-y-6 sm:space-y-6 md:space-y-8 lg:space-y-10">
          <h1 className="leading-tight font-black tracking-tight uppercase text-white text-4xl sm:text-5xl md:text-6xl">
            SVS UNITECH ELEVATORS
          </h1>
          <p className="font-extrabold tracking-tight text-[#8BC540] text-lg sm:text-2xl md:text-3xl">
            Elevating you to new heights!
          </p>
          <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
            Premium elevator solutions designed for safety, efficiency, and innovation
          </p>
          <div className="max-w-md sm:max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 hero-cta">
            <div className="w-[95%] mx-auto">
              <CTAButton canHover={hoverEnabled} onClick={scrollToPremiumElevators} text={"Quick\u00A0Quote"} icon={ArrowRight} fullWidth />
            </div>
            <div className="w-[95%] mx-auto">
            <CTAButton canHover={hoverEnabled} text="Brochure" icon={Download} onClick={handleOpenBrochureModal} fullWidth />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 mt-10 sm:mt-14 md:mt-28 lg:mt-24">
            <span className="text-white font-semibold text-sm sm:text-base md:text-lg">Scroll Down</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}>
              <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CLIENTELE */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B0B3B] inline-block">Our Successful Clients</h2>
          </div>
          <MemoLogosCarousel canHover={hoverEnabled} logos={logos} speedSec={28} />
          <p className="text-center mt-8 text-2xl md:text-3xl font-semibold">
            <span className="gradient-flow text-transparent bg-clip-text select-none">Growing</span>
            <span className="loading-dots ml-1 align-baseline" aria-hidden="true">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
          </p>
        </div>
      </section>

      {/* LINE */}
      <motion.div
        className="mx-auto max-w-6xl px-6 origin-center"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        viewport={{ once: true, amount: 0.6 }}
      >
        <div className="h-[2px] mx-8 md:mx-16 rounded-full bg-gradient-to-r from-white via-[#080331] to-white"></div>
      </motion.div>

      {/* ABOUT */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 lg:col-span-2 max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-[#080331] leading-tight">A Quick Intro</h2>
                {/* copy kept as-is */}
                <div className="space-y-6 max-w-3xl mx-auto">
                  <p className="text-xl text-gray-600 leading-relaxed">
                    We are pioneers in vertical transportation, transforming the way people and goods move through buildings. Our innovative elevator solutions combine cutting-edge technology with
                    uncompromising safety standards.
                  </p>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    From residential complexes to towering skyscrapers, we&apos;ve been the trusted partner for architects, builders, and property owners who demand nothing but the best.
                  </p>
                </div>
                <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 w-fit mx-auto gap-x-16 gap-y-6 justify-items-start pl-6 md:pl-10">
                  {["Industry Leading Innovation", "Unmatched Safety Standards", "Global Project Experience", "24/7 Customer Support"].map((text) => (
                    <li key={text} className="min-h-[44px] flex items-center gap-3">
                      <AnimatedBullet />
                      <span className="text-gray-700 font-medium leading-none whitespace-nowrap text-xl">{text}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-center">
                  <CTAButton canHover={hoverEnabled} href="/aboutus" text="Learn More About Us" icon={ArrowRight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LINE */}
      <motion.div
        className="mx-auto max-w-6xl px-6 origin-center"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        viewport={{ once: true, amount: 0.6 }}
      >
        <div className="h-[2px] rounded-full bg-gradient-to-r from-white via-[#080331] to-white"></div>
      </motion.div>

      {/* FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#080331] mb-4">Why Choose Us</h2>
            <p className="text-xl text-[#78A323] max-w-2xl mx-auto">We deliver excellence in every elevator solution with unmatched quality and service</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {[
              { icon: Crown, title: "Premium Quality", desc: "Top-tier materials and craftsmanship", noWrapperAnim: true },
              { icon: SafetyShieldIcon, title: "Safety First", desc: "Advanced safety systems and protocols", noWrapperAnim: true },
              { icon: ClockTickIcon, title: "24/7 Support", desc: "Round-the-clock maintenance and service", noWrapperAnim: true },
              { icon: Award, title: "Certified", desc: "Industry-certified and compliant solutions" },
            ].map((f, i) => (
              <BackgroundGradient key={i} animate containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full" className="rounded-3xl h-full">
                <div className="relative isolate overflow-hidden rounded-3xl p-8 text-white bg-[#080331] shadow-2xl h-full flex flex-col justify-center text-center">
                  <div className="absolute inset-0 opacity-[0.5] pointer-events-none bg-grid-lines" />
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.12] green-wash-12" />
                  {!rm && isDesktop && (
                    <Spotlight
                      fill="rgba(255,255,255,0.95)"
                      className="animate-spotlight opacity-60 mix-blend-screen left-[35%] top-[-30%] w-[500%] h-[700%] [animation-duration:1.6s]"
                    />
                  )}
                  <div className="relative z-10">
                    <div className="relative mx-auto mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 ring-1 ring-[#7BBF31]/35 overflow-visible">
                      <div className="relative z-10 flex items-center justify-center w-full h-full">
                        {f.title === "Premium Quality" || f.title === "Certified" ? (
                          <motion.span
                            animate={rm ? undefined : { scale: [1, 1.1, 1] }}
                            transition={rm ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                            className="flex items-center justify-center origin-center"
                            style={{ transformOrigin: "50% 50%" }}
                            aria-hidden
                          >
                            <f.icon className="w-8 h-8 text-[#7BBF31]" />
                          </motion.span>
                        ) : (
                          <f.icon className="w-8 h-8 text-[#7BBF31]" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl font-extrabold">
                      <span className="bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent">{f.title}</span>
                    </h3>
                    <p className="mt-4 text-white/85 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </BackgroundGradient>
            ))}
          </div>
        </div>
      </section>

      {/* LINE */}
      <motion.div
        className="mx-auto max-w-6xl px-6 origin-center"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        viewport={{ once: true, amount: 0.6 }}
      >
        <div className="h-[2px] rounded-full bg-gradient-to-r from-white via-[#080331] to-white"></div>
      </motion.div>

      {/* PORTFOLIO */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#080331]">Explore Our Portfolio</h2>
            <p className="mt-4 text-[#78A323] text-lg max-w-3xl mx-auto">Discover our impressive range of elevator installations across residential and commercial sectors</p>
          </div>
          <div className="grid gap-10 lg:grid-cols-2 items-stretch">
            {/* Residential */}
            <BackgroundGradient animate containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full" className="rounded-3xl h-full">
              <div className="relative bg-[#080331] rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col">
                <div className="relative h-64">
                  <MemoImageCarousel images={residentialImages} altPrefix="Residential" autoMs={5000} carouselId="residential" />
                  <div className="absolute top-6 left-6 z-30">
                    <motion.div className="relative p-3 bg-[#7BBF31]/20 backdrop-blur-md rounded-2xl border border-[#7BBF31]/30 shadow-xl">
                      <motion.span
                        className="pointer-events-none absolute inset-0 rounded-2xl hidden md:block"
                        initial={{ boxShadow: "0 0 0 0 rgba(123,191,49,0.35)" }}
                        animate={
                          reduceMotion
                            ? {}
                            : {
                                boxShadow: [
                                  "0 0 0 0 rgba(123,191,49,0.35)",
                                  "0 0 0 14px rgba(123,191,49,0)",
                                ],
                              }
                        }
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                      />
                      <HomeIcon className="h-6 w-6 text-[#7BBF31]" />
                    </motion.div>
                  </div>
                </div>
                <div className="p-8 flex-1 grid grid-rows-[auto,1fr,auto] gap-4">
                  <h3 className="text-2xl font-bold text-white">Residential Lifts</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Elegant elevator solutions for homes, apartments, and residential complexes. Designed for comfort, style, and seamless integration with your living space.
                  </p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-10 text-sm">
                    {["Luxury Finishes", "Quiet Operation", "Space Efficient", "Custom Design"].map((text) => (
                      <div key={text} className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#7BBF31] to-[#78A323] shadow" />
                        <span className="text-gray-200">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </BackgroundGradient>

            {/* Commercial */}
            <BackgroundGradient animate containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full" className="rounded-3xl h-full">
              <div className="relative bg-[#080331] rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col">
                <div className="relative h-64">
                  <MemoImageCarousel images={commercialImages} altPrefix="Commercial" autoMs={5200} carouselId="commercial" />
                  <div className="absolute top-6 left-6 z-30">
                    <motion.div className="relative p-3 bg-[#7BBF31]/20 backdrop-blur-md rounded-2xl border border-[#7BBF31]/30 shadow-xl">
                      <motion.span
                        className="pointer-events-none absolute inset-0 rounded-2xl hidden md:block"
                        initial={{ boxShadow: "0 0 0 0 rgba(123,191,49,0.35)" }}
                        animate={
                          reduceMotion
                            ? {}
                            : {
                                boxShadow: [
                                  "0 0 0 0 rgba(123,191,49,0.35)",
                                  "0 0 0 14px rgba(123,191,49,0)",
                                ],
                              }
                        }
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                      />
                      <Building2 className="h-6 w-6 text-[#7BBF31]" />
                    </motion.div>
                  </div>
                </div>
                <div className="p-8 flex-1 grid grid-rows-[auto,1fr,auto] gap-4">
                  <h3 className="text-2xl font-bold text-white">Commercial Lifts</h3>
                  <p className="text-gray-300 leading-relaxed">High-performance elevator systems for offices, hotels, hospitals, and commercial buildings. Engineered for heavy traffic and maximum reliability.</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-10 text-sm">
                    {["High Capacity", "Fast Speed", "Energy Efficient", "Smart Controls"].map((text) => (
                      <div key={text} className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#7BBF31] to-[#78A323] shadow" />
                        <span className="text-gray-200">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </BackgroundGradient>
          </div>
          <div className="mt-12 text-center">
            <CTAButton canHover={hoverEnabled} href="/projects" text="View All Projects" icon={ArrowRight} />
          </div>
        </div>
      </section>

      {/* LINE */}
      <motion.div
        className="mx-auto max-w-6xl px-6"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        viewport={{ once: true, amount: 0.6 }}
      >
        <div className="h-[2px] rounded-full bg-gradient-to-r from-white via-[#080331] to-white"></div>
      </motion.div>

      {/* PREMIUM ELEVATORS */}
      <section id="premium-elevators" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Premium
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-red-600 ml-3">Elevators</span>
            </h2>
            <p className="text-xl text-[#78A323] max-w-3xl mx-auto leading-relaxed">Discover our range of high-quality elevator solutions for residential and commercial applications</p>
          </div>

          {/* Residential products */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-500" />
                <div className="mx-4 px-6 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">Residential Elevators</div>
                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-500" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "ULTRA G+1", capacity: "500kg", price: "₹ 4,50,000", originalPrice: "₹ 5,50,000", discount: "18%", image: "/Home/Premium Elevators/Residential Lift/R1.avif", pdfUrl: "/Lift Quotes Pdf/Residential/G+1.pdf" },
                { name: "ULTRA G+2", capacity: "630kg", price: "₹ 5,25,000", originalPrice: "₹ 6,75,000", discount: "22%", image: "/Home/Premium Elevators/Residential Lift/R2.avif", pdfUrl: "/Lift Quotes Pdf/Residential/G+2.pdf" },
                { name: "ULTRA G+3", capacity: "800kg", price: "₹ 6,75,000", originalPrice: "₹ 8,25,000", discount: "18%", image: "/Home/Premium Elevators/Residential Lift/R3.avif", pdfUrl: "/Lift Quotes Pdf/Residential/G+3.pdf" },
                { name: "ULTRA G+4", capacity: "1000kg", price: "₹ 8,50,000", originalPrice: "₹ 11,50,000", discount: "26%", image: "/Home/Premium Elevators/Residential Lift/R4.avif", pdfUrl: "/Lift Quotes Pdf/Residential/G+4.pdf" },
              ].map((product, index) => (
                <BackgroundGradient key={index} animate containerClassName="rounded-3xl ring-1 ring-blue-300/60 h-full" className="rounded-3xl h-full">
                  <div className="group relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100 h-full">
                    <div className="absolute top-4 right-4 z-30">
                      <motion.div
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg relative overflow-hidden"
                        animate={{ boxShadow: ["0 4px 8px rgba(239, 68, 68, 0.4)", "0 6px 16px rgba(239, 68, 68, 0.6)", "0 4px 8px rgba(239, 68, 68, 0.4)"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }} />
                        <span className="relative z-10">{product.discount} OFF</span>
                      </motion.div>
                    </div>
                    <div className="relative overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={400}
                        height={200}
                        className={cx("w-full h-48 object-cover transition-transform duration-500", canHover && "group-hover:scale-110")}
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="text-blue-600 text-sm font-medium mb-1">SVS UNITECH</div>
                        <h3 className={cx("text-xl font-bold text-gray-900 transition-colors", canHover && "group-hover:text-blue-600")}>{product.name}</h3>
                      </div>
                      <div className="space-y-3">
                        <motion.div
                          animate={{ boxShadow: ["0 0 0 rgba(37, 99, 235, 0)", "0 0 20px rgba(37, 99, 235, 0.3)", "0 0 0 rgba(37, 99, 235, 0)"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-center"
                        >
                          <div className="text-white text-sm font-medium mb-2">Starting from</div>
                          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }} className="text-white text-2xl font-bold mb-2">
                            {product.price}
                          </motion.div>
                          <div className="text-blue-100 text-sm line-through opacity-80">{product.originalPrice}</div>
                        </motion.div>
                      </div>
                      <div className="flex justify-center pt-4 border-t border-gray-200">
                        <MemoAnimatedQuoteButton canHover={hoverEnabled} onClick={(e) => { e.stopPropagation(); handleQuoteClick(product); }} originalColor="from-blue-600 to-blue-700" />
                      </div>
                    </div>
                    <div className={cx("absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none", canHover && "group-hover:opacity-100")} />
                  </div>
                </BackgroundGradient>
              ))}
            </div>
          </div>

          {/* Commercial products */}
          <div>
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-red-500" />
                <div className="mx-4 px-6 py-2 bg-red-100 text-red-800 rounded-full font-semibold">Commercial Elevators</div>
                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-red-500" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "TURBO 1 TON", capacity: "1000kg", price: "₹ 8,50,000", originalPrice: "₹ 11,50,000", discount: "26%", image: "/Home/Premium Elevators/Commercial Elevators/C1New.avif", pdfUrl: "/Lift Quotes Pdf/Commercial/Turbo+1.pdf" },
                { name: "TURBO 2 TON", capacity: "1600kg", price: "₹ 12,75,000", originalPrice: "₹ 16,75,000", discount: "24%", image: "/Home/Premium Elevators/Commercial Elevators/C2.avif", pdfUrl: "/Lift Quotes Pdf/Commercial/Turbo+2.pdf" },
                { name: "TURBO 3 TON", capacity: "2500kg", price: "₹ 18,50,000", originalPrice: "₹ 24,50,000", discount: "24%", image: "/Home/Premium Elevators/Commercial Elevators/C3.avif", pdfUrl: "/Lift Quotes Pdf/Commercial/Turbo+3.pdf" },
                { name: "TURBO 4 TON", capacity: "3000kg", price: "₹ 25,75,000", originalPrice: "₹ 32,75,000", discount: "21%", image: "/Home/Premium Elevators/Commercial Elevators/C4.avif", pdfUrl: "/Lift Quotes Pdf/Commercial/Turbo+4.pdf" },
              ].map((product, index) => (
                <BackgroundGradient key={index} animate containerClassName="rounded-3xl ring-1 ring-red-300/60 h-full" className="rounded-3xl h-full">
                  <div className="group relative bg-gradient-to-br from-slate-50 to-red-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-red-100 h-full">
                    <div className="absolute top-4 right-4 z-30">
                      <motion.div
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg relative overflow-hidden"
                        animate={{ boxShadow: ["0 0 0 rgba(220, 38, 38, 0)", "0 0 20px rgba(220, 38, 38, 0.3)", "0 0 0 rgba(220, 38, 38, 0)"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }} />
                        <span className="relative z-10">{product.discount} OFF</span>
                      </motion.div>
                    </div>
                    <div className="relative overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={400}
                        height={200}
                        className={cx("w-full h-48 object-cover transition-transform duration-500", canHover && "group-hover:scale-110")}
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="text-red-600 text-sm font-medium mb-1">SVS UNITECH</div>
                        <h3 className={cx("text-xl font-bold text-gray-900 transition-colors", canHover && "group-hover:text-red-600")}>{product.name}</h3>
                      </div>
                      <div className="space-y-3">
                        <motion.div
                          animate={{ boxShadow: ["0 0 0 rgba(220, 38, 38, 0)", "0 0 20px rgba(220, 38, 38, 0.3)", "0 0 0 rgba(220, 38, 38, 0)"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-center"
                        >
                          <div className="text-white text-sm font-medium mb-2">Starting from</div>
                          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }} className="text-white text-2xl font-bold mb-2">
                            {product.price}
                          </motion.div>
                          <div className="text-red-100 text-sm line-through opacity-80">{product.originalPrice}</div>
                        </motion.div>
                      </div>
                      <div className="flex justify-center pt-4 border-t border-gray-200">
                        <MemoAnimatedQuoteButton canHover={hoverEnabled} onClick={(e) => { e.stopPropagation(); handleQuoteClick(product); }} originalColor="from-red-600 to-red-700" />
                      </div>
                    </div>
                    <div className={cx("absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none", canHover && "group-hover:opacity-100")} />
                  </div>
                </BackgroundGradient>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <CTAButton canHover={hoverEnabled} href="/products" text="View Products" icon={ArrowRight} />
          </div>
        </div>
      </section>

      {/* LINE */}
      <motion.div
        className="mx-auto max-w-6xl px-6"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        viewport={{ once: true, amount: 0.6 }}
      >
        <div className="h-[2px] rounded-full bg-gradient-to-r from-white via-[#080331] to-white"></div>
      </motion.div>

      {/* CONTACT */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#080331] mb-6">Enquire Now</h2>
            <p className="text-xl text-[#78A323] max-w-3xl mx-auto leading-relaxed">Ready to elevate your building? Get in touch with our experts for consultation and quotes</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Map */}
            <BackgroundGradient animate containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full" className="rounded-3xl h-full">
              <div className="relative isolate overflow-hidden rounded-3xl bg-[#080331] text-white shadow-2xl h-full min-h-[560px] flex flex-col">
                <div className="absolute inset-0 opacity-[0.5] pointer-events-none bg-grid-lines" />
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.12] green-wash-12" />
                <div className="relative z-10 p-6 border-b border-white/10">
                  <h3 className="text-2xl font-bold">Our Location</h3>
                  <p className="text-white/80">Visit our office</p>
                </div>
                <LazyMap
                  className="relative z-10 flex-1 overflow-hidden rounded-b-3xl"
                  title="Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8267256132596!2d77.59456931482236!3d12.917851990894989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1635789012345!5m2!1sen!2sin"
                />
              </div>
            </BackgroundGradient>

            {/* Contact Card */}
            <BackgroundGradient animate containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full" className="rounded-3xl h-full">
              <ContactInfoCard canHover={hoverEnabled} />
            </BackgroundGradient>
          </div>
        </div>
      </section>

      {/* QUOTE MODAL */}
      <AnimatePresence>
        {showQuoteModal && (
          <motion.div
            key="quote-modal"
            className="fixed inset-0 bg-black/60 md:backdrop-blur-sm z-50 flex justify-center items-center p-4 transform-gpu"
            role="dialog"
            aria-modal="true"
            aria-label="Get Quote Modal"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: 'opacity' }}
          >
            <motion.div
              ref={quoteModalRef}
              variants={modalVariants}
              className="relative rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden transform-gpu"
              style={{ willChange: 'opacity, transform', WebkitTransform: 'translateZ(0)' }}
            >
              {isDesktop && <ShineBorder className="z-30" borderWidth={3} duration={14} />}
              <AuroraBackground className="bg-white rounded-[inherit]">
                <div ref={quoteScrollRef} className="relative max-h-[90vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="sticky top-0 bg-transparent p-6 z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Get Quote</h2>
                        <p className="text-gray-600 mt-1">{selectedProduct?.name}</p>
                      </div>
                      <MemoCustomCloseButton onClick={handleCloseQuoteModal} ariaLabel="Close quote form" />
                    </div>
                  </div>
                  <div className="p-6">
                    <form
                      noValidate
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setQuoteStatus({ type: null, msg: "" });
                        setQuoteSubmitAttempted(true);
                        // Client-side validation
                        const nameErr = validateName(formData.name);
                        const phoneErr = validatePhoneDisplay(formData.phone);
                        setQuoteErrors({ name: nameErr, phone: phoneErr });
                        if (nameErr || phoneErr) return;
                        setQuoteSubmitting(true);
                        try {
                          const payload = {
                            name: formData.name,
                            phone: toIntlPhone(formData.phone),
                            type: "quick-quote",
                            productName: selectedProduct?.name || undefined,
                          };
                          // Try /popup-lead first; if missing (404), fall back to /brochure-request
                          const csrf = await getCsrfToken();
                          let res = await fetch(joinUrl(API_BASE, "/popup-lead"), {
                            method: "POST",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
                            body: JSON.stringify(payload),
                          });
                          let ct = res.headers.get("content-type") || "";
                          let body = null;
                          let text = "";
                          if (ct.includes("application/json")) body = await res.json().catch(() => ({}));
                          else text = await res.text().catch(() => "");

                          if (!res.ok && (res.status === 404 || (text && /Cannot POST\s+\/popup-lead/i.test(text)))) {
                            const fbPayload = {
                              name: formData.name,
                              phone: toIntlPhone(formData.phone),
                              lookingFor: selectedProduct?.name
                                ? `Quick quote request for: ${selectedProduct.name}`
                                : "Quick quote request",
                            };
                            res = await fetch(joinUrl(API_BASE, "/brochure-request"), {
                              method: "POST",
                              credentials: "same-origin",
                              headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
                              body: JSON.stringify(fbPayload),
                            });
                            ct = res.headers.get("content-type") || "";
                            body = null;
                            text = "";
                            if (ct.includes("application/json")) body = await res.json().catch(() => ({}));
                            else text = await res.text().catch(() => "");
                          }

                          if (!res.ok) {
                            const msg =
                              (body && (body.error || (Array.isArray(body.errors) && body.errors.map((e) => e.msg).join(", ")) || body.message)) ||
                              text ||
                              `HTTP ${res.status} ${res.statusText}` ||
                              "Failed to submit. Please try again.";
                            throw new Error(msg);
                          }
                          setQuoteStatus({ type: "ok", msg: "Thanks! Your quote is downloading." });
                          setTimeout(() => downloadQuotePDF(), 80);
                        } catch (err) {
                          console.error("Quote submit failed:", err);
                          setQuoteStatus({ type: "err", msg: err?.message || "Failed to submit." });
                        } finally {
                          setQuoteSubmitting(false);
                        }
                      }}
                      className="space-y-6"
                    >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <Textarea
                          as="input"
                          type="text"
                          name="name"
                          value={formData.name ?? ""}
                          onChange={handleInputChange}
                          onBlur={(e) => {
                            const msg = validateName(e.target.value);
                            setQuoteErrors((prev) => ({ ...prev, name: msg }));
                          }}
                          required
                          minLength={2}
                          pattern="^[A-Za-z][A-Za-z\s'.-]*$"
                          placeholder="Enter your full name"
                          aria-label="Full Name"
                          aria-invalid={!!quoteErrors.name || undefined}
                          aria-describedby={quoteErrors.name ? "quote-name-err" : undefined}
                        />
                        {quoteErrors.name && (
                          <p id="quote-name-err" role="status" className="text-red-600 text-xs mt-1">{quoteErrors.name}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <Textarea
                          as="input"
                          type="tel"
                          name="phone"
                          ref={quotePhoneRef}
                          value={formData.phone ?? ""}
                          onChange={handleInputChange}
                          onBlur={(e) => {
                            const msg = validatePhoneDisplay(e.target.value);
                            setQuoteErrors((prev) => ({ ...prev, phone: msg }));
                          }}
                          onFocus={() => {
                            if (!formData.phone || !formData.phone.startsWith(PHONE_PREFIX)) {
                              setFormData((prev) => ({ ...prev, phone: PHONE_PREFIX }));
                            }
                            requestAnimationFrame(() => clampPhoneCaret(quotePhoneRef.current));
                          }}
                          onMouseUp={() => requestAnimationFrame(() => clampPhoneCaret(quotePhoneRef.current))}
                          onClick={() => requestAnimationFrame(() => clampPhoneCaret(quotePhoneRef.current))}
                          onKeyDown={(e) => {
                            const el = quotePhoneRef.current;
                            if (!el) return;
                            const pos = el.selectionStart ?? 0;
                            const min = PHONE_PREFIX.length;
                            if ((e.key === "Backspace" && pos <= min) || (e.key === "Delete" && pos < min)) {
                              e.preventDefault();
                              requestAnimationFrame(() => clampPhoneCaret(el));
                            }
                            if (e.key === "ArrowLeft" && pos <= min) {
                              e.preventDefault();
                              requestAnimationFrame(() => clampPhoneCaret(el));
                            }
                            if (e.key === "Home") {
                              e.preventDefault();
                              requestAnimationFrame(() => clampPhoneCaret(el));
                            }
                          }}
                          required
                          pattern="^\+91\s?[0-9]{10}$"
                          placeholder="e.g., +91 9876543210"
                          aria-label="Phone Number"
                          aria-invalid={!!quoteErrors.phone || undefined}
                          aria-describedby={quoteErrors.phone ? "quote-phone-err" : undefined}
                        />
                        {quoteErrors.phone && (
                          <p id="quote-phone-err" role="status" className="text-red-600 text-xs mt-1">{quoteErrors.phone}</p>
                        )}
                      </div>
                    </div>
                    {/* Removed global error banner from popup */}
                    <PrivacyNoticeCard />
                    <div className="flex justify-center pt-2">
                      {quoteStatus.type === "ok" ? (
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <motion.span
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
                            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.8 }}
                            aria-hidden
                          >
                            <CheckCircle className="w-5 h-5" />
                          </motion.span>
                          <span>{quoteStatus.msg}</span>
                        </div>
                      ) : (
                        <CTAButton
                          canHover={hoverEnabled}
                          as="button"
                          type="submit"
                          text={quoteSubmitting ? "Submitting…" : selectedProduct ? `Download Quote` : "Download Quote PDF"}
                          icon={Download}
                        />
                      )}
                    </div>
                    </form>
                  </div>
                </div>
              </AuroraBackground>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BROCHURE MODAL */}
      <AnimatePresence>
        {showBrochureModal && (
          <motion.div
            key="brochure-modal"
            className="fixed inset-0 bg-black/60 md:backdrop-blur-sm z-50 flex justify-center items-center p-4 transform-gpu"
            role="dialog"
            aria-modal="true"
            aria-label="Download Brochure Modal"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: 'opacity' }}
          >
            <motion.div
              ref={brochureModalRef}
              variants={modalVariants}
              className="relative rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden transform-gpu"
              style={{ willChange: 'opacity, transform', WebkitTransform: 'translateZ(0)' }}
            >
              {isDesktop && <ShineBorder className="z-30" borderWidth={3} duration={14} />}
              <AuroraBackground className="bg-white rounded-[inherit]">
                <div ref={brochureScrollRef} className="relative max-h-[90vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="sticky top-0 bg-transparent p-6 z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Download Our Brochure</h2>
                        <p className="text-gray-600 mt-1">Enter your details to download</p>
                      </div>
                      <MemoCustomCloseButton onClick={handleCloseBrochureModal} ariaLabel="Close brochure form" />
                    </div>
                  </div>
                  <div className="p-6">
                    <form
                      noValidate
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setBrochureStatus({ type: null, msg: "" });
                        setBrochureSubmitAttempted(true);
                        // Client-side validation
                        const nameErr = validateName(brochureData.name);
                        const phoneErr = validatePhoneDisplay(brochureData.phone);
                        setBrochureErrors({ name: nameErr, phone: phoneErr });
                        if (nameErr || phoneErr) return;
                        setBrochureSubmitting(true);
                        try {
                          const payload = {
                            name: brochureData.name,
                            phone: toIntlPhone(brochureData.phone),
                            type: "brochure",
                            lookingFor: "Brochure download",
                          };
                          // Try /popup-lead first; if missing (404), fall back to /brochure-request
                          const csrf2 = await getCsrfToken();
                          let res = await fetch(joinUrl(API_BASE, "/popup-lead"), {
                            method: "POST",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf2 },
                            body: JSON.stringify(payload),
                          });
                          let ct = res.headers.get("content-type") || "";
                          let body = null;
                          let text = "";
                          if (ct.includes("application/json")) body = await res.json().catch(() => ({}));
                          else text = await res.text().catch(() => "");

                          if (!res.ok && (res.status === 404 || (text && /Cannot POST\s+\/popup-lead/i.test(text)))) {
                            const fbPayload = {
                              name: brochureData.name,
                              phone: toIntlPhone(brochureData.phone),
                              lookingFor: payload.lookingFor || "Brochure download",
                            };
                            res = await fetch(joinUrl(API_BASE, "/brochure-request"), {
                              method: "POST",
                              credentials: "same-origin",
                              headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf2 },
                              body: JSON.stringify(fbPayload),
                            });
                            ct = res.headers.get("content-type") || "";
                            body = null;
                            text = "";
                            if (ct.includes("application/json")) body = await res.json().catch(() => ({}));
                            else text = await res.text().catch(() => "");
                          }

                          if (!res.ok) {
                            const msg =
                              (body && (body.error || (Array.isArray(body.errors) && body.errors.map((e) => e.msg).join(", ")) || body.message)) ||
                              text ||
                              `HTTP ${res.status} ${res.statusText}` ||
                              "Failed to submit. Please try again.";
                            throw new Error(msg);
                          }
                          setBrochureStatus({ type: "ok", msg: "Thanks! Your brochure is downloading." });
                          setTimeout(() => downloadBrochurePDF(), 80);
                        } catch (err) {
                          console.error("Brochure submit failed:", err);
                          setBrochureStatus({ type: "err", msg: err?.message || "Failed to submit." });
                        } finally {
                          setBrochureSubmitting(false);
                        }
                      }}
                      className="space-y-6"
                    >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <Textarea
                          as="input"
                          type="text"
                          name="name"
                          value={brochureData.name ?? ""}
                          onChange={handleBrochureInputChange}
                          onBlur={(e) => {
                            const msg = validateName(e.target.value);
                            setBrochureErrors((prev) => ({ ...prev, name: msg }));
                          }}
                          required
                          minLength={2}
                          pattern="^[A-Za-z][A-Za-z\s'.-]*$"
                          placeholder="Enter your full name"
                          aria-label="Full Name"
                          aria-invalid={!!brochureErrors.name || undefined}
                          aria-describedby={brochureErrors.name ? "brochure-name-err" : undefined}
                        />
                        {brochureErrors.name && (
                          <p id="brochure-name-err" role="status" className="text-red-600 text-xs mt-1">{brochureErrors.name}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <Textarea
                          as="input"
                          type="tel"
                          name="phone"
                          ref={brochurePhoneRef}
                          value={brochureData.phone ?? ""}
                          onChange={handleBrochureInputChange}
                          onBlur={(e) => {
                            const msg = validatePhoneDisplay(e.target.value);
                            setBrochureErrors((prev) => ({ ...prev, phone: msg }));
                          }}
                          onFocus={() => {
                            if (!brochureData.phone || !brochureData.phone.startsWith(PHONE_PREFIX)) {
                              setBrochureData((prev) => ({ ...prev, phone: PHONE_PREFIX }));
                            }
                            requestAnimationFrame(() => clampPhoneCaret(brochurePhoneRef.current));
                          }}
                          onMouseUp={() => requestAnimationFrame(() => clampPhoneCaret(brochurePhoneRef.current))}
                          onClick={() => requestAnimationFrame(() => clampPhoneCaret(brochurePhoneRef.current))}
                          onKeyDown={(e) => {
                            const el = brochurePhoneRef.current;
                            if (!el) return;
                            const pos = el.selectionStart ?? 0;
                            const min = PHONE_PREFIX.length;
                            if ((e.key === "Backspace" && pos <= min) || (e.key === "Delete" && pos < min)) {
                              e.preventDefault();
                              requestAnimationFrame(() => clampPhoneCaret(el));
                            }
                            if (e.key === "ArrowLeft" && pos <= min) {
                              e.preventDefault();
                              requestAnimationFrame(() => clampPhoneCaret(el));
                            }
                            if (e.key === "Home") {
                              e.preventDefault();
                              requestAnimationFrame(() => clampPhoneCaret(el));
                            }
                          }}
                          required
                          pattern="^\+91\s?[0-9]{10}$"
                          placeholder="e.g., +91 XXXXX XXXXX"
                          aria-label="Phone Number"
                          aria-invalid={!!brochureErrors.phone || undefined}
                          aria-describedby={brochureErrors.phone ? "brochure-phone-err" : undefined}
                        />
                        {brochureErrors.phone && (
                          <p id="brochure-phone-err" role="status" className="text-red-600 text-xs mt-1">{brochureErrors.phone}</p>
                        )}
                      </div>
                    </div>
                    {/* Removed global error banner from popup */}
                    <PrivacyNoticeCard />
                    <div className="flex justify-center pt-2">
                      {brochureStatus.type === "ok" ? (
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <motion.span
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
                            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.8 }}
                            aria-hidden
                          >
                            <CheckCircle className="w-5 h-5" />
                          </motion.span>
                          <span>{brochureStatus.msg}</span>
                        </div>
                      ) : (
                        <CTAButton
                          canHover={hoverEnabled}
                          as="button"
                          type="submit"
                          text={brochureSubmitting ? "Submitting…" : "Download Brochure PDF"}
                          icon={Download}
                        />
                      )}
                    </div>
                    </form>
                  </div>
                </div>
              </AuroraBackground>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Reusable CTA Button (hover gated) ---------- */
function CTAButton({ href, text, icon: Icon = ArrowRight, onClick, fullWidth = false, as, type = "button", canHover }) {
  const forceButton = as === "button";
  const isButton = forceButton || !href;
  const Wrapper = isButton ? "button" : Link;
  const wrapperProps = isButton ? { type, onClick } : { href };
  const isDownloadIcon = Icon === Download;
  const focusRing = canHover ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60" : "focus-visible:outline-none";

  const handleClick = (e) => {
    if (!isButton && href) {
      try {
        sessionStorage.setItem(RESTORE_FLAG_KEY, "1");
        saveScrollPosition();
      } catch {}
    }
    if (onClick) onClick(e);
  };

  return (
    <Wrapper {...wrapperProps} onClick={handleClick} className={cx("group inline-block", fullWidth && "w-full")}> 
      <span
        className={cx(
          "relative inline-flex items-center justify-center gap-3 overflow-hidden btn-raise rounded-2xl px-10 py-4 text-white font-bold text-lg shadow-lg transition-all duration-300",
          focusRing,
          "active:scale-[.98]",
          fullWidth && "w-full",
          canHover ? "bg-[#080331] hover:bg-[#7BBF31]" : "bg-[#080331]"
        )}
      >
        <span
          className={cx(
            "pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(closest-side,rgba(123,191,49,0.18),transparent_70%)] opacity-0 blur-md transition-opacity duration-300",
            canHover && "group-hover:opacity-100"
          )}
          aria-hidden
        />
        <span className={cx("sheen-sweep", !canHover && "hidden")} aria-hidden />
        <span className="relative z-10">{text}</span>
        <span className="relative z-10 ml-3 inline-flex" aria-hidden="true">
          <Icon className={cx("w-6 h-6", isDownloadIcon ? "icon-bounce-y" : "icon-nudge-x")} />
        </span>
      </span>
    </Wrapper>
  );
}
