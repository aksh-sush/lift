// src/pages/contactus.jsx
import Head from "next/head";
import dynamic from "next/dynamic";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { LazyMotion, domAnimation, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Form (client-only)
const LetsConnectForm = dynamic(() => import("../components/contact/LetsConnectForm"), { ssr: false });

// Visual effects (client-only)
const Spotlight = dynamic(() => import("@/components/ui/Spotlight").then((m) => m.Spotlight), { ssr: false });
const StarsBackground = dynamic(() => import("@/components/ui/stars-background").then((m) => m.StarsBackground), { ssr: false });
const ShootingStars = dynamic(() => import("@/components/ui/shooting-stars").then((m) => m.ShootingStars), { ssr: false });

// Media query hook with 'change' listener (correctness)
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const onChange = (e) => setMatches(e.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
};

// Desktop-only spotlight
const ResponsiveSpotlight = ({ className, ...props }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  if (!isDesktop) return null;
  const cls = (className || "opacity-60 mix-blend-screen") + " left-[35%] top-[-30%] w-[500%] h-[700%]";
  return <Spotlight {...props} className={cls} />;
};

const ResponsiveStars = ({ children }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return isDesktop ? children : null;
};

const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };
const slideMask = { hidden: { y: "100%" }, visible: { y: "0%", transition: { duration: 0.6, ease } } };

// IntersectionObserver hook (gates heavy content until near viewport)
function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return;
    const obs = new IntersectionObserver((entries, obsr) => {
      const e = entries[0];
      if (e && e.isIntersecting) {
        setInView(true);
        obsr.disconnect();
      }
    }, options || { rootMargin: "200px 0px", threshold: 0 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [options, inView]);
  return [ref, inView];
}

