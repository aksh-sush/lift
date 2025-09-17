import React from "react";
import { Target, ArrowRight } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";

// Target with an animated arrow flying into the bullseye.
export default function TargetArrowIcon({ className = "", style, ...props }) {
  const reduce = useReducedMotion();

  return (
    <span
      className={["relative inline-block text-[#7BBF31]", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Base target */}
      <Target
        className="absolute inset-0"
        style={{ color: "inherit", width: "100%", height: "100%" }}
        strokeWidth={2}
      />

      {/* Arrow animation (disabled with reduced motion) */}
      {!reduce && (
        <>
          {/* Arrow flight from left into center */}
          <m.span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            aria-hidden
            style={{ width: "70%", height: "70%", transformOrigin: "center" }}
            animate={{ x: ["-120%", "0%", "0%", "-120%"], opacity: [0, 1, 0, 0] }}
            transition={{ duration: 3.0, times: [0, 0.52, 0.6, 1], repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          >
            <ArrowRight style={{ color: "inherit", width: "100%", height: "100%" }} strokeWidth={2} />
          </m.span>

          {/* Impact ripple at the bullseye */}
          <m.span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            aria-hidden
            style={{ border: "1.5px solid currentColor", width: "100%", height: "100%", opacity: 0 }}
            animate={{ scale: [0.2, 1.1, 0.2], opacity: [0, 0.35, 0] }}
            transition={{ duration: 3.0, times: [0.52, 0.7, 1], repeat: Infinity, ease: "easeOut" }}
          />
        </>
      )}
    </span>
  );
}

