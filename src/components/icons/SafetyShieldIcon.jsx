import React from "react";
import { Shield } from "lucide-react";
import { useReducedMotion } from "framer-motion";

// Shield with concentric ping rings (matches ProductDetails "Safety Certified").
export default function SafetyShieldIcon({ className = "", style, ...props }) {
  const reduce = useReducedMotion();
  return (
    <span
      className={["relative inline-block text-[#7BBF31]", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      <Shield
        className="absolute inset-0"
        style={{ color: "inherit", width: "100%", height: "100%" }}
        strokeWidth={2}
      />
      {!reduce && (
        <>
          <span
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#7BBF31]/30 animate-[ping_2.2s_linear_infinite]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#7BBF31]/20 animate-[ping_2.2s_linear_infinite]"
            style={{ animationDelay: "1.1s" }}
            aria-hidden
          />
        </>
      )}
    </span>
  );
}