export default function ContactUs() {
  const mapsQuery = encodeURIComponent("No.15, Sarayu Park, New Colony, 2nd Main Road, Chennai – 600044");
  const openMaps = () =>
    window.open(`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`, "_blank", "noopener=yes,noreferrer=yes");
  const callPhone = () => (window.location.href = "tel:+91 90920 80100");
  const sendMail = () => (window.location.href = "mailto:svsunitech@gmail.com");

  const onKeyGo = (fn) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  // Gates: form and decorative effect sections
  const [formRef, formInView] = useInView({ rootMargin: "300px 0px" });
  const [hoursRef, hoursInView] = useInView({ rootMargin: "200px 0px" });
  const [promiseRef, promiseInView] = useInView({ rootMargin: "200px 0px" });

  return (
    <LazyMotion features={domAnimation}>
      <>
        <Head>
          <title>Contact Us — SVS Unitech Elevators</title>
          <meta name="description" content="Get in touch with SVS Unitech Elevators" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="min-h-screen pt-0 bg-gradient-to-b from-white via-[#e9f0f7] to-[#cfd8e4]">
          {/* Hero */}
          <motion.section className="py-10 sm:py-14" initial="hidden" animate="visible" variants={fadeUp}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <motion.h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0B0833] mb-4">
                <span className="inline-block overflow-hidden align-bottom">
                  <motion.span variants={slideMask} className="inline-block">Contact Us</motion.span>
                </span>
              </motion.h1>
              <motion.p className="text-base sm:text-lg text-[#0B0833]/80">
                Ready to elevate your building? Our experts are here to help.
              </motion.p>
            </div>
          </motion.section>

          {/* Contact Cards */}
          <section className="py-2">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0B0833] text-center mb-8 sm:mb-10">
                <span className="inline-block overflow-hidden align-bottom">
                  <span className="inline-block">Get in Touch</span>
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 sm:mb-12 items-stretch">
                {/* Address */}
                <BackgroundGradient animate containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full" className="rounded-3xl h-full">
                  <div
                    role="link"
                    tabIndex={0}
                    aria-label="Open address in Google Maps"
                    onClick={openMaps}
                    onKeyDown={onKeyGo(openMaps)}
                    className="group relative isolate overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-[#080331] shadow-2xl cursor-pointer h-full flex flex-col justify-center md:justify-start lg:justify-center transition-colors duration-300 md:hover:ring-1 md:hover:ring-[#7BBF31]"
                  >
                    <div
                      className="absolute inset-0 opacity-[0.5] pointer-events-none transition-opacity duration-300 md:group-hover:opacity-70"
                      style={{
                        backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px)`,
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-20 bg-[length:200%_200%]" style={{ backgroundImage: "linear-gradient(135deg, rgba(123,191,49,0.18) 0%, rgba(123,191,49,0.08) 35%, rgba(123,191,49,0.00) 60%)" }} />
                    <ResponsiveSpotlight fill="rgba(255,255,255,0.95)" className="opacity-60 mix-blend-screen" />
                    <div className="relative z-10 text-center md:group-hover:text-[#7BBF31] transition-colors duration-300">
                      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4 sm:mb-6 bg-white/10">
                        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 will-change-transform md:group-hover:scale-110 md:group-hover:-translate-y-1" />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent md:group-hover:bg-none md:group-hover:text-[#7BBF31] transition-colors duration-300">Address</h3>
                      <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/80 leading-relaxed md:group-hover:text-[#7BBF31] transition-colors duration-300">
                        No.15, Sarayu Park, New Colony,<br />2nd Main Road, Chennai – 600044
                      </p>
                    </div>
                  </div>
                </BackgroundGradient>

                {/* Phone */}
                <BackgroundGradient animate containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full" className="rounded-3xl h-full">
                  <div
                    role="link"
                    tabIndex={0}
                    aria-label="Call +91 90920 80100"
                    onClick={callPhone}
                    onKeyDown={onKeyGo(callPhone)}
                    className="group relative isolate overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-[#080331] shadow-2xl cursor-pointer h-full flex flex-col justify-center md:justify-start lg:justify-center transition-colors duration-300 md:hover:ring-1 md:hover:ring-[#7BBF31]"
                  >
                    <div className="absolute inset-0 opacity-[0.5] pointer-events-none transition-opacity duration-300 md:group-hover:opacity-70" style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px)` }} />
                    <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-20 bg-[length:200%_200%]" style={{ backgroundImage: "linear-gradient(135deg, rgba(123,191,49,0.18) 0%, rgba(123,191,49,0.08) 35%, rgba(123,191,49,0.00) 60%)" }} />
                    <ResponsiveSpotlight fill="rgba(255,255,255,0.95)" className="opacity-60 mix-blend-screen" />
                    <div className="relative z-10 text-center md:group-hover:text-[#7BBF31] transition-colors duration-300">
                      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4 sm:mb-6 bg-white/10">
                        <Phone className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 will-change-transform md:group-hover:scale-110 md:group-hover:-translate-y-1" />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent md:group-hover:bg-none md:group-hover:text-[#7BBF31] transition-colors duration-300">Phone</h3>
                      <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/80 md:group-hover:text-[#7BBF31] transition-colors duration-300">
                        <a href="tel:+91 90920 80100" onClick={(e) => e.stopPropagation()} className="hover:underline md:group-hover:text-[#7BBF31]">+91 90920 80100</a>
                      </p>
                    </div>
                  </div>
                </BackgroundGradient>

                {/* Email */}
                <BackgroundGradient animate containerClassName="rounded-3xl ring-1 ring-[#78A323]/60 h-full" className="rounded-3xl h-full">
                  <div
                    role="link"
                    tabIndex={0}
                    aria-label="Email svsunitech@gmail.com"
                    onClick={sendMail}
                    onKeyDown={onKeyGo(sendMail)}
                    className="group relative isolate overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-[#080331] shadow-2xl cursor-pointer h-full flex flex-col justify-center md:justify-start lg:justify-center transition-colors duration-300 md:hover:ring-1 md:hover:ring-[#7BBF31]"
                  >
                    <div className="absolute inset-0 opacity-[0.5] pointer-events-none transition-opacity duration-300 md:group-hover:opacity-70" style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px)` }} />
                    <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-20 bg-[length:200%_200%]" style={{ backgroundImage: "linear-gradient(135deg, rgba(123,191,49,0.18) 0%, rgba(123,191,49,0.08) 35%, rgba(123,191,49,0.00) 60%)" }} />
                    <ResponsiveSpotlight fill="rgba(255,255,255,0.95)" className="opacity-60 mix-blend-screen" />
                    <div className="relative z-10 text-center md:group-hover:text-[#7BBF31] transition-colors duration-300">
                      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4 sm:mb-6 bg-white/10">
                        <Mail className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 will-change-transform md:group-hover:scale-110 md:group-hover:-translate-y-1" />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent md:group-hover:bg-none md:group-hover:text-[#7BBF31] transition-colors duration-300">Email</h3>
                      <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/80 md:group-hover:text-[#7BBF31] transition-colors duration-300">
                        <a href="mailto:svsunitech@gmail.com" onClick={(e) => e.stopPropagation()} className="hover:underline md:group-hover:text-[#7BBF31]">svsunitech@gmail.com</a>
                      </p>
                    </div>
                  </div>
                </BackgroundGradient>
              </div>
            </div>
          </section>

          {/* Divider */}
          <motion.div className="mx-auto max-w-6xl px-4 sm:px-6" initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease } }} style={{ transformOrigin: "center" }}>
            <div className="my-6 sm:my-8 h-[2px] w-full bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80" />
          </motion.div>

          {/* Form */}
          <motion.section className="py-4 sm:py-5" initial="hidden" animate="visible" variants={fadeUp}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <motion.h2 className="text-2xl sm:text-3xl font-bold text-[#0B0833] text-center mb-6 sm:mb-8" initial="hidden" animate="visible">
                <span className="inline-block overflow-hidden align-bottom">
                  <motion.span variants={slideMask} className="inline-block">Tell Us How We Can Help</motion.span>
                </span>
              </motion.h2>
              <motion.div ref={formRef}>
                {formInView ? <LetsConnectForm containerClassName="max-w-full w-full" /> : null}
              </motion.div>
            </div>
          </motion.section>

          {/* Divider */}
          <motion.div className="mx-auto max-w-6xl px-4 sm:px-6" initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1, transition: { duration: 0.5, ease } }} style={{ transformOrigin: "center" }}>
            <div className="my-6 sm:my-8 h-[2px] w-full bg-gradient-to-r from-transparent via-[#080331] to-transparent opacity-80" />
          </motion.div>

          {/* Working Hours & Promise */}
          <section className="py-4 sm:py-5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Working Hours */}
              <BackgroundGradient animate containerClassName="rounded-2xl ring-1 ring-[#78A323]/60" className="rounded-2xl">
                <div ref={hoursRef} className="group relative rounded-2xl overflow-hidden min-h-[14rem] sm:min-h-[16rem] md:min-h-[18rem] p-6 sm:p-8 bg-[#080331] shadow-2xl">
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-20 bg-[length:200%_200%]" style={{ backgroundImage: "linear-gradient(135deg, rgba(123,191,49,0.18) 0%, rgba(123,191,49,0.08) 35%, rgba(123,191,49,0.00) 60%)" }} />
                  {hoursInView ? (
                    <ResponsiveStars>
                      <ShootingStars starColor="#ffffff" trailColor="#ffffff" minSpeed={16} maxSpeed={28} minDelay={1400} maxDelay={4200} starWidth={14} starHeight={1} />
                      <StarsBackground starDensity={0.00009} allStarsTwinkle twinkleProbability={0.6} minTwinkleSpeed={0.6} maxTwinkleSpeed={1.1} />
                    </ResponsiveStars>
                  ) : null}
                  <div className="relative z-10 text-white">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                      <h3 className="text-lg sm:text-xl font-bold">Working Hours</h3>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex justify-between"><span className="text-sm sm:text-base text-white/90">Monday - Friday</span><span className="font-semibold text-sm sm:text-base">9:30 AM - 6:00 PM</span></div>
                      <div className="flex justify-between"><span className="text-sm sm:text-base text-white/90">Saturday</span><span className="font-semibold text-sm sm:text-base">9:00 AM - 4:00 PM</span></div>
                      <div className="flex justify-between"><span className="text-sm sm:text-base text-white/90">Sunday</span><span className="font-semibold text-sm sm:text-base">Emergency only</span></div>
                    </div>
                  </div>
                </div>
              </BackgroundGradient>

              {/* Our Promise */}
              <BackgroundGradient animate containerClassName="rounded-2xl ring-1 ring-[#78A323]/60" className="rounded-2xl">
                <div ref={promiseRef} className="group relative rounded-2xl overflow-hidden min-h-[14rem] sm:min-h-[16rem] md:min-h-[18rem] p-6 sm:p-8 bg-[#080331] shadow-2xl">
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-20 bg-[length:200%_200%]" style={{ backgroundImage: "linear-gradient(135deg, rgba(123,191,49,0.18) 0%, rgba(123,191,49,0.08) 35%, rgba(123,191,49,0.00) 60%)" }} />
                  {promiseInView ? (
                    <ResponsiveStars>
                      <ShootingStars starColor="#ffffff" trailColor="#ffffff" minSpeed={16} maxSpeed={28} minDelay={1400} maxDelay={4200} starWidth={14} starHeight={1} />
                      <StarsBackground starDensity={0.00009} allStarsTwinkle twinkleProbability={0.6} minTwinkleSpeed={0.6} maxTwinkleSpeed={1.1} />
                    </ResponsiveStars>
                  ) : null}
                  <div className="relative z-10 text-white">
                    <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Our Promise</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-sm sm:text-base text-white/90">We respond to all inquiries within 2 hours during business hours and within 24 hours on weekends.</p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex"><CheckCircle className="w-5 h-5 text-[#7BBF31] flex-shrink-0" /></span>
                        <span className="text-sm sm:text-base text-white/90">Fast Response Guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </BackgroundGradient>
            </div>
          </section>
        </div>
      </>
    </LazyMotion>
  );
}

export async function getStaticProps() {
  return { props: {}, revalidate: 86400 };
}
