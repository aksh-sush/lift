import React from "react";
import { ClipboardList, BadgeCheck } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";

// Composite icon: clipboard with an animated QA badge.
// Accepts className/style like lucide icons and uses currentColor.
export default function QualityAssuranceIcon({ className = "", style, ...props }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={["relative inline-block text-[#7BBF31]", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Base clipboard */}
      <ClipboardList
        className="absolute inset-0"
        style={{ color: "inherit", width: "100%", height: "100%" }}
        strokeWidth={2}
      />

      {/* Subtle shimmer across clipboard */}
      {!prefersReducedMotion && (
        <m.span
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded"
        >
          <m.span
            className="absolute top-0 bottom-0 w-1/3"
            style={{
              background:
                "linear-gradient(120deg, transparent 10%, rgba(255,255,255,0.18) 50%, transparent 90%)",
              filter: "blur(1px)",
            }}
            animate={{ x: ["-120%", "140%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
          />
        </m.span>
      )}

      {/* QA badge at bottom-right */}
      {prefersReducedMotion ? (
        <BadgeCheck
          style={{
            color: "inherit",
            position: "absolute",
            width: "48%",
            height: "48%",
            right: "-4%",
            bottom: "-6%",
          }}
          strokeWidth={2}
        />
      ) : (
        <m.span
          aria-hidden
          style={{
            position: "absolute",
            width: "48%",
            height: "48%",
            right: "-4%",
            bottom: "-6%",
            transformOrigin: "60% 60%",
          }}
          animate={{ scale: [0.95, 1.08, 1.0], rotate: [-6, 0, 0] }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], repeat: Infinity, repeatDelay: 2.2 }}
        >
          <BadgeCheck style={{ color: "inherit", width: "100%", height: "100%" }} strokeWidth={2} />

          {/* Radiating ring to emphasize the "stamp" moment */}
          <m.span
            className="absolute inset-0 rounded-full"
            style={{ border: "1px solid currentColor", opacity: 0.25 }}
            animate={{ scale: [0.7, 1.15], opacity: [0.35, 0] }}
            transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity, repeatDelay: 2.4 }}
          />
        </m.span>
      )}
    </span>
  );
}

