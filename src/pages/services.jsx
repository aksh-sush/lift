// src/pages/services.jsx
import { useState, useEffect, useRef, useCallback, memo } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Settings,
  Shield,
  Wrench,
  Star,
  CheckCircle,
  Phone,
  Diamond,
  Sliders,
  Cog,
  Headphones,
  Search,
  Building,
  Award,
  Zap,
} from "lucide-react";
import { LazyMotion, domAnimation, motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";
// Header and Footer are rendered globally in _app.jsx

/* Gradient wrapper is SSR-safe; use static import to improve LCP */

// (Removed slideshow per request; hero uses a single static image)

// Modal: dynamically import to reduce initial JS
const FeaturesModal = dynamic(() => import("@/components/services/FeaturesModal"), { ssr: false });

/* ===== Variants & constants ===== */
const EASE = [0.22, 1, 0.36, 1];
// Shared hero/CTA variants (align with About Us/Projects)
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const slideMask = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: { duration: 0.6, ease: EASE } },
};
const stepItem = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: EASE, delay: i * 0.15 },
  }),
};
const badgeIn = {
  hidden: { scale: 0.8, rotate: -6, opacity: 0 },
  visible: (i) => ({
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: EASE, delay: 0.15 + i * 0.15 },
  }),
};

/* ===== Data ===== */
  const SERVICES = [
    {
      id: "installation",
      title: "Lift Installation",
    description:
      "Professional installation of modern elevator systems with cutting-edge technology and safety features.",
    image: "/Services/Lift installations.avif",
    icon: Settings,
    features: [
      "Custom design consultation",
      "Energy-efficient motors",
      "Modern control systems",
      "24/7 installation support",
    ],
  },
  {
    id: "quality",
    title: "Quality Assurance",
    description:
      "Rigorous testing and certification processes to ensure the highest safety and performance standards.",
    image: "/Services/Quality assurance.avif",
    icon: Shield,
    features: [
      "Safety system validation",
      "Regulatory compliance",
      "Performance optimization",
      "Documentation",
    ],
  },
    {
      id: "maintenance",
      title: "Lift Maintenance",
      description:
        "Comprehensive maintenance programs to keep your elevators running smoothly and safely.",
      image: "/Services/Lift maintenance.avif",
      icon: Wrench,
      features: [
        "Preventive maintenance",
        "Parts replacement",
        "Emergency repair services",
      "System upgrades",
    ],
  },
];

// (Removed multi-image slideshow; single hero image is used)

const AMC_PLANS = [
  {
    id: "silver",
    name: "Silver Plan",
    price: "2,500",
    period: "per year",
    description: "Essential maintenance coverage for basic elevator needs",
    features: [
      "Quarterly maintenance visits",
      "Basic safety inspections",
      "Emergency call support (9 AM - 6 PM)",
      "Minor parts replacement",
      "Performance reports",
      "Basic troubleshooting",
    ],
    accent: "gray",
  },
  {
    id: "gold",
    name: "Gold Plan",
    price: "4,500",
    period: "per year",
    description:
      "Comprehensive maintenance with priority support and advanced features",
    features: [
      "Monthly maintenance visits",
      "Comprehensive safety audits",
      "Emergency call support (24/7)",
      "All parts replacement included",
      "Detailed performance analytics",
      "Predictive maintenance alerts",
      "Priority response time",
      "Annual system upgrades",
    ],
    accent: "yellow",
    popular: true,
  },
  {
    id: "platinum",
    name: "Platinum Plan",
    price: "7,500",
    period: "per year",
    description: "Premium service with complete coverage and exclusive benefits",
    features: [
      "Bi-weekly maintenance visits",
      "Advanced diagnostics & monitoring",
      "Dedicated support manager",
      "All parts & labor included",
      "Real-time system monitoring",
      "Proactive maintenance scheduling",
      "Guaranteed 2-hour response",
      "Free modernization consultations",
      "Extended warranty coverage",
      "VIP customer support",
    ],
    accent: "purple",
  },
];

