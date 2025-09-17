// src/pages/Products.jsx

import Head from "next/head";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Wrench,
  Package,
  Users,
  Heart,
  CalendarDays,
} from "lucide-react";
// Header and Footer are rendered globally in _app.jsx
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";
import { LazyMotion, domAnimation, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";

const Products = () => {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const shouldFX = !prefersReducedMotion && isDesktop;

  // Scroll restore (only via Learn More button)
  const PRODUCTS_SCROLL_KEY = "svsProductsScrollY";
  const PRODUCTS_RESTORE_FLAG = "svsProductsRestoreOnReturn";

  const saveScrollForReturn = useCallback((productId) => {
    try {
      const y = window.scrollY || window.pageYOffset || 0;
      const payload = { y, id: productId, ts: Date.now() };
      sessionStorage.setItem(PRODUCTS_SCROLL_KEY, JSON.stringify(payload));
      sessionStorage.setItem(PRODUCTS_RESTORE_FLAG, "1");
    } catch {/* no-op */}
  }, []);

  useEffect(() => {
    let pollT = null;
    let initialT = null;
    let cleanupT = null;
    try {
      const shouldRestore = sessionStorage.getItem(PRODUCTS_RESTORE_FLAG) === "1";
      const raw = sessionStorage.getItem(PRODUCTS_SCROLL_KEY);
      if (!shouldRestore || !raw) return;

      const payload = JSON.parse(raw) || {};
      const savedY = payload?.y;
      const savedId = payload?.id;
      const ts = payload?.ts;

      // restore only if recent (within 15 minutes)
      if (ts && Date.now() - ts > 15 * 60 * 1000) {
        sessionStorage.removeItem(PRODUCTS_RESTORE_FLAG);
        sessionStorage.removeItem(PRODUCTS_SCROLL_KEY);
        return;
      }

      const cleanup = () => {
        try {
          sessionStorage.removeItem(PRODUCTS_RESTORE_FLAG);
          sessionStorage.removeItem(PRODUCTS_SCROLL_KEY);
        } catch {/* noop */}
      };

      // Force start at the top, then smooth scroll to the card
      try { window.scrollTo(0, 0); } catch {/* noop */}

      let done = false;
      const start = Date.now();
      const maxWait = 1200; // ms to wait for layout

      const trySmoothScroll = () => {
        if (done) return;
        const headerEl = document.querySelector("header.top-0, header[role=banner]");
        const headerH = Math.ceil(headerEl?.getBoundingClientRect?.().height || 0);
        const targetEl = savedId ? document.getElementById(`product-${savedId}`) : null;
        if (targetEl) {
          const top = Math.max(0, window.scrollY + targetEl.getBoundingClientRect().top - (headerH + 12));
          done = true;
          try { window.scrollTo({ top, behavior: "smooth" }); } catch {/* noop */}
          cleanupT = setTimeout(cleanup, 700);
          return;
        }
        if (Date.now() - start < maxWait) {
          pollT = setTimeout(trySmoothScroll, 80);
        } else {
          // Fallback to numeric Y if element not found
          const top = Number.isFinite(savedY) ? Math.max(0, savedY - (headerH + 12)) : 0;
          done = true;
          try { window.scrollTo({ top, behavior: "smooth" }); } catch {/* noop */}
          cleanupT = setTimeout(cleanup, 700);
        }
      };

      initialT = setTimeout(trySmoothScroll, 80);
    } catch {/* no-op */}
    return () => {
      if (initialT) clearTimeout(initialT);
      if (pollT) clearTimeout(pollT);
      if (cleanupT) clearTimeout(cleanupT);
    };
  }, []);

  // Detect desktop (Tailwind `lg` breakpoint: 1024px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    const add = mql.addEventListener ? mql.addEventListener.bind(mql) : mql.addListener.bind(mql);
    const rem = mql.removeEventListener ? mql.removeEventListener.bind(mql) : mql.removeListener.bind(mql);
    add("change", onChange);
    return () => rem("change", onChange);
  }, []);

  // Match Services.jsx CTA animation
  const EASE = [0.22, 1, 0.36, 1];
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };

  const elevatorTypes = [
    {
      id: "passenger",
      name: "Passenger Elevator",
      subtitle: "Auto Door",
      icon: Users,
      description:
        "Sophisticated passenger elevators with automatic doors for seamless urban transportation.",
      features: [
        "Automatic door system",
        "Smooth operation",
        "Modern design",
        "User-friendly controls",
      ],
      color: "purple",
      image: "/Products/PassengerNew.avif",
      stats: { capacity: "1600kg", speed: "2.5m/s", height: "Variable", price: "₹44L+" },
      pricing: { amount: "₹4,400,000", currency: "INR", note: "Auto door system" },
    },
    {
      id: "hospital",
      name: "Hospital Elevator",
      subtitle: "Stretchers / Wheelchairs",
      icon: Heart,
      description:
        "Specialized medical elevators designed for healthcare facilities with accessibility features.",
      features: [
        "Extra-wide doors",
        "Smooth acceleration",
        "Hygienic surfaces",
        "Emergency features",
      ],
      color: "red",
      image: "/Products/HospitalNew.avif",
      stats: { capacity: "2500kg", speed: "1.6m/s", height: "Medical", price: "₹60L+" },
      pricing: { amount: "₹6,000,000", currency: "INR", note: "Medical grade" },
    },
    {
      id: "hydraulic",
      name: "Hydraulic Elevator",
      subtitle: "Hole Type",
      icon: Wrench,
      description:
        "Reliable hydraulic systems perfect for low to mid-rise buildings with exceptional durability.",
      features: [
        "Cost-effective installation",
        "Reliable operation",
        "Low maintenance",
        "Precise leveling",
      ],
      color: "emerald",
      image:
        "/Products/HydraulicNew.avif",
      stats: { capacity: "2500kg", speed: "1.0m/s", height: "18m", price: "₹36L+" },
      pricing: { amount: "₹3,600,000", currency: "INR", note: "Complete system" },
    },
    {
      id: "goods",
      name: "Goods Elevator",
      subtitle: "Manual Door",
      icon: Package,
      description:
        "Heavy-duty freight elevators designed for industrial and commercial cargo transportation.",
      features: [
        "High load capacity",
        "Robust construction",
        "Manual door operation",
        "Industrial grade",
      ],
      color: "orange",
      image: "/Products/GoodsNew.avif",
      stats: { capacity: "5000kg", speed: "1.0m/s", height: "Custom", price: "₹52L+" },
      pricing: { amount: "₹5,200,000", currency: "INR", note: "Heavy-duty build" },
    },
    {
      id: "rauli",
      name: "Rauli Elevator",
      subtitle: "Rope Type",
      icon: Building2,
      description:
        "Premium rope-driven elevator systems engineered for high-rise buildings and superior performance.",
      features: [
        "High-speed operation",
        "Energy efficient",
        "Smooth ride quality",
        "Advanced safety systems",
      ],
      color: "blue",
      image: "/Products/RauliNew.avif",
      stats: { capacity: "3000kg", speed: "4.0m/s", height: "300m", price: "₹68L+" },
      pricing: { amount: "₹6,800,000", currency: "INR", note: "Installation included" },
    },
  ];

  // Prefetch product detail routes on idle for snappier navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cb = () => {
      try {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const saveData = !!conn?.saveData;
        const slow = typeof conn?.effectiveType === "string" && /(^|-)2g$/i.test(conn.effectiveType || "");
        // Avoid heavy preloads on slow networks or when user requests data savings
        if (saveData || slow) return;
        elevatorTypes.forEach((e) => router.prefetch(`/products/${e.id}`));
      } catch {/* noop */}
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(cb, { timeout: 2000 });
      return () => typeof window.cancelIdleCallback === "function" && window.cancelIdleCallback(id);
    } else {
      const t = setTimeout(cb, 1200);
      return () => clearTimeout(t);
    }
  }, [router]);

  const tagGradient = () => "from-red-700 to-red-700";

  // price helpers
  const parseMoney = (str) => {
    const n = parseFloat(String(str).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };
  const findSymbol = (str) =>
    (String(str).match(/^[^\d]+/)?.[0] || "₹").trim();
  const formatMoney = (n, symbol = "₹") =>
    `${symbol}${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Products — SVS Unitech Elevators</title>
        <meta
          name="description"
          content="Explore our premium range of elevator products: passenger, hospital, hydraulic, goods, and rauli elevators."
        />
      </Head>

      {/* Header rendered in _app.jsx */}

      {/* Hero (match Services design) */}
      <section className="relative overflow-hidden py-24 sm:py-28 md:py-32 lg:py-36 flex items-center mb-8 sm:mb-12 md:mb-16">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/Products/ProductsHero.avif"
            alt="SVS Unitech products hero"
            fill
            priority
            sizes="100vw"
            className={shouldFX ? "object-cover transform-gpu hero-zoom hero-fade-in" : "object-cover"}
          />
        </div>
        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/65 to-black/45" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_40%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.6)_100%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-10 sm:mb-12 md:mb-14">
            <motion.div
              className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-5 sm:mb-6 md:mb-8 border border-white/20"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
            >
              <motion.span
                className="mr-3 relative inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 ring-1 ring-white/30 overflow-hidden"
                aria-hidden
              >
                {/* soft radial pulse ring */}
                <motion.span
                  className="pointer-events-none absolute inset-0 rounded-full hidden md:block"
                  initial={{ boxShadow: "0 0 0 0 rgba(255,255,255,0.45)" }}
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          boxShadow: [
                            "0 0 0 0 rgba(255,255,255,0.45)",
                            "0 0 0 10px rgba(255,255,255,0)",
                          ],
                        }
                  }
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
                {/* Elevator icon with doors opening/closing */}
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3 sm:w-4 sm:h-4 relative z-[1]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Shaft/frame */}
                  <rect x="5.5" y="3.5" width="13" height="17" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" opacity="0.95" />
                  {/* Tracks top/bottom */}
                  <path d="M6.5 7h11" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
                  <path d="M6.5 17h11" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
                  {/* Center seam (fades when doors open) */}
                  <motion.path
                    d="M12 7.2v9.6"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    animate={
                      prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.8, 0.2, 0.8] }
                    }
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Left door */}
                  <motion.rect
                    x="6.8"
                    y="7.5"
                    width="4.6"
                    height="9"
                    rx="0.6"
                    fill="currentColor"
                    animate={
                      prefersReducedMotion ? { x: 0 } : { x: [0, -2.2, 0] }
                    }
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Right door */}
                  <motion.rect
                    x="12.6"
                    y="7.5"
                    width="4.6"
                    height="9"
                    rx="0.6"
                    fill="currentColor"
                    animate={
                      prefersReducedMotion ? { x: 0 } : { x: [0, 2.2, 0] }
                    }
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.svg>
              </motion.span>
              Premium Elevator Solutions
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 sm:mb-6 md:mb-8 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
            >
              <span className="block overflow-hidden">
                <motion.span className="inline-block text-white" initial={{ y: "100%" }} animate={{ y: 0, transition: { duration: 0.6 } }}>
                  Our
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span className="inline-block text-white" initial={{ y: "100%" }} animate={{ y: 0, transition: { duration: 0.6, delay: 0.05 } }}>
                  Products
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } }}
            >
              Discover our comprehensive range of elevator solutions engineered for residential,
              commercial, and industrial applications.
            </motion.p>
          </div>

          {/* Stats grid removed as requested */}
        </div>
      </section>

      {/* Products — compact cards */}
      <section className="pt-0 pb-12 relative" style={{ contentVisibility: "auto", containIntrinsicSize: "1px 900px" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 relative z-10">
            {elevatorTypes.map((elevator, index) => {
              const isEven = index % 2 === 0;

              const symbol = findSymbol(elevator.pricing.amount);
              const nowPrice = parseMoney(elevator.pricing.amount);
              const originalPrice = nowPrice > 0 ? nowPrice / 0.85 : 0;

              return (
                <BackgroundGradient
                  key={elevator.id}
                  animate={shouldFX}
                  containerClassName="rounded-3xl ring-1 ring-[#78A323]/60"
                  className="rounded-3xl"
                >
                  <div
                    id={`product-${elevator.id}`}
                    className={`group relative bg-[#080331] rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-700 ${
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    } flex flex-col lg:flex`}
                  >
                    {/* background accents */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#7BBF31]/20 to-[#78A323]/20" />
                      <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-bl from-[#7BBF31]/10 to-transparent rounded-full translate-x-24 -translate-y-24" />
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#78A323]/5 to-transparent rounded-full -translate-x-20 translate-y-20" />
                    </div>

                    {/* image */
                    }
                    <div className="lg:w-1/2 relative h-56 sm:h-64 lg:h-auto lg:min-h-[18rem] xl:min-h-[20rem] overflow-hidden">
                      <Image
                        src={elevator.image}
                        alt={elevator.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 640px"
                        className={shouldFX ? "object-cover object-center transform-gpu transition-transform duration-700" : "object-cover object-center"}
                        priority={index === 0}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "low"}
                      />
                      <div
                        className={`${
                          isEven ? "bg-gradient-to-r" : "bg-gradient-to-l"
                        } absolute inset-0 from-[#080331]/80 to-[#080331]/60 opacity-60 md:opacity-70 transition-opacity duration-500`}
                      />

                      {/* floating icon with animated ring (match Services) */}
                      <div className="absolute top-6 left-6">
                        <motion.div className="relative p-3 bg-[#7BBF31]/20 backdrop-blur-md rounded-2xl border border-[#7BBF31]/30 shadow-xl">
                          <motion.span
                            className="pointer-events-none absolute inset-0 rounded-2xl hidden md:block"
                            initial={{ boxShadow: "0 0 0 0 rgba(123,191,49,0.35)" }}
                            animate={shouldFX ? { boxShadow: [
                              "0 0 0 0 rgba(123,191,49,0.35)",
                              "0 0 0 14px rgba(123,191,49,0)",
                            ] } : {}}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                          />
                          <elevator.icon className="h-7 w-7 text-[#7BBF31] drop-shadow-lg" />
                        </motion.div>
                      </div>
                    </div>

                    {/* content */}
                    <div className="lg:w-1/2 p-4 lg:p-6 flex flex-col justify-center relative z-10">
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1.5 bg-[#7BBF31]/20 backdrop-blur-sm rounded-full text-[#7BBF31] text-xs font-medium border border-[#7BBF31]/30">
                          {elevator.subtitle}
                        </span>
                      </div>

                      <h3 className="text-xl lg:text-2xl font-black text-white mb-3 leading-tight">
                        {elevator.name}
                      </h3>

                      <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-5 font-light">
                        {elevator.description}
                      </p>

                      {/* STARTING FROM — no tilt on hover, only scale forward; innovative label */}
                      <div className="mb-6 relative">
                        <div className="relative group cursor-pointer">
                          {/* main card */}
                          <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 shadow-2xl transform transition-transform duration-500 lg:group-hover:scale-105 overflow-hidden">
                            {/* animated background */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-white/10 "></div>
                              <div className="absolute -top-3 -right-3 w-20 h-20 bg-white/20 rounded-full animate-bounce"></div>
                              <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-white/15 rounded-full animate-float-1"></div>
                            </div>

                            {/* glowing border */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-transparent to-white/20 "></div>

                            {/* content */}
                            <div className="relative z-10 text-center text-white">
                              {/* Innovative pill: spinning ring + gradient text + chevrons */}
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-extrabold tracking-widest mb-3">
                                {/* gradient label */}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                                  STARTING FROM
                                </span>
                              </div>

                              {/* shimmer underline */}
                              <div className="relative mx-auto -mt-1 mb-4 h-px w-28 overflow-hidden rounded-full">
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent " />
                              </div>

                              {/* prices row */}
                              <div className="mb-2.5 flex items-baseline justify-center gap-3">
                                <div className="text-3xl font-black">
                                  {elevator.pricing.amount}
                                </div>
                                {originalPrice > 0 && (
                                  <div className="text-lg font-bold line-through opacity-80">
                                    {formatMoney(originalPrice, symbol)}
                                  </div>
                                )}
                              </div>

                              {/* badges row removed as requested */}
                            </div>

                            {/* float bits */}
                            <div className="absolute top-3 right-3 w-6 h-6 bg-white/30 rounded-full animate-float-3"></div>
                            <div className="absolute bottom-3 left-3 w-5 h-5 bg-white/25 rounded-full animate-float-1"></div>

                            {/* sheen */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
                          </div>

                          {/* hover glow */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl blur-xl opacity-0 lg:group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>

                          {/* SAVE 15% tag */}
                          <div className="absolute -top-3 -right-3 transform lg:group-hover:scale-110 transition-transform duration-300">
                            <div
                              className={`bg-gradient-to-r ${tagGradient()} text-white px-3 py-1 rounded-xl shadow-lg font-bold text-xs animate-bounce`}
                            >
                              SAVE 15%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* features */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {elevator.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center space-x-3"
                          >
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#7BBF31] to-[#78A323] shadow-lg" />
                            <span className="text-gray-200 text-sm md:text-base font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA — matches Services.jsx Learn More button (modern Link, no legacyBehavior) */}
                      <motion.div
                        whileHover={
                          isDesktop
                            ? { y: -2, boxShadow: "0 12px 30px rgba(123,191,49,0.35)" }
                            : undefined
                        }
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                        className="w-fit"
                      >
                        <Link
                          href={`/products/${elevator.id}`}
                          prefetch
                          aria-label={`Learn more about ${elevator.name}`}
                          onClick={() => {
                            // Save scroll only for Learn More navigations
                            saveScrollForReturn(elevator.id);
                          }}
                          onMouseEnter={() => router.prefetch(`/products/${elevator.id}`)}
                          onFocus={() => router.prefetch(`/products/${elevator.id}`)}
                          className="
                            group/learn relative inline-flex items-center justify-center
                            overflow-hidden rounded-2xl px-8 py-4
                            text-white font-bold
                            bg-gradient-to-r from-red-600 to-red-700 lg:hover:from-[#7BBF31] lg:hover:to-[#78A323]
                            border border-red-500/30 lg:hover:border-[#7BBF31]/30 shadow-lg
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60
                            w-fit
                          "
                        >
                          {/* sheen sweep */}
                          <span
                            className="
                              pointer-events-none absolute inset-y-0 -left-1/2 w-1/2
                              -skew-x-12 bg-white/40 blur-sm
                              transition-transform duration-700 ease-out
                              translate-x-0 lg:group-hover/learn:translate-x-[220%]
                              z-20
                            "
                            aria-hidden
                          />
                          <span className="relative z-10 text-lg">Learn More</span>
                          <motion.svg
                            viewBox="0 0 24 24"
                            className="ml-3 h-6 w-6 relative z-10"
                            animate={{ x: [0, 2, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <path fill="currentColor" d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                          </motion.svg>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </BackgroundGradient>
              );
            })}
          </div>
        </div>
      </section>

      {/* Separator (match Services gradient line) */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80" />
      </div>

      {/* CTA (match Services.jsx 'Get in touch' render animation) */}
      <section className="py-20 bg-white" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <motion.div
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            variants={fadeUp}
          >
            Make every floor effortless
          </motion.h2>
          <motion.p
            className="text-xl text-[#78A323] mb-8 leading-relaxed"
            variants={fadeUp}
            transition={{ delay: 0.05 }}
          >
            Let our team recommend the best-fit system for you.
          </motion.p>
          <motion.button
            onClick={() => router.push(`/contactus`)}
            variants={fadeUp}
            whileHover={
              isDesktop
                ? { y: -2, boxShadow: "0 12px 30px rgba(123,191,49,0.35)" }
                : undefined
            }
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="
              group/learn relative inline-flex items-center justify-center
              overflow-hidden rounded-2xl px-8 py-4
              text-white font-bold
              bg-gradient-to-r from-[#080331] to-[#080331] lg:hover:from-[#7BBF31] lg:hover:to-[#78A323]
              border border-red-500/30 lg:hover:border-[#7BBF31]/30 shadow-lg
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60
              w-fit
            "
          >
            <span
              className="
                pointer-events-none absolute inset-y-0 -left-1/2 w-1/2
                -skew-x-12 bg-white/40 blur-sm
                transition-transform duration-700 ease-out
                translate-x-0 lg:group-hover/learn:translate-x-[220%]
                z-20
              "
              aria-hidden
            />
            {/* Animated schedule icon (professional, subtle) */}
            <motion.span
              className="relative z-10 mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-sm"
              initial={{ scale: 1, rotate: 0 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { scale: [1, 1.05, 1], rotate: [0, 2, 0] }
              }
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* soft pulse ring */}
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-xl"
                initial={{ boxShadow: "0 0 0 0 rgba(123,191,49,0.35)" }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        boxShadow: [
                          "0 0 0 0 rgba(123,191,49,0.35)",
                          "0 0 0 10px rgba(123,191,49,0)",
                        ],
                      }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <CalendarDays className="h-5 w-5 text-white/95" />
            </motion.span>
            <span className="relative z-10 text-lg">Schedule a Call</span>
          </motion.button>
        </motion.div>
      </section>

      {/* Footer rendered in _app.jsx */}
    </div>
    </LazyMotion>
  );
};

export default Products;

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
