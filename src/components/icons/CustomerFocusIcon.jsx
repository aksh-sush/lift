import React from "react";
import { Users, Heart } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";

// Composite icon: Users with a caring/attention heart accent and gentle pings.
// Accepts className/style and uses currentColor so it blends with theme.
export default function CustomerFocusIcon({ className = "", style, ...props }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={["relative inline-block text-[#7BBF31]", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Base users silhouette */}
      <Users
        className="absolute inset-0"
        style={{ color: "inherit", width: "100%", height: "100%" }}
        strokeWidth={2}
      />

      {/* Subtle breathing focus ring around users */}
      {!prefersReducedMotion && (
        <m.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid currentColor", opacity: 0.25 }}
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Caring heart accent at top-right */}
      {prefersReducedMotion ? (
        <Heart
          style={{
            color: "inherit",
            position: "absolute",
            width: "36%",
            height: "36%",
            right: "-6%",
            top: "-8%",
            fill: "none",
          }}
          strokeWidth={2}
        />
      ) : (
        <m.span
          aria-hidden
          style={{
            position: "absolute",
            width: "36%",
            height: "36%",
            right: "-6%",
            top: "-8%",
            transformOrigin: "60% 40%",
          }}
          animate={{ scale: [0.95, 1.12, 1.0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: [0.22, 1, 0.36, 1], repeatDelay: 1.8 }}
        >
          <Heart style={{ color: "inherit", width: "100%", height: "100%" }} strokeWidth={2} />
          {/* Gentle glow pulse under heart */}
          <m.span
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(closest-side, currentColor 20%, transparent 70%)", opacity: 0.18, filter: "blur(3px)" }}
            animate={{ opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.8 }}
          />
        </m.span>
      )}

      {/* Small engagement ping dot (bottom-left), subtle and periodic */}
      {!prefersReducedMotion && (
        <m.span
          aria-hidden
          style={{
            position: "absolute",
            left: "-4%",
            bottom: "-6%",
            width: "18%",
            height: "18%",
            borderRadius: "9999px",
            background: "currentColor",
            opacity: 0.2,
          }}
          animate={{ scale: [0.5, 1.1], opacity: [0.25, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", repeatDelay: 2.6 }}
        />
      )}
    </span>
  );
}