const PROCESS_STEPS = [
  {
    number: "1",
    title: "Consultation",
    description:
      "On-site survey with capacity, speed and code requirements, then clear budget and timeline are set.",
  },
  {
    number: "2",
    title: "Planning",
    description:
      "Engineered drawings, material & finish selection, and approvals scheduled with zero surprises.",
  },
  {
    number: "3",
    title: "Implementation",
    description:
      "Precision installation, wiring, and calibration—backed by 100+ QA checks and load testing.",
  },
  {
    number: "4",
    title: "Support",
    description:
      "Proactive maintenance, 24/7 service, remote diagnostics, and periodic safety audits to keep you running.",
  },
];

const SERVICE_DETAILS = {
  installation: {
    title: "What We Offer",
    subtitle: "Comprehensive solutions tailored to your needs",
    features: [
      {
        icon: Diamond,
        title: "Custom design consultation",
        description:
          "On-site survey and traffic analysis to size the lift right. Get a tailored spec, BOQ, drawings, and a clear timeline.",
      },
      {
        icon: Sliders,
        title: "Modern control systems",
        description:
          "VVVF/gearless control with precise leveling, ARD (auto-rescue), and optional remote monitoring for maximum uptime.",
      },
      {
        icon: Cog,
        title: "Energy-efficient motors",
        description:
          "Gearless PMSM motors with regenerative drives, LED cabin lighting, and standby modes to cut power use and noise.",
      },
      {
        icon: Headphones,
        title: "24/7 installation support",
        description:
          "Dedicated site engineer, daily progress updates, safety-first execution, and round-the-clock assistance until commissioning.",
      },
      {
        icon: Search,
        title: "Comprehensive testing",
        description:
          "Full-load and safety tests—brake, overspeed, door interlocks—plus ride-quality and leveling calibration before handover.",
      },
      {
        icon: Building,
        title: "Building code compliance",
        description:
          "End-to-end documentation and liaison to meet local lift codes and fire requirements; handed over with certificates and manuals.",
      },
    ],
  },
  quality: {
    title: "Quality Assurance",
    subtitle: "Rigorous standards for safety and performance",
    features: [
      {
        icon: Shield,
        title: "Safety system validation",
        description:
          "Comprehensive testing of all safety mechanisms including emergency brakes, door sensors, and backup systems.",
      },
      {
        icon: CheckCircle,
        title: "Regulatory compliance",
        description:
          "Full compliance with local and international elevator codes, safety standards, and building regulations.",
      },
      {
        icon: Settings,
        title: "Performance optimization",
        description:
          "Fine-tuning of all systems for optimal performance, energy efficiency, and smooth operation.",
      },
      {
        icon: Award,
        title: "Documentation & certification",
        description:
          "Complete documentation package with certificates, warranties, and maintenance manuals.",
      },
      {
        icon: Search,
        title: "Quality inspections",
        description:
          "Multi-stage quality checks throughout installation with detailed inspection reports.",
      },
      {
        icon: Zap,
        title: "Performance testing",
        description:
          "Comprehensive load testing, speed calibration, and ride quality assessments.",
      },
    ],
  },
  maintenance: {
    title: "Maintenance Services",
    subtitle: "Keeping your elevators running smoothly",
    features: [
      {
        icon: Wrench,
        title: "Preventive maintenance",
        description:
          "Regular scheduled maintenance to prevent breakdowns and extend equipment life.",
      },
      {
        icon: Cog,
        title: "Parts replacement",
        description:
          "Genuine parts replacement with warranty coverage and quick turnaround times.",
      },
      {
        icon: Phone,
        title: "Emergency repair services",
        description:
          "24/7 emergency response with guaranteed response times and expert technicians.",
      },
      {
        icon: Settings,
        title: "System upgrades",
        description:
          "Modernization services to upgrade older systems with latest technology and safety features.",
      },
      {
        icon: Search,
        title: "Diagnostic services",
        description:
          "Advanced diagnostic tools to identify potential issues before they become problems.",
      },
      {
        icon: Shield,
        title: "Safety inspections",
        description:
          "Regular safety audits and compliance checks to ensure ongoing safety standards.",
      },
    ],
  },
};

