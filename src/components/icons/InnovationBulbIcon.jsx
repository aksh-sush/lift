import React from "react";
import { Lightbulb, Cog } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";

// A composed icon: lightbulb with overlaid cogs to evoke innovation.
// Accepts `className` to match lucide sizing/color via `currentColor`.
export default function InnovationBulbIcon({ className = "", style, ...props }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={["relative inline-block text-[#7BBF31]", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {/* Soft radial glow behind the bulb */}
      {!prefersReducedMotion && (
        <m.span
          aria-hidden
          className="absolute -inset-1 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(123,191,49,0.35), rgba(123,191,49,0.18) 60%, transparent 70%)",
            filter: "blur(6px)",
          }}
          animate={{ opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Base bulb with a subtle pulsing drop shadow */}
      {prefersReducedMotion ? (
        <Lightbulb
          className="absolute inset-0"
          style={{ color: "inherit", width: "100%", height: "100%" }}
          strokeWidth={2}
        />
      ) : (
        <m.span
          aria-hidden
          className="absolute inset-0"
          animate={{
            filter: [
              "drop-shadow(0 0 0 rgba(123,191,49,0))",
              "drop-shadow(0 6px 14px rgba(123,191,49,0.45))",
              "drop-shadow(0 0 0 rgba(123,191,49,0))",
            ],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
        >
          <Lightbulb
            className="absolute inset-0"
            style={{ color: "inherit", width: "100%", height: "100%" }}
            strokeWidth={2}
          />
        </m.span>
      )}

      {/* Big gear on right side (slightly outside the bulb) */}
      {prefersReducedMotion ? (
        <Cog
          style={{
            color: "inherit",
            position: "absolute",
            width: "56%",
            height: "56%",
            right: "-6%",
            top: "-2%",
          }}
          strokeWidth={2}
        />
      ) : (
        <m.span
          aria-hidden
          style={{
            position: "absolute",
            width: "56%",
            height: "56%",
            right: "-6%",
            top: "-2%",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Cog style={{ color: "inherit", width: "100%", height: "100%" }} strokeWidth={2} />
        </m.span>
      )}

      {/* Small inner gear */}
      {prefersReducedMotion ? (
        <Cog
          style={{
            color: "inherit",
            position: "absolute",
            width: "34%",
            height: "34%",
            left: "38%",
            top: "28%",
          }}
          strokeWidth={2}
        />
      ) : (
        <m.span
          aria-hidden
          style={{
            position: "absolute",
            width: "34%",
            height: "34%",
            left: "38%",
            top: "28%",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
        >
          <Cog style={{ color: "inherit", width: "100%", height: "100%" }} strokeWidth={2} />
        </m.span>
      )}
    </span>
  );
}
