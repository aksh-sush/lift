import Head from "next/head";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";
import {
  LazyMotion,
  domAnimation,
  m,
  MotionConfig,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { MapPin, Star, Grid3X3, List, Award, PenLine } from "lucide-react";
// Header and Footer are rendered globally in _app.jsx

// Motion tunables
const FORCE_PULSE = false; // override OS reduced-motion if needed
const EASE = [0.22, 1, 0.36, 1];

// Shared animation variants (align with About Us)
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const slideMask = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: { duration: 0.6, ease: EASE } },
};

// (Removed slideshow per request; hero uses a single static image)

// Demo data
const projects = [
  {
    id: 1,
    title: "MP Developers",
    location: "Chennai, India",
    elevatorType: "Rauli Elevator",
    rating: 5.0,
    image:
      "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description:
      "Premium high-speed elevator installation for a luxury corporate tower featuring advanced safety systems and energy-efficient operation.",
  },
  {
    id: 2,
    title: "ACS Promoters",
    location: "Chennai, India",
    elevatorType: "Rauli Elevator",
    rating: 5.0,
    image:
      "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description:
      "Premium high-speed elevator installation for a luxury corporate tower featuring advanced safety systems and energy-efficient operation.",
  },
  {
    id: 3,
    title: "DAC Developers",
    location: "Chennai, India",
    elevatorType: "Passenger Elevator",
    rating: 4.8,
    image:
      "https://images.pexels.com/photos/1002638/pexels-photo-1002638.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description:
      "Elegant passenger elevator system for luxury residential building with automatic doors and premium interior finishes.",
  },
  {
    id: 4,
    title: "Maara Infra",
    location: "Chennai, India",
    elevatorType: "Goods Elevator",
    rating: 4.7,
    image:
      "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description:
      "Heavy-duty freight elevator system for industrial warehouse with high load capacity and robust construction.",
  },
  {
    id: 5,
    title: "Vinayaga Homes",
    location: "Chennai, India",
    elevatorType: "Hydraulic Elevator",
    rating: 4.6,
    image:
      "https://images.pexels.com/photos/1797428/pexels-photo-1797428.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    description:
      "Cost-effective hydraulic elevator system for shopping mall with reliable operation and low maintenance requirements.",
  },
];

// (Removed hero slideshow images)

// Helpers
function useIsDesktopHover() {
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 1024px)"
    );
    const update = () => setIsDesktop(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);
  return isDesktop;
}

const swapVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// Motion-wrapped Next Link for animated CTA without full-page reload
const MotionLink = m(Link);