const accentClasses = {
  gray: {
    grad: "from-gray-400 to-gray-600",
    text: "text-gray-400",
    glow: "from-gray-400/10 via-gray-500/10 to-gray-400/10",
    gradTextFrom: "from-gray-400",
    gradTextTo: "to-gray-400",
  },
  yellow: {
    grad: "from-yellow-400 to-yellow-600",
    text: "text-yellow-400",
    glow: "from-yellow-400/10 via-yellow-500/10 to-yellow-400/10",
    gradTextFrom: "from-yellow-400",
    gradTextTo: "to-yellow-400",
  },
  purple: {
    grad: "from-purple-400 to-purple-600",
    text: "text-purple-400",
    glow: "from-purple-400/10 via-purple-500/10 to-purple-400/10",
    gradTextFrom: "from-purple-400",
    gradTextTo: "to-purple-400",
  },
};

/* ================= Subcomponents ================= */
const Separator = memo(function Separator() {
  return (
    <motion.div
      className="mx-auto max-w-6xl px-6"
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{
        opacity: 1,
        scaleX: 1,
        transition: { duration: 0.5, ease: EASE },
      }}
      viewport={{ once: true, amount: 0.6 }}
      style={{ transformOrigin: "center" }}
    >
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80"></div>
    </motion.div>
  );
});

