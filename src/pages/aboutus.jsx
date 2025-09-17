// src/pages/aboutus.jsx
import Head from "next/head";
import React, { memo, useMemo } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { LazyMotion, m, useReducedMotion } from "framer-motion";
import { Users, Phone } from "lucide-react";
import InnovationBulbIcon from "../components/icons/InnovationBulbIcon";
import QualityAssuranceIcon from "../components/icons/QualityAssuranceIcon";
import CustomerFocusIcon from "../components/icons/CustomerFocusIcon";
import SafetyShieldIcon from "../components/icons/SafetyShieldIcon";
import EyeBlinkIcon from "../components/icons/EyeBlinkIcon";
import TargetArrowIcon from "../components/icons/TargetArrowIcon";
import { Spotlight } from "../components/ui/Spotlight";
import dynamic from "next/dynamic";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

// Dynamically import animation-heavy client components
const ShootingStars = dynamic(
  () => import("@/components/ui/shooting-stars").then((m) => m.ShootingStars),
  { ssr: false, loading: () => null }
);
const StarsBackground = dynamic(
  () => import("@/components/ui/stars-background").then((m) => m.StarsBackground),
  { ssr: false, loading: () => null }
);
// BackgroundGradient is SSR-safe; import statically to reduce CLS and improve LCP
// Header and Footer are rendered globally in _app.jsx

/* ---------- slideshow images (hero background) ---------- */
const SLIDES = [
  "/Aboutus/1.avif",
  "/Aboutus/2.avif",
  "/Aboutus/3.avif",
  "/Aboutus/4.avif",
  "/Aboutus/5.avif",
];

/* ---------- animation variants ---------- */
const ease = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
const slideMask = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: { duration: 0.6, ease } },
};

// Lazy-load Framer Motion features
const loadFramerFeatures = () =>
  import("framer-motion").then((res) => res.domAnimation);

/* ---------- lightweight client helpers ---------- */
const WhenIdle = memo(({ children, timeout = 100 }) => {
  const [ready, setReady] = React.useState(false);
  
  React.useEffect(() => {
    let id;
    const cb = () => setReady(true);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      id = window.requestIdleCallback(cb, { timeout });
    } else {
      id = setTimeout(cb, timeout);
    }
    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, [timeout]);
  
  return ready ? children : null;
});
WhenIdle.displayName = 'WhenIdle';

