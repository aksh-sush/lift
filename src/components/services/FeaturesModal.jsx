import { memo, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

// Local helpers specific to the modal
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e) => setMatches(e.matches);
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    if (typeof mql.addListener === "function") {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
    return () => {};
  }, [query]);
  return matches;
}

function useBodyScrollLock(lock) {
  useEffect(() => {
    if (!lock) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      window.scrollTo(0, scrollY);
    };
  }, [lock]);
}


const EASE = [0.22, 1, 0.36, 1];

function FeaturesModal({ open, details, onClose, isTouchDevice }) {
  const closeBtnRef = useRef(null);
  const modalScrollRef = useRef(null);
  const panelRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const isMediumDevice = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");

  const modalAnimation = (() => {
    if (isMediumDevice) {
      return {
        initial: { opacity: 0, scale: 0.92 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.92 },
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], when: "beforeChildren" },
      };
    } else if (isTouchDevice || prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      };
    } else {
      return {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.25, ease: EASE },
      };
    }
  })();

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const node = panelRef.current;
    if (!node) return;
    const getFocusable = () =>
      Array.from(
        node.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = getFocusable();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleTouchMove = (e) => {
      if (!modalScrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = modalScrollRef.current;
      const isTop = scrollTop === 0;
      const isBottom = scrollTop + clientHeight >= scrollHeight;
      if ((isTop && e.touches[0].clientY > e.changedTouches[0].clientY) || (isBottom && e.touches[0].clientY < e.changedTouches[0].clientY)) {
        e.preventDefault();
      }
    };
    const modalContent = modalScrollRef.current;
    if (modalContent) modalContent.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => modalContent && modalContent.removeEventListener("touchmove", handleTouchMove);
  }, [open]);

  if (!details) return null;

  return (
    <motion.div
      key="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 md:bg-black/50 md:backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-subtitle"
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        {...modalAnimation}
      >
        <div className="sticky top-0 bg-white rounded-t-3xl p-4 sm:p-6 border-b border-gray-200 z-10">
          <div className="flex justify-between items-center">
            <h2 id="modal-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {details.title}
            </h2>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Close modal"
              className="group inline-flex items-center justify-center p-3 text-red-600 bg-red-50 border border-red-200 rounded-full shadow-sm transition-all duration-200 ease-out hover:bg-[#78A323]/10 hover:text-[#78A323] hover:border-[#78A323]/40 hover:shadow-md"
            >
              <span className="relative block h-5 w-5">
                <span className="absolute left-1/2 top-1/2 block h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current transition-all duration-200 ease-out group-hover:w-6 group-active:scale-95" />
                <span className="absolute left-1/2 top-1/2 block h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current transition-all duration-200 ease-out group-hover:w-6 group-active:scale-95" />
              </span>
            </button>
          </div>
          <p id="modal-subtitle" className="text-base sm:text-lg text-[#78A323] font-semibold mt-2">
            {details.subtitle}
          </p>
        </div>
        <div ref={modalScrollRef} className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-6" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {details.features.map((feature, i) => {
              const Icon = feature.icon;
              const useGradient = isMediumDevice || (!isTouchDevice && !prefersReducedMotion);
              if (useGradient) {
                return (
                  <BackgroundGradient key={feature.title} animate={!isTouchDevice} containerClassName="rounded-2xl ring-1 ring-[#78A323]/60 h-full" className="rounded-2xl h-full">
                    <motion.div className="bg-gradient-to-br from-[#080331] via-[#0c1530] to-[#080331] rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-white/10 h-full flex flex-col group" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
                      <div className="flex items-center mb-4">
                        <div className="relative p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/40 shadow-lg">
                          <motion.span className="absolute inset-0 rounded-xl border-2 border-[#7BBF31] pointer-events-none" initial={{ scale: 0.9, opacity: 0.5 }} animate={{ scale: [1, 1.35], opacity: [0.5, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8 }} />
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg relative z-10" />
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mb-3">{feature.title}</h3>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                    </motion.div>
                  </BackgroundGradient>
                );
              }
              return (
                <div key={feature.title} className="bg-gradient-to-br from-[#080331] via-[#0c1530] to-[#080331] rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-white/10 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="relative p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/40 shadow-lg">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default memo(FeaturesModal);
