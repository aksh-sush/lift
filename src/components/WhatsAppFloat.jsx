"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { MessageCircle, X, Phone } from "lucide-react";
import dynamic from "next/dynamic";
const AuroraBackground = dynamic(
  () => import("@/components/ui/aurora-background").then((m) => m.AuroraBackground),
  { ssr: false }
);
const ShineBorder = dynamic(
  () => import("@/components/ui/shine-border").then((m) => m.ShineBorder),
  { ssr: false }
);
import WhatsAppIcon from "./icons/WhatsAppIcon";

// Lightweight client hooks for capability detection
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    try {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } catch {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);
  return reduced;
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

const WhatsAppFloat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceMotion = usePrefersReducedMotion();
  const canHover = useCanHover();

  const handleWhatsAppClick = useCallback(() => {
    const phoneNumber = "+1234567890"; // TODO: replace with your WhatsApp number in international format
    const message = encodeURIComponent(
      "Hello! I'm interested in your elevator solutions. Can you help me?"
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  }, []);

  const handleCallClick = useCallback(() => {
    window.open("tel:+1234567890", "_self"); // TODO: replace with your phone number
  }, []);

  // Desktop-only effects (shine border)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    try {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } catch {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  // Wrapper to avoid mounting heavy background on reduced motion
  const BackgroundWrapper = reduceMotion ? 'div' : AuroraBackground;
  const allowHover = isDesktop && canHover && !reduceMotion;

  // Removed footer overlap adjustment to keep button fixed at bottom.

  // Allow background to scroll while popup is open (no scroll lock)

  // Measure header height to keep overlay below header (so header stays visible)
  const [headerH, setHeaderH] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.querySelector("header");
    if (!el) return;
    let raf = 0;
    const update = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setHeaderH(Math.ceil(el.getBoundingClientRect().height || 0)));
    };
    update();
    let ro;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } else {
      window.addEventListener("resize", update, { passive: true });
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, []);

  const containerRef = useRef(null);
  const toggleRef = useRef(null);

  // Close on Escape while open; keep outside clicks for interaction/scroll
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed right-0 left-0 bg-black/20 z-40 pointer-events-none"
          style={{ top: headerH || 0, bottom: 0 }}
        />
      )}

      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
        }}
        ref={containerRef}
      >
        {isOpen && (
          <div className="mb-4 relative rounded-2xl shadow-2xl w-80 overflow-hidden animate-fade-in">
            {isDesktop && <ShineBorder className="z-30" borderWidth={2} duration={14} />}
            <BackgroundWrapper className="bg-white rounded-[inherit]">
            <div className="bg-gradient-to-r from-[#7BBF31] to-[#080331] text-white p-4 rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <MessageCircle className="w-5 h-5 block" />
                </div>
                <div>
                  <h3 className="font-semibold">Quick Support</h3>
                  <p className="text-xs text-green-100">SVS Unitech Elevators</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
              <div className="flex items-start space-x-2">
                <div className="relative w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/svs-logo.svg"
                    alt="SVS Unitech"
                    fill
                    sizes="32px"
                    className="object-contain object-center p-0.5"
                  />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    👋 Hello! Welcome to <strong>SVS Unitech Elevators</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="relative w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/svs-logo.svg"
                    alt="SVS Unitech"
                    fill
                    sizes="32px"
                    className="object-contain object-center p-0.5"
                  />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    We're here to help you with all your elevator needs! How can we assist you today?
                  </p>
                </div>
              </div>

              {/* Quick Options removed as requested */}
            </div>

            <div className="p-4 space-y-3">
              {/* WhatsApp CTA styled like brochure button */}
              <button onClick={handleWhatsAppClick} className={`${allowHover ? "group" : ""} inline-block w-full`} aria-label="Continue on WhatsApp">
                <span
                  className={`relative inline-flex items-center justify-center gap-2.5 overflow-hidden btn-raise rounded-2xl px-6 py-3 text-white font-medium text-base shadow-lg transition-all duration-300 w-full bg-[#080331] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60 active:scale-[.98] ${allowHover ? "group-hover:bg-[#7BBF31]" : ""}`}
                  role="button"
                  tabIndex={0}
                >
                  <span
                    className={`pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(closest-side,rgba(123,191,49,0.18),transparent_70%)] opacity-0 blur-md transition-opacity duration-300 ${allowHover ? "group-hover:opacity-100" : ""}`}
                    aria-hidden
                  />
                  <span className="sheen-sweep" aria-hidden />
                  <span className="relative z-10">Continue on WhatsApp</span>
                  <span className="relative z-10 inline-flex" aria-hidden="true">
                    <WhatsAppIcon className={`w-5 h-5 icon-whatsapp-pulse text-[#25D366] ${allowHover ? "group-hover:text-white" : ""}`} />
                  </span>
                </span>
              </button>

              {/* Call CTA styled like brochure button */}
              <button onClick={handleCallClick} className={`${allowHover ? "group" : ""} inline-block w-full`} aria-label="Call Us Now">
                <span
                  className={`relative inline-flex items-center justify-center gap-2.5 overflow-hidden btn-raise rounded-2xl px-6 py-3 text-white font-medium text-base shadow-lg transition-all duration-300 w-full bg-[#080331] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7BBF31]/60 active:scale-[.98] ${allowHover ? "group-hover:bg-[#7BBF31]" : ""}`}
                  role="button"
                  tabIndex={0}
                >
                  <span
                    className={`pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(closest-side,rgba(123,191,49,0.18),transparent_70%)] opacity-0 blur-md transition-opacity duration-300 ${allowHover ? "group-hover:opacity-100" : ""}`}
                    aria-hidden
                  />
                  <span className="sheen-sweep" aria-hidden />
                  <span className="relative z-10">Call Us Now</span>
                  <span className="relative z-10 inline-flex" aria-hidden="true">
                    <span className="phone-wave relative ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                      <Phone className="h-4 w-4 text-white" />
                    </span>
                  </span>
                </span>
              </button>
            </div>

            <div className="px-4 pb-3">
              <p className="text-xs text-gray-400 text-center">We typically reply in a few minutes</p>
            </div>
            </BackgroundWrapper>
          </div>
        )}

        <button
          onClick={() => setIsOpen((v) => !v)}
          className={`${allowHover ? "group" : ""} relative flex items-center justify-center text-white p-4 rounded-full shadow-lg transition-all duration-300 transform will-change-transform ${
            allowHover ? "hover:shadow-xl hover:scale-110" : ""
          } ${
            isOpen
              ? `bg-gray-500 ${allowHover ? "hover:bg-gray-600" : ""}`
              : `bg-gradient-to-r from-green-500 to-green-600 ${allowHover ? "hover:from-green-600 hover:to-green-700" : ""}`
          }`}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          aria-pressed={isOpen}
          type="button"
          ref={toggleRef}
        >
          {isOpen ? (
            <span className="relative block h-5 w-5" aria-hidden>
              <span
                className={`
                  absolute left-1/2 top-1/2 block h-[2px] w-5
                  -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full
                  bg-red-600
                  transition-all duration-300 ease-out
                  ${allowHover ? "group-hover:bg-[#78A323] group-hover:w-6 group-active:scale-95" : "active:scale-95"}
                `}
              />
              <span
                className={`
                  absolute left-1/2 top-1/2 block h-[2px] w-5
                  -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full
                  bg-red-600
                  transition-all duration-300 ease-out
                  ${allowHover ? "group-hover:bg-[#78A323] group-hover:w-6 group-active:scale-95" : "active:scale-95"}
                `}
              />
            </span>
          ) : (
            <MessageCircle className="w-6 h-6 block" />
          )}

          {mounted && !isOpen && !reduceMotion && (
            <div className="absolute inset-0 bg-[#7BBF31] rounded-full animate-ping opacity-20" />
          )}

          {mounted && !isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">1</span>
            </div>
          )}
        </button>
      </div>
    </>
  );
};

export default WhatsAppFloat;
