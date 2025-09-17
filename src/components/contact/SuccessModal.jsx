// src/components/contact/SuccessModal.jsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const AuroraBackground = dynamic(() => import("../ui/aurora-background").then((m) => m.AuroraBackground), { ssr: false });
const ShineBorder = dynamic(() => import("../ui/shine-border").then((m) => m.ShineBorder), { ssr: false });

function useMediaQuery(query) {
  if (typeof window === "undefined") return false;
  const m = window.matchMedia(query);
  return m.matches;
}

// Lock background scroll (parity with services FeaturesModal)
function useBodyScrollLock(lock) {
  useEffect(() => {
    if (!lock) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
      touchAction: style.touchAction,
    };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";
    style.touchAction = "none";
    return () => {
      style.position = prev.position || "";
      style.top = prev.top || "";
      style.width = prev.width || "";
      style.overflow = prev.overflow || "";
      style.touchAction = prev.touchAction || "";
      window.scrollTo(0, scrollY);
    };
  }, [lock]);
}

export function SuccessModal({ open, onClose }) {
  const prefersReducedMotion = useReducedMotion();
  const isMdOrBelow = typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : true;
  const isDesktop = typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false;
  const contentScrollRef = useRef(null);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: prefersReducedMotion ? 0 : (isMdOrBelow ? 0.18 : 0.28), ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, transition: { duration: prefersReducedMotion ? 0 : (isMdOrBelow ? 0.16 : 0.24), ease: [0.22, 1, 0.36, 1] } },
  };
  const modalVariants = {
    hidden: { opacity: 0, y: isMdOrBelow ? 12 : 20, scale: prefersReducedMotion ? 1 : (isMdOrBelow ? 1 : 0.98) },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: prefersReducedMotion ? 0 : (isMdOrBelow ? 0.22 : 0.34), ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: isMdOrBelow ? 12 : 12, scale: prefersReducedMotion ? 1 : (isMdOrBelow ? 1 : 0.98), transition: { duration: prefersReducedMotion ? 0 : (isMdOrBelow ? 0.2 : 0.3), ease: [0.22, 1, 0.36, 1] } },
  };

  // Freeze background scroll while the modal is open
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent iOS scroll chaining when content reaches edges
  useEffect(() => {
    if (!open) return;
    const el = contentScrollRef.current;
    if (!el) return;
    const handleTouchMove = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight;
      const touch = e.touches[0];
      const changed = e.changedTouches[0];
      if (!touch || !changed) return;
      const movingDown = touch.clientY > changed.clientY;
      const movingUp = touch.clientY < changed.clientY;
      if ((atTop && movingDown) || (atBottom && movingUp)) e.preventDefault();
    };
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="success-modal"
          className="fixed inset-0 bg-black/60 md:backdrop-blur-sm z-50 flex justify-center items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Message Sent"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
          style={{ willChange: "opacity" }}
        >
          <motion.div
            variants={modalVariants}
            className="relative rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden"
            style={{ willChange: "opacity, transform", WebkitTransform: "translateZ(0)" }}
          >
            {isDesktop && <ShineBorder className="z-30" borderWidth={3} duration={14} />}
            <AuroraBackground className="bg-white rounded-[inherit]">
              <div ref={contentScrollRef} className="relative max-h-[90vh] overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                <div className="sticky top-0 bg-transparent p-6 z-10 flex justify-end">
                  <CloseButton onClick={onClose} ariaLabel="Close success popup" />
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <motion.span
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.8 }}
                        aria-hidden
                      >
                        <CheckCircle className="w-5 h-5" />
                      </motion.span>
                      <span>Thank you! for reaching out. We will get back to you at the earliest convenience.</span>
                    </div>
                  </div>
                  <PrivacyNoticeCard />
                </div>
              </div>
            </AuroraBackground>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CloseButton({ onClick, ariaLabel = "Close modal" }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="group inline-flex items-center justify-center p-3 text-red-600 bg-red-50 border border-red-200 rounded-full shadow-sm transition-all duration-300 ease-out hover:bg-[#78A323]/10 hover:text-[#78A323] hover:border-[#78A323]/40 hover:shadow-md"
    >
      <span className="relative block h-5 w-5">
        <span className="absolute left-1/2 top-1/2 block h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-red-600 transition-all duration-300 ease-out group-hover:bg-[#78A323] group-hover:w-6 group-active:scale-95" />
        <span className="absolute left-1/2 top-1/2 block h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-red-600 transition-all duration-300 ease-out group-hover:bg-[#78A323] group-hover:w-6 group-active:scale-95" />
      </span>
    </button>
  );
}

function PrivacyNoticeCard() {
  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-md shadow-sm p-4 md:p-5" aria-label="Privacy Notice">
      <p className="text-gray-700 text-sm leading-relaxed text-justify">
        <span className="font-semibold text-gray-900">Privacy Notice:</span>{" "}
        We value your privacy and ensure your information is secure. By submitting this form, you agree to be contacted by our team for business purposes only. We will not share your information with third parties or use it for marketing without your consent.
      </p>
    </div>
  );
}
