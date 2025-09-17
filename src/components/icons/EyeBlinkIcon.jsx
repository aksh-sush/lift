import React from "react";
import { Eye } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";

// Eye with periodic blink (scaleY squish) respecting reduced motion.
export default function EyeBlinkIcon({ className = "", style, ...props }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <span className={["relative inline-block text-[#7BBF31]", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        <Eye className="absolute inset-0" style={{ color: "inherit", width: "100%", height: "100%" }} strokeWidth={2} />
      </span>
    );
  }

  return (
    <span className={["relative inline-block text-[#7BBF31]", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Blink by squashing vertical scale briefly, twice per cycle */}
      <m.span
        className="absolute inset-0 origin-center"
        aria-hidden
        animate={{ scaleY: [1, 0.08, 1, 1, 0.08, 1] }}
        transition={{
          duration: 3.0,
          times: [0, 0.06, 0.12, 0.56, 0.62, 0.68],
          repeat: Infinity,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Eye className="absolute inset-0" style={{ color: "inherit", width: "100%", height: "100%" }} strokeWidth={2} />
      </m.span>

      {/* Small highlight that gently shifts to mimic glint */}
      <m.span
        className="absolute right-[30%] top-[38%] h-1 w-1 rounded-full"
        style={{ background: "currentColor", opacity: 0.25, filter: "blur(0.5px)" }}
        aria-hidden
        animate={{ x: [0, -1, 0], y: [0, -0.5, 0], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
      />
    </span>
  );
}