const ServiceCard = memo(function ServiceCard({ service, index, onLearnMore, isTouchDevice, onPreloadModal }) {
  const isEven = index % 2 === 0;
  const Icon = service.icon;
  const prefersReducedMotion = useReducedMotion();
  
  // Conditionally apply hover animations
  const buttonHoverProps = !isTouchDevice && !prefersReducedMotion ? {
    whileHover: { y: -2, boxShadow: "0 12px 30px rgba(123,191,49,0.35)" },
    transition: { type: "spring", stiffness: 320, damping: 22 }
  } : {};
  
  return (
    <BackgroundGradient
      animate={!isTouchDevice}
      containerClassName="rounded-3xl ring-1 ring-[#78A323]/60"
      className="rounded-3xl"
    >
      <div
        id={service.id}
        className={`group relative bg-[#080331] rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-700 scroll-mt-28 md:scroll-mt-40 ${
          isEven ? "lg:flex-row" : "lg:flex-row-reverse"
        } flex flex-col lg:flex animate-fade-in-up`}
        style={{ animationDelay: `${index * 200}ms` }}
      >
        {/* Image */}
        <div className="lg:w-1/2 relative h-64 sm:h-80 md:h-96 lg:h-[500px]">
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            className={`${
              isEven ? "bg-gradient-to-r" : "bg-gradient-to-l"
            } absolute inset-0 from-[#080331]/80 to-[#080331]/60 opacity-75`}
          />
          {/* Floating Icon */}
          <div className="absolute top-6 left-6">
            <motion.div className="relative p-3 sm:p-4 bg-[#7BBF31]/20 backdrop-blur-md rounded-2xl border border-[#7BBF31]/30 shadow-xl">
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-2xl hidden md:block"
                initial={{ boxShadow: "0 0 0 0 rgba(123,191,49,0.35)" }}
                animate={
                  prefersReducedMotion
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
              <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#7BBF31] drop-shadow-lg" />
            </motion.div>
          </div>
        </div>
        {/* Content */}
        <div className="lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center relative z-10">
          <div className="mb-3 sm:mb-4">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#7BBF31]/20 backdrop-blur-sm rounded-full text-[#7BBF31] text-xs sm:text-sm font-medium border border-[#7BBF31]/30">
              {service.id === "installation"
                ? "Installation"
                : service.id === "quality"
                ? "Quality"
                : "Maintenance"}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 leading-tight">
            {service.title}
          </h3>
          <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-4 sm:mb-6 font-light">
            {service.description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
            {service.features.map((feature, i) => (
              <div key={`${service.id}-${i}`} className="flex items-center space-x-3 sm:space-x-4">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-[#7BBF31] to-[#78A323] shadow-lg" />
                <span className="text-gray-200 text-sm sm:text-base font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>
          <motion.button
            aria-label={`Learn more about ${service.title}`}
            onClick={(e) => onLearnMore(service.id, e.currentTarget)}
            onMouseEnter={onPreloadModal}
            onFocus={onPreloadModal}
            {...buttonHoverProps}
            className="group/learn relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-white font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-[#7BBF31] hover:to-[#78A323] border border-red-500/30 hover:border-[#7BBF31]/30 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60 w-fit"
          >
            <span
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/40 blur-sm transition-transform duration-700 ease-out translate-x-0 group-hover/learn:translate-x-[220%] z-20"
              aria-hidden
            />
            <span className="relative z-10 text-sm sm:text-base md:text-lg">Learn More</span>
            <motion.svg
              viewBox="0 0 24 24"
              className="ml-3 h-5 w-5 sm:h-6 sm:w-6 relative z-10"
              animate={prefersReducedMotion || isTouchDevice ? undefined : { x: [0, 2, 0], scale: [1, 1.1, 1] }}
              transition={prefersReducedMotion || isTouchDevice ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              whileHover={prefersReducedMotion || isTouchDevice ? undefined : { x: 4, scale: 1.2, transition: { duration: 0.3, ease: "easeOut" } }}
            >
              <path
                fill="currentColor"
                d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"
              />
            </motion.svg>
          </motion.button>
        </div>
      </div>
    </BackgroundGradient>
  );
});

const PlanCard = memo(function PlanCard({ plan, index, isTouchDevice }) {
  const a = accentClasses[plan.accent];
  
  return (
    <BackgroundGradient
      animate={!isTouchDevice}
      containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full flex"
      className="rounded-3xl h-full"
    >
      <div
        className={`relative bg-[#080331] rounded-3xl shadow-2xl border-2 animate-fade-in-up h-full flex flex-col ${
          plan.popular ? "border-yellow-400 shadow-yellow-400/20" : "border-[#7BBF31]/30"
        }`}
        style={{ animationDelay: `${index * 150}ms` }}
      >
        {plan.popular && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
            <div className="popular-badge bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs font-bold shadow-lg border border-white/90">
              Most Popular
            </div>
          </div>
        )}
        <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-1">
          <div className="text-center mb-5 md:mb-6">
            <div className={`relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r ${a.grad} rounded-3xl mb-3 sm:mb-4 shadow-2xl`}>
              {/* Match 'Our Process' ring animation */}
              <motion.span
                className="absolute inset-0 rounded-3xl border-4 border-[#7BBF31] pointer-events-none"
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8 }}
              />
              <Star className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white drop-shadow-lg relative z-10" />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 sm:mb-3">{plan.name}</h3>
            <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">{plan.description}</p>
            {/* Price removed as requested */}
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-5 md:mb-6 flex-1 overflow-auto">
            {plan.features.map((feature, i) => (
              <div key={`${plan.id}-${i}`} className="flex items-start space-x-2 sm:space-x-3 md:space-x-4 min-h-[36px] sm:min-h-[40px] md:min-h-[48px]">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#7BBF31] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BackgroundGradient>
  );
});

/* ================= Main Page ================= */
function Services() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const isTouchDevice = useIsTouchDevice();
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const isModalOpening = useRef(false);
  const preloadedModalRef = useRef(false);
  
  // Always show top first, then smooth-scroll to hash target
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { asPath } = router;
    const idx = asPath.indexOf("#");
    if (idx === -1) return;

    const id = decodeURIComponent(asPath.slice(idx + 1));

    // Instantly jump to the very top so users see the hero first
    // Use auto (instant) to avoid jank across browsers
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Then, once the section is available in the DOM and layout is stable,
    // perform a smooth scroll to the target. We retry for a short period
    // to handle late-loading images/components.
    let tries = 0;
    const maxTries = 60;
    const settleDelayMs = 60; // small delay so layout can settle
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();

    let cancelled = false;
    let rafId = 0;

    const tryScroll = () => {
      if (cancelled) return false;
      const el = document.getElementById(id);
      if (!el) return false;
      try {
        // Prefer scrollIntoView so Tailwind scroll-mt-* offsets apply on all devices
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.pageYOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
      return true;
    };

    const tick = () => {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - start < settleDelayMs) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (tryScroll()) return;
      if (tries++ < maxTries) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [router.asPath]);
  
  const lastTriggerRef = useRef(null);
  const openTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const handleLearnMore = useCallback((serviceId, triggerEl) => {
    if (isModalOpening.current) return;
    isModalOpening.current = true;
    
    setSelectedService(serviceId);
    lastTriggerRef.current = triggerEl || null;
    setShowModal(true);
    
    // Reset the flag after a short delay
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      isModalOpening.current = false;
    }, 300);
  }, []);
  
  const closeModal = useCallback(() => {
    setShowModal(false);
    // Delay clearing the selected service to allow exit animation
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setSelectedService(null);
      // Restore focus to the triggering element
      if (lastTriggerRef.current && typeof lastTriggerRef.current.focus === 'function') {
        lastTriggerRef.current.focus();
      }
    }, 300);
  }, []);

  useEffect(() => () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, []);

  // Preload modal chunk on idle/hover to remove open lag
  const preloadModal = useCallback(() => {
    if (preloadedModalRef.current) return;
    preloadedModalRef.current = true;
    try {
      if (FeaturesModal && typeof FeaturesModal.preload === "function") {
        FeaturesModal.preload();
      } else {
        // Fallback to dynamic import to warm the chunk
        import("@/components/services/FeaturesModal");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window;
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => preloadModal(), { timeout: 2000 });
      return () => typeof win.cancelIdleCallback === "function" && win.cancelIdleCallback(id);
    }
    const t = setTimeout(preloadModal, 2000);
    return () => clearTimeout(t);
  }, [preloadModal]);
  
  const selectedDetails = selectedService ? SERVICE_DETAILS[selectedService] : null;
  
  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen pt-0 bg-gray-50">
      <Head>
        <title>Services — SVS Unitech Elevators</title>
        <meta
          name="description"
          content="Comprehensive elevator installation, maintenance, and quality assurance services by SVS Unitech Elevators."
        />
      </Head>
      {/* Header rendered in _app.jsx */}
      {/* Hero (single static image) */}
      <section className="relative overflow-hidden py-[12.5rem] sm:py-[13.75rem] md:py-[12.75rem] lg:py-[11.75rem] flex items-center mb-8 sm:mb-12 md:mb-16">
        <div className="absolute inset-0">
          <Image
            src="/Services/Our services.avif"
            alt="SVS Unitech services hero"
            fill
            priority
            sizes="100vw"
            className="object-cover transform-gpu hero-zoom hero-fade-in"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/65 to-black/45" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_40%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.6)_100%)]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-5 sm:mb-6 md:mb-8 border border-white/20"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <motion.span className="mr-3 relative inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 ring-1 ring-white/30">
              <motion.span
                className="absolute inset-0 rounded-full hidden md:block"
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
              <motion.span
                className="relative"
                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <Cog className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.span>
            </motion.span>
            Comprehensive Elevator Solutions
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 sm:mb-6 md:mb-8 leading-tight tracking-tight"
            initial="hidden"
            animate="visible"
          >
            <span className="block overflow-hidden">
              <motion.span className="inline-block text-white" variants={slideMask}>
                Our
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="inline-block text-white" variants={slideMask}>
                Services
              </motion.span>
            </span>
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.05 }}
          >
            Comprehensive elevator solutions designed to meet your specific needs with precision and excellence.
          </motion.p>
        </div>
      </section>
      {/* Services */}
      <section className="pt-0 pb-10 sm:pb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0">
          <div className="space-y-6 sm:space-y-8 relative z-10">
            {SERVICES.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                onLearnMore={handleLearnMore}
                isTouchDevice={isTouchDevice}
                onPreloadModal={preloadModal}
              />
            ))}
          </div>
        </div>
      </section>
      <Separator />
      {/* AMC Plans */}
      <section
        id="amc"
        className="py-12 sm:py-14 md:py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden scroll-mt-28 md:scroll-mt-40"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-56 sm:w-64 h-56 sm:h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply blur-3xl opacity-30" />
          <div className="absolute bottom-20 left-10 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply blur-3xl opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-3 sm:mb-4 tracking-tight">
              AMC{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-yellow-600 to-purple-600 ml-2">
                Plans
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#78A323] max-w-4xl mx-auto leading-relaxed font-light">
              Choose the perfect maintenance plan to keep your elevators running smoothly all year-round
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8 relative z-10 items-stretch">
            {AMC_PLANS.map((plan, index) => {
              const isLastOfOdd = AMC_PLANS.length % 2 === 1 && index === AMC_PLANS.length - 1;
              return (
                <div
                  key={plan.id}
                  className={
                    "h-full " +
                    (isLastOfOdd
                      ? "md:col-span-2 lg:col-span-1 md:mx-auto lg:mx-0 md:max-w-md lg:max-w-none"
                      : "")
                  }
                >
                  <PlanCard plan={plan} index={index} isTouchDevice={isTouchDevice} />
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Separator />
      {/* Process */}
      <section className="pt-12 sm:pt-14 md:pt-16 pb-16 sm:pb-[4.5rem] md:pb-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-16 sm:top-20 left-10 sm:left-20 w-24 sm:w-32 h-24 sm:h-32 border-2 border-blue-300 rounded-full" />
            <div className="absolute top-40 right-16 sm:right-32 w-20 sm:w-24 h-20 sm:h-24 border-2 border-purple-300 rounded-full" />
            <div className="absolute bottom-24 left-1/3 w-16 sm:w-20 h-16 sm:h-20 border-2 border-pink-300 rounded-full" />
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#080331] mb-2 sm:mb-3 tracking-tight">
              Our Process
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#78A323] max-w-3xl mx-auto font-light">
              How we deliver excellence
            </p>
          </div>
          <motion.ol
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 relative z-10"
          >
            {PROCESS_STEPS.map((step, i) => (
              <motion.li key={step.title} custom={i} variants={stepItem} className="text-center">
                <div className="relative mb-5 sm:mb-6">
                  <motion.div
                    custom={i}
                    variants={badgeIn}
                    className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#000000] via-[#78A323] to-[#080331] rounded-3xl text-white font-black text-lg sm:text-xl md:text-2xl shadow-2xl border-4 border-white relative"
                  >
                    {step.number}
                    <motion.span
                      className="absolute inset-0 rounded-3xl border-4 border-[#7BBF31]"
                      initial={{ scale: 0.9, opacity: 0.5 }}
                      animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8 }}
                    />
                  </motion.div>
                  {i < PROCESS_STEPS.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute top-10 h-1 rounded-full"
                      style={{
                        left: "calc(50% + 2.5rem)",
                        width: "calc(100% + 2.5rem)",
                        background: "linear-gradient(90deg, #080331, #78A323, #080331)",
                        transformOrigin: "left center",
                      }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.35 + i * 0.25, duration: 0.7, ease: EASE }}
                    />
                  )}
                </div>
                <motion.h3
                  className="text-lg sm:text-xl md:text-2xl font-bold text-[#080331] mb-2 sm:mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg font-light"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.35 }}
                >
                  {step.description}
                </motion.p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>
      <Separator />
      {/* Contact CTA (aligned with About Us/Projects) */}
      <section className="py-16 sm:py-20 bg-white" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
        >
          <motion.h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" variants={fadeUp}>
            Ready to Get Started ?
          </motion.h2>
          <motion.p className="text-xl text-[#78A323] mb-12 leading-relaxed" variants={fadeUp} transition={{ delay: 0.05 }}>
            Contact our experts for a personalized consultation and service quote
          </motion.p>
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(123,191,49,0.35)" }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="w-fit mx-auto"
          >
            <Link
              href="/contactus"
              className="
                group relative inline-flex items-center justify-center
                overflow-hidden rounded-2xl px-12 py-4
                text-white font-bold text-lg
                shadow-lg
                bg-[#080331]
                transition-all duration-300
                hover:bg-[#7BBF31]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60
              "
            >
              <span
                className="
                  pointer-events-none absolute inset-y-0 -left-1/2 w-1/2
                  -skew-x-12 bg-white/20 blur-sm
                  transition-transform duration-500
                  group-hover:translate-x-[220%]
                "
                aria-hidden
              />
              {/* Icon */}
              <span className="phone-wave relative mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Phone className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
              </span>
              Enquire Now
            </Link>
          </motion.div>
        </motion.div>
      </section>
      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <FeaturesModal open={showModal} details={selectedDetails} onClose={closeModal} isTouchDevice={isTouchDevice} />
        )}
      </AnimatePresence>
      {/* Footer rendered in _app.jsx */}
    </div>
    </LazyMotion>
  );
}

export default Services;

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