const useMediaQuery = (query) => {
  const [matches, setMatches] = React.useState(false);
  
  React.useEffect(() => {
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
};

/* ---------- animated icon helpers (respect reduced motion) ---------- */
const IconFloat = memo(({ children, duration = 3, distance = 6 }) => {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <div>{children}</div>;
  
  return (
    <m.div
      aria-hidden
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </m.div>
  );
});
IconFloat.displayName = 'IconFloat';

const IconPulse = memo(({ children, duration = 1.8, scale = 1.08 }) => {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <div>{children}</div>;
  
  return (
    <m.div
      aria-hidden
      animate={{ scale: [1, scale, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </m.div>
  );
});
IconPulse.displayName = 'IconPulse';

// (removed unused IconGlow helper)

const IconOrbitRing = memo(({ size = 56, speed = 12 }) => {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;
  
  return (
    <m.span
      className="pointer-events-none absolute -inset-2 rounded-full border border-white/20"
      style={{ width: size, height: size }}
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    />
  );
});
IconOrbitRing.displayName = 'IconOrbitRing';

/* ---------- Seamless cross-fade hero slideshow ---------- */
const HeroSlideshow = memo(({ images, duration = 6000, fade = 1200 }) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeLayer, setActiveLayer] = React.useState(0);
  const [sources, setSources] = React.useState([
    images[0],
    images.length > 1 ? images[1] : images[0],
  ]);
  const cursorRef = React.useRef(1);
  const timerRef = React.useRef(null);
  const activeLayerRef = React.useRef(0);
  const isMountedRef = React.useRef(false);
  const pendingLayerRef = React.useRef(null);
  const pendingIndexRef = React.useRef(null);
  const onLayerLoadedRef = React.useRef(null);
  const onLayerErrorRef = React.useRef(null);
  const [ken, setKen] = React.useState({ scaleFrom: 1.06, scaleTo: 1.1, x: 0, y: 0 });
  
  const randomKen = React.useCallback(() => {
    const dir = Math.random();
    const x = dir < 0.33 ? -10 : dir < 0.66 ? 0 : 10;
    const y = dir < 0.5 ? -6 : 6;
    return { scaleFrom: 1.06, scaleTo: 1.1, x, y };
  }, []);
  
  // Track mount for safe async updates
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (prefersReducedMotion || images.length <= 1) return;

    const clear = () => timerRef.current && clearTimeout(timerRef.current);

    const handleLayerLoaded = (layer) => {
      if (!isMountedRef.current) return;
      if (pendingLayerRef.current !== layer) return; // ignore non-pending loads
      setKen(randomKen());
      activeLayerRef.current = layer;
      // Swap layers on the next frame to keep animations smooth
      requestAnimationFrame(() => setActiveLayer(layer));
      // Mark new current
      cursorRef.current = pendingIndexRef.current ?? cursorRef.current;
      pendingLayerRef.current = null;
      pendingIndexRef.current = null;
      schedule();
    };

    const handleLayerError = (layer) => {
      if (!isMountedRef.current) return;
      if (pendingLayerRef.current !== layer) return;
      // Skip this image and try the following one on the usual cadence
      const nextAfterFailed = ((pendingIndexRef.current ?? cursorRef.current) + 1) % images.length;
      cursorRef.current = nextAfterFailed;
      pendingLayerRef.current = null;
      pendingIndexRef.current = null;
      schedule();
    };

    // Expose handlers to NextImage callbacks via refs
    onLayerLoadedRef.current = handleLayerLoaded;
    onLayerErrorRef.current = handleLayerError;

    const schedule = () => {
      clear();
      // Avoid scheduling a new cycle while an image is pending
      if (pendingLayerRef.current !== null) return;
      timerRef.current = setTimeout(() => {
        const nextImgIndex = (cursorRef.current + 1) % images.length;
        const nextLayer = 1 - activeLayerRef.current;
        const nextSrc = images[nextImgIndex];
        // Set the upcoming layer's source; NextImage will start loading optimized image
        setSources((prev) => {
          const arr = [...prev];
          arr[nextLayer] = nextSrc;
          return arr;
        });
        pendingLayerRef.current = nextLayer;
        pendingIndexRef.current = nextImgIndex;
        // No immediate transition; wait for onLoad/onError
      }, duration);
    };

    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.hidden) {
        clear();
      } else {
        if (pendingLayerRef.current === null) schedule();
      }
    };

    schedule();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      clear();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [duration, images, prefersReducedMotion, randomKen]);
  
  const layerBase = "absolute inset-0 will-change-transform transition-opacity";
  const opA = activeLayer === 0 ? 1 : 0;
  const opB = activeLayer === 1 ? 1 : 0;
  
  return (
    <div className="absolute inset-0">
      <m.div
        key={sources[0] + "-A"}
        className={layerBase}
        style={{ opacity: opA, transitionDuration: `${fade}ms` }}
        initial={false}
        animate={
          prefersReducedMotion ? {} : { scale: [ken.scaleFrom, ken.scaleTo], x: [0, ken.x], y: [0, ken.y] }
        }
        transition={prefersReducedMotion ? {} : { duration: (duration + fade) / 1000, ease: "linear" }}
      >
        <NextImage
          src={sources[0]}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          onLoad={() => onLayerLoadedRef.current && onLayerLoadedRef.current(0)}
          onError={() => onLayerErrorRef.current && onLayerErrorRef.current(0)}
        />
      </m.div>
      <m.div
        key={sources[1] + "-B"}
        className={layerBase}
        style={{ opacity: opB, transitionDuration: `${fade}ms` }}
        initial={false}
        animate={
          prefersReducedMotion ? {} : { scale: [ken.scaleFrom, ken.scaleTo], x: [0, -ken.x], y: [0, -ken.y] }
        }
        transition={prefersReducedMotion ? {} : { duration: (duration + fade) / 1000, ease: "linear" }}
      >
        <NextImage
          src={sources[1]}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          onLoad={() => onLayerLoadedRef.current && onLayerLoadedRef.current(1)}
          onError={() => onLayerErrorRef.current && onLayerErrorRef.current(1)}
        />
      </m.div>
      {/* scrims for readability */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_40%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.45)_100%)]" />
      </div>
    </div>
  );
});
HeroSlideshow.displayName = 'HeroSlideshow';