// Components
const PulseAward = React.memo(function PulseAward({
  className = "inline-flex w-5 h-5 sm:w-6 sm:h-6",
}) {
  const prefersReduced = useReducedMotion();
  const shouldAnimate = FORCE_PULSE || !prefersReduced;

  return (
    <m.span
      initial={{ scale: 1 }}
      animate={shouldAnimate ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={
        shouldAnimate
          ? { duration: 1.8, repeat: Infinity, ease: EASE, repeatDelay: 0.4 }
          : { duration: 0 }
      }
      className={`${className} transform-gpu will-change-transform`}
      style={{ transformOrigin: "50% 50%" }}
      aria-hidden
    >
      <Award className="w-full h-full text-white drop-shadow-lg" />
    </m.span>
  );
});

const ProjectTile = React.memo(function ProjectTile({ p, hoverEnabled = true }) {
  return (
    <BackgroundGradient
      animate={hoverEnabled}
      containerClassName="rounded-3xl ring-1 ring-[#78A323]/60"
      className="rounded-3xl"
    >
      <article
        className="group bg-[#080331] text-white rounded-3xl shadow-lg md:hover:shadow-2xl transition overflow-hidden flex flex-col h-[var(--card-h)]"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="relative h-[var(--img-h)] will-change-transform">
          <Image
            src={p.image}
            alt={p.title}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover transform-gpu transition-transform duration-500 md:group-hover:scale-[1.05]"
            loading="lazy"
            decoding="async"
            placeholder="empty"
            priority={false}
          />
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-3 pointer-events-none">
            <div className="rounded-xl px-3 py-2 text-white text-sm font-semibold bg-gradient-to-br from-black/75 via-black/65 to-black/45 backdrop-blur-md ring-1 ring-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              {p.elevatorType}
            </div>
            <div className="rounded-xl px-3 py-2 text-white text-sm font-semibold bg-gradient-to-br from-black/75 via-black/65 to-black/45 backdrop-blur-md ring-1 ring-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.35)] flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-300 fill-current drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
              {p.rating}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-6 grow">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2 md:group-hover:text-[#7BBF31] transition-colors">
            {p.title}
          </h3>
          <div className="flex items-center text-gray-300">
            <MapPin className="w-4 h-4 mr-2 shrink-0" />
            <span className="text-sm">{p.location}</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mt-3 line-clamp-3">
            {p.description}
          </p>
          <div className="mt-auto" />
        </div>
      </article>
    </BackgroundGradient>
  );
});

const ProjectRow = React.memo(function ProjectRow({ p, hoverEnabled = true }) {
  return (
    <BackgroundGradient
      animate={hoverEnabled}
      containerClassName="rounded-3xl ring-1 ring-[#78A323]/60"
      className="rounded-3xl"
    >
      <article
        className="group bg-[#080331] text-white rounded-3xl shadow-lg md:hover:shadow-2xl transition-all duration-500 overflow-hidden"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="flex flex-col lg:flex-row min-h-[18rem]">
          <div className="lg:w-2/5 h-[18rem] relative">
            <Image
              src={p.image}
              alt={p.title}
              fill
              sizes="(max-width:1024px) 100vw, 40vw"
              className="object-cover transform-gpu transition-transform duration-500 md:group-hover:scale-[1.05]"
              loading="lazy"
              decoding="async"
              placeholder="empty"
              priority={false}
            />
            <div className="absolute top-4 left-4">
              <div className="rounded-xl px-4 py-2 text-white font-semibold bg-gradient-to-br from-black/75 via-black/65 to-black/45 backdrop-blur-md ring-1 ring-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                {p.elevatorType}
              </div>
            </div>
          </div>

          <div className="lg:w-3/5 p-6 sm:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white transition-colors md:group-hover:text-[#7BBF31]">
                  {p.title}
                </h3>
                <div className="flex items-center text-gray-300 mt-2">
                  <MapPin className="w-5 h-5 mr-2 shrink-0" />
                  <span className="text-base sm:text-lg">{p.location}</span>
                </div>
              </div>
              <div className="flex items-center rounded-xl px-4 py-2 shrink-0 text-white font-semibold bg-gradient-to-br from-black/75 via-black/65 to-black/45 backdrop-blur-md ring-1 ring-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                <Star className="w-5 h-5 mr-2 text-yellow-300 fill-current drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
                <span className="text-white text-lg">{p.rating}</span>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed text-base sm:text-lg mt-3 line-clamp-3">
              {p.description}
            </p>
            <div className="mt-auto" />
          </div>
        </div>
      </article>
    </BackgroundGradient>
  );
});

/* ============================== PAGE ============================== */
export default function Projects() {
  const [viewMode, setViewMode] = React.useState("grid");
  const isDesktopHover = useIsDesktopHover();

  // Sync sticky controls with header height (ResizeObserver + rAF, no scroll handler)
  React.useEffect(() => {
    const headerEl =
      document.querySelector("header.top-0") ||
      document.querySelector("header[role=banner]");
    if (!headerEl) return;

    let raf = 0;
    const setOffset = () => {
      // Read in rAF to batch with frame
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = Math.ceil(headerEl.offsetHeight || 0);
        document.documentElement.style.setProperty("--header-offset", `${h}px`);
      });
    };

    // Initial measure
    setOffset();

    // Observe only header size changes
    const ro = new ResizeObserver(setOffset);
    ro.observe(headerEl);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Projects — SVS Unitech Elevators</title>
        <meta
          name="description"
          content="Explore our portfolio of elevator installations across industries."
        />
      </Head>

      {/* Header rendered in _app.jsx */}

      <LazyMotion features={domAnimation}>
        <MotionConfig initial={false} transition={{ duration: 0.28, ease: EASE }}>
          {/* HERO (single static image) */}
          <section className="relative overflow-hidden py-[11.25rem] sm:py-[13.75rem] md:py-[13.25rem] lg:py-[11.25rem] flex items-center">
            <div className="absolute inset-0 transform-gpu" aria-hidden>
              <Image
                src="/Projects/ProjectsHero.avif"
                alt=""
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
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-white">
              <m.div
                className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-5 sm:mb-6 md:mb-8 border border-white/20"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <span className="mr-3 relative inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 ring-1 ring-white/30">
                  <PulseAward className="w-4 h-4" />
                </span>
                Our Portfolio of Excellence
              </m.div>

              <m.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 sm:mb-6 md:mb-8 leading-tight tracking-tight"
                initial="hidden"
                animate="visible"
              >
                <span className="block overflow-hidden">
                  <m.span className="inline-block text-white" variants={slideMask}>
                    Project
                  </m.span>
                </span>
                <span className="block overflow-hidden">
                  <m.span className="inline-block text-white" variants={slideMask}>
                    Showcase
                  </m.span>
                </span>
              </m.h1>

              <m.p
                className="text-base sm:text-lg md:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ delay: 0.05 }}
              >
                Explore our portfolio of elevator installations across diverse industries, showcasing our commitment to excellence and innovation in vertical transportation.
              </m.p>
            </div>
          </section>

          {/* ============================== VIEW CONTROLS ============================== */}
          <section
            role="region"
            aria-label="Featured Projects view controls"
            className="hidden md:block py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky z-40"
            style={{ top: "var(--header-offset, 64px)" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Featured Projects
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {projects.length} successful installations
                  </p>
                </div>

                <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner relative">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-pressed={viewMode === "grid"}
                    className={`relative overflow-hidden flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === "grid"
                        ? "text-white"
                        : "text-red-600 md:hover:bg-red-50"
                    }`}
                  >
                    {viewMode === "grid" && (
                      <m.span
                        layoutId="viewToggle"
                        className="absolute inset-0 rounded-lg bg-red-600"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        aria-hidden
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      <Grid3X3 className="w-5 h-5 mr-2" />
                      Grid View
                    </span>
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    aria-pressed={viewMode === "list"}
                    className={`relative overflow-hidden flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === "list"
                        ? "text-white"
                        : "text-red-600 md:hover:bg-red-50"
                    }`}
                  >
                    {viewMode === "list" && (
                      <m.span
                        layoutId="viewToggle"
                        className="absolute inset-0 rounded-lg bg-red-600"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        aria-hidden
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      <List className="w-5 h-5 mr-2" />
                      List View
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECT CARDS */}
          <section
            className="py-14 sm:py-16 md:py-20"
            style={{ contentVisibility: "auto", containIntrinsicSize: "1px 1000px" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                <m.div
                  key={viewMode}
                  variants={swapVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  {viewMode === "grid" ? (
                    <div
                      className="
                        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8
                        [--card-h:26rem] sm:[--card-h:28rem] md:[--card-h:30rem] lg:[--card-h:32rem] xl:[--card-h:34rem]
                        [--img-h:12rem] sm:[--img-h:13rem] md:[--img-h:14rem] lg:[--img-h:16rem] xl:[--img-h:18rem]
                      "
                    >
                      {projects.map((p) => (
                        <ProjectTile key={p.id} p={p} hoverEnabled={isDesktopHover} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6 sm:space-y-7 md:space-y-8">
                      {projects.map((p) => (
                        <ProjectRow key={p.id} p={p} hoverEnabled={isDesktopHover} />
                      ))}
                    </div>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Divider */}
          <m.div
            className="mx-auto max-w-6xl px-6"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease: EASE } }}
            viewport={{ once: true, amount: 0.6 }}
            style={{ transformOrigin: "center" }}
          >
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80"></div>
          </m.div>

          {/* CTA (aligned with About Us) */}
          <section className="py-16 sm:py-20 bg-white" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
            <m.div
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
            >
              <m.h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" variants={fadeUp}>
                Ready to Create Your Success Story ?
              </m.h2>
              <m.p className="text-xl text-[#78A323] mb-12 leading-relaxed" variants={fadeUp} transition={{ delay: 0.05 }}>
                Join our portfolio of satisfied clients and experience the difference of working with elevator installation experts who deliver excellence every time
              </m.p>
              <MotionLink
                href="/contactus"
                variants={fadeUp}
                whileHover={isDesktopHover ? { y: -2, boxShadow: "0 12px 30px rgba(123,191,49,0.35)" } : undefined}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
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
                {/* Notepad + writing pen animation */}
                <span className="icon-pad relative mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                  <span className="pad-doc" aria-hidden />
                  <span className="pad-lines" aria-hidden>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  <span className="pad-pen" aria-hidden>
                    <PenLine strokeWidth={2.2} />
                  </span>
                </span>
                Plan with Us
              </MotionLink>
            </m.div>
          </section>
        </MotionConfig>
      </LazyMotion>

      {/* Footer rendered in _app.jsx */}
    </div>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