/* ---------- Core Value Card Component ---------- */
const CoreValueCard = memo(({ 
  icon: Icon, 
  title, 
  description, 
  animationType = "float", 
  animationProps = {},
  isDesktop 
}) => {
  const prefersReducedMotion = useReducedMotion();
  const AnimationComponent = animationType === "pulse" ? IconPulse : IconFloat;

  const IconWrapper = ({ children }) => {
    if (animationType === "none") return <>{children}</>;
    const Comp = AnimationComponent;
    return <Comp {...animationProps}>{children}</Comp>;
  };

  return (
    <BackgroundGradient
      animate={!prefersReducedMotion}
      containerClassName="rounded-2xl ring-1 ring-[#78A323]/60 h-full"
      className="rounded-2xl h-full"
    >
      <div className="relative isolate overflow-hidden rounded-2xl p-8 text-white bg-[#080331] shadow-2xl min-h-[18rem] h-full flex flex-col">
        <div
          className="absolute inset-0 opacity-[0.6] pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px)
            `,
          }}
        />
        
        {/* Conditionally render Spotlight only on desktop (not on medium screens) */}
        {isDesktop && (
          <Spotlight
            fill="rgba(255,255,255,0.95)"
            className="motion-safe:animate-spotlight opacity-60 mix-blend-screen left-[25%] top-[-45%] w-full h-[700%] [animation-duration:1.2s]"
          />
        )}
        
        <div className="relative z-10 text-center">
          <IconWrapper>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 ring-1 ring-[#7BBF31]/35 overflow-visible mb-6">
              <Icon className="w-8 h-8 text-[#7BBF31]" aria-hidden="true" focusable="false" />
            </div>
          </IconWrapper>
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p className="text-white/80 leading-relaxed">{description}</p>
        </div>
      </div>
    </BackgroundGradient>
  );
});
CoreValueCard.displayName = 'CoreValueCard';

/* ---------- Mission/Vision Card Component ---------- */
const MissionVisionCard = memo(({ 
  icon: Icon, 
  title, 
  children, 
  starDensity, 
  starSpeed, 
  isSmall, 
  prefersReducedMotion,
  isDesktopOrTablet
}) => {
  return (
    <BackgroundGradient
      animate={!prefersReducedMotion}
      containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full"
      className="rounded-3xl h-full"
    >
      <div className="relative rounded-3xl overflow-hidden p-10 text-white bg-[#080331] shadow-xl h-full flex flex-col">
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60 bg-[length:200%_200%]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(123,191,49,0.18) 0%, rgba(123,191,49,0.08) 35%, rgba(123,191,49,0.00) 60%)",
          }}
        />
        
        {/* Conditionally render star effects only on desktop/tablet */}
        {!prefersReducedMotion && isDesktopOrTablet && (
          <WhenIdle timeout={200}>
            <ShootingStars
              starColor="#ffffff"
              trailColor="#ffffff"
              minSpeed={starSpeed.min}
              maxSpeed={starSpeed.max}
              minDelay={1600}
              maxDelay={4800}
              starWidth={isSmall ? 10 : 14}
              starHeight={1}
            />
            <StarsBackground
              starDensity={starDensity}
              allStarsTwinkle
              twinkleProbability={0.6}
              minTwinkleSpeed={0.6}
              maxTwinkleSpeed={1.1}
            />
          </WhenIdle>
        )}
        
        <div className="relative z-10">
          <div className="flex items-center mb-8 relative">
            <div className="relative inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mr-4">
              <IconOrbitRing size={56} speed={title === "Our Mission" ? 14 : 16} />
              <Icon className="w-6 h-6" aria-hidden="true" focusable="false" />
            </div>
            <h3 className="text-3xl font-bold">{title}</h3>
          </div>
          <div className="space-y-6 text-white/90 leading-relaxed text-[16px]">
            {children}
          </div>
        </div>
      </div>
    </BackgroundGradient>
  );
});
MissionVisionCard.displayName = 'MissionVisionCard';

export default function AboutUs() {
  const prefersReducedMotion = useReducedMotion();
  const isSmall = useMediaQuery('(max-width: 640px)');
  const isMedium = useMediaQuery('(max-width: 1024px)');
  const isDesktopOrTablet = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Memoize calculations
  const starSettings = useMemo(() => ({
    density: isSmall ? 0.00004 : isMedium ? 0.00007 : 0.00009,
    speed: {
      min: isSmall ? 12 : 16,
      max: isSmall ? 22 : 28,
    }
  }), [isSmall, isMedium]);
  
  // Memoize core values data
  const coreValues = useMemo(() => [
    {
      icon: SafetyShieldIcon,
      title: "Safety First",
      description: "We engineer safety into every step, from design and materials to manufacturing and maintenance.",
      // Use icon-specific ping rings; disable wrapper motion
      animationType: "none"
    },
    {
      icon: InnovationBulbIcon,
      title: "Innovation",
      description: "We adopt cutting-edge tech to create smoother rides, smarter controls, and greener systems.",
      animationType: "none"
    },
    {
      icon: CustomerFocusIcon,
      title: "Customer Focus",
      description: "From consultation to after-sales support, we build around your needs and timelines.",
      // Use icon-specific animation; disable wrapper motion
      animationType: "none"
    },
    {
      icon: QualityAssuranceIcon,
      title: "Quality Assurance",
      description: "Rigorous QA and premium materials ensure long-lasting, efficient performance.",
      // Use icon-specific animation; disable wrapper motion
      animationType: "none"
    }
  ], []);
  
  return (
    <>
      <Head>
        <title>About Us — SVS Unitech Elevators</title>
        <meta
          name="description"
          content="Learn how SVS Unitech Elevators elevates the future of vertical transportation with safety, innovation, and quality."
        />
      </Head>
      
      {/* Header rendered in _app.jsx */}
      
      <LazyMotion features={loadFramerFeatures} strict>
        <div className="min-h-screen pt-0 bg-white">
          {/* Hero with optimized mobile scrolling */}
          <section className="relative overflow-hidden py-9 flex items-center mb-6 md:mb-8 lg:mb-8 min-h-[520px] md:min-h-[720px] lg:min-h-[695px]">
            <HeroSlideshow images={SLIDES} duration={6000} fade={1200} />
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              {/* Hero pill with enhanced Users icon animation */}
              <m.div
                className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-5 sm:mb-6 md:mb-8 border border-white/20"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <div className="flex items-center">
                  <m.div className="relative">
                    <span className="relative inline-flex items-center justify-center w-6 h-6 mr-3">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-lg relative z-20" aria-hidden="true" focusable="false" />
                      <m.span
                        className="absolute inset-0 rounded-full bg-white/15 blur-[2px] z-0"
                        animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.5, 0.25] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      />
                      {!prefersReducedMotion && (
                        <>
                          <m.span
                            className="pointer-events-none absolute inset-0"
                            aria-hidden
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          >
                            <span
                              className="absolute left-1/2 -top-0.5 w-1.5 h-1.5 rounded-full bg-[#080331]"
                              style={{ transform: "translateX(-50%)" }}
                            />
                          </m.span>
                          <m.span
                            className="pointer-events-none absolute inset-0"
                            aria-hidden
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                          >
                            <span
                              className="absolute left-1/2 -top-0.5 w-1 h-1 rounded-full bg-[#78A323]"
                              style={{ transform: "translateX(-50%)" }}
                            />
                          </m.span>
                          <m.span
                            className="absolute inset-0 rounded-full ring-1 ring-white/25"
                            aria-hidden
                            animate={{ opacity: [0.4, 0.6, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </>
                      )}
                    </span>
                  </m.div>
                  Who We Are
                </div>
              </m.div>
              
              <m.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 sm:mb-6 md:mb-8 leading-tight tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]"
                initial="hidden"
                animate="visible"
              >
                <span className="block overflow-hidden">
                  <m.span
                    className="inline-block text-white"
                    style={{
                      textShadow:
                        "0 2px 10px rgba(0,0,0,0.7), 0 10px 28px rgba(0,0,0,0.55)",
                    }}
                    variants={slideMask}
                  >
                    Elevating the Future of
                  </m.span>
                </span>
                <span className="block overflow-hidden">
                  <m.span
                    className="inline-block text-white"
                    style={{
                      textShadow:
                        "0 2px 10px rgba(0,0,0,0.7), 0 10px 28px rgba(0,0,0,0.55)",
                    }}
                    variants={slideMask}
                  >
                    Vertical Transportation
                  </m.span>
                </span>
              </m.h1>
              
              <m.div
                className="max-w-4xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <m.p
                  className="text-base sm:text-lg md:text-xl leading-relaxed drop-shadow-[0_3px_12px_rgba(0,0,0,0.75)]"
                  variants={fadeUp}
                  transition={{ delay: 0.05 }}
                >
                  At SVS Unitech Elevators, we don't just move people, we elevate experiences. Blending engineering precision with design innovation, we deliver elevators that are safe, smooth, and smart. From high-rise apartments to corporate towers, every solution is tailored to your vision and standards.
                </m.p>
                <m.p
                  className="text-base sm:text-lg md:text-xl leading-relaxed drop-shadow-[0_3px_12px_rgba(0,0,0,0.75)] mt-4"
                  variants={fadeUp}
                  transition={{ delay: 0.1 }}
                >
                  Our state-of-the-art facility designs and manufactures custom cabins, landing doors, control systems, and complete elevator packages suited for modern infrastructure. With advanced features such as auto-rescue systems and overload indicators, our products strike the perfect balance of safety, reliability, and design excellence.
                </m.p>
              </m.div>
            </div>
          </section>
          
          {/* Core Values — Spotlight only on desktop/tablet */}
          <section className="pt-4 sm:pt-2 pb-12 sm:pb-14 bg-white" style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <m.h2
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={fadeUp}
                >
                  Why Choose Us
                </m.h2>
                <m.p
                  className="text-xl text-[#78A323] max-w-3xl mx-auto"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={fadeUp}
                  transition={{ delay: 0.05 }}
                >
                  Safety and reliability at every step
                </m.p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                {coreValues.map((value, index) => (
                  <CoreValueCard
                    key={value.title}
                    icon={value.icon}
                    title={value.title}
                    description={value.description}
                    animationType={value.animationType}
                    animationProps={value.animationProps || {}}
                    isDesktop={isDesktop}
                  />
                ))}
              </div>
            </div>
          </section>
          
          {/* Divider (after Core Values) */}
          <m.div
            className="mx-auto max-w-6xl px-6"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease } }}
            viewport={{ once: true, amount: 0.6 }}
            style={{ transformOrigin: "center" }}
          >
            <div className="mt-3 mb-2 h-[2px] w-full bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80" />
          </m.div>
          
          {/* Mission & Vision - Stars only on desktop/tablet */}
          <section className="py-16 sm:py-20 bg-white" style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                {/* Our Mission */}
                <MissionVisionCard
                  icon={TargetArrowIcon}
                  title="Our Mission"
                  starDensity={starSettings.density}
                  starSpeed={starSettings.speed}
                  isSmall={isSmall}
                  prefersReducedMotion={prefersReducedMotion}
                  isDesktopOrTablet={isDesktopOrTablet}
                >
                  <p>
                    At SVS Unitech Elevators, our mission is to redefine vertical mobility with elevators that are safe, smart, and beautifully designed. We focus on enhancing everyday journeys through reliability, comfort, and innovation.
                  </p>
                  <p>
                    By integrating advanced safety features and efficient systems, we deliver solutions tailored to modern infrastructure, ensuring every ride reflects quality and trust.
                  </p>
                </MissionVisionCard>
                
                {/* Our Vision */}
                <MissionVisionCard
                  icon={EyeBlinkIcon}
                  title="Our Vision"
                  starDensity={starSettings.density}
                  starSpeed={starSettings.speed}
                  isSmall={isSmall}
                  prefersReducedMotion={prefersReducedMotion}
                  isDesktopOrTablet={isDesktopOrTablet}
                >
                  <p>
                    To be the global leader in smart elevator solutions, setting benchmarks in innovation, safety, and customer experience while building smarter cities.
                  </p>
                  <p>
                    With a passion for excellence, we aim to create elevators that not only move people but also elevate spaces with intelligent design and lasting reliability.
                  </p>
                </MissionVisionCard>
              </div>
            </div>
          </section>
          
          {/* Divider (after Mission & Vision) */}
          <m.div
            className="mx-auto max-w-6xl px-6"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease } }}
            viewport={{ once: true, amount: 0.6 }}
            style={{ transformOrigin: "center" }}
          >
            <div className="mt-3 mb-2 h-[2px] w-full bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80" />
          </m.div>
          
          {/* CTA */}
          <section className="py-16 sm:py-20 bg-white" style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
            <m.div
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
            >
              <m.h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" variants={fadeUp}>
                Ready to Elevate Your Building?
              </m.h2>
              <m.p className="text-xl text-[#78A323] mb-12 leading-relaxed" variants={fadeUp} transition={{ delay: 0.05 }}>
                Let our experts help you choose the perfect elevator solution for your specific needs.
              </m.p>
              <m.div
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
                  {/* Icon with green waves */}
                  <span className="phone-wave relative mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                    <Phone className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
                  </span>
                  Consult Our Team
                </Link>
              </m.div>
            </m.div>
          </section>
          
          {/* Footer rendered in _app.jsx */}
        </div>
      </LazyMotion>
    </>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
