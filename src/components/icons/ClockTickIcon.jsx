"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/** Real-time IST analog clock using rAF + CSS vars (no re-renders).
 *  Honors prefers-reduced-motion. API compatible with your previous component.
 */
export default function ClockTickIcon({ className = "", style, ...props }) {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const rafRef = useRef(0);

  const initial = useMemo(() => getAnglesIST(), []);

  useEffect(() => {
    if (reduce) return; // static if reduced motion
    const el = rootRef.current;
    if (!el) return;

    const tick = () => {
      const { h, m, s } = getAnglesIST();
      el.style.setProperty("--rot-h", `${h}deg`);
      el.style.setProperty("--rot-m", `${m}deg`);
      el.style.setProperty("--rot-s", `${s}deg`);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduce]);

  return (
    <span
      ref={rootRef}
      className={["relative inline-block text-[#7BBF31]", className].filter(Boolean).join(" ")}
      style={{
        ...style,
        aspectRatio: "1 / 1",
        // seed CSS vars so it looks correct on first paint
        ["--rot-h"]: `${initial.h}deg`,
        ["--rot-m"]: `${initial.m}deg`,
        ["--rot-s"]: `${initial.s}deg`,
      }}
      role="img"
      aria-label="Analog clock showing current time"
      {...props}
    >
      {/* Dial */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ border: "2px solid currentColor", opacity: 0.9 }}
      />

      {/* Hour hand */}
      <span
        aria-hidden
        style={handStyle(reduce ? initial.h : "var(--rot-h)", 24, 2.5)}
      />

      {/* Minute hand */}
      <span
        aria-hidden
        style={handStyle(reduce ? initial.m : "var(--rot-m)", 32, 2)}
      />

      {/* Second hand */}
      <span
        aria-hidden
        style={handStyle(reduce ? initial.s : "var(--rot-s)", 46, 2)}
      />

      {/* Seconds tip dot riding the second hand */}
      {!reduce && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 4,
            height: 4,
            borderRadius: 9999,
            background: "currentColor",
            zIndex: 3,
            willChange: "transform",
            transform: "translate(-50%,-50%) rotate(var(--rot-s)) translateY(-46%)",
          }}
        />
      )}

      {/* Center cap */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 6,
          height: 6,
          transform: "translate(-50%, -50%)",
          background: "currentColor",
          borderRadius: 9999,
          zIndex: 4,
        }}
      />
    </span>
  );
}

/* ============== Helpers ============== */

function getAnglesIST() {
  const now = Date.now();
  const ist = new Date(now + new Date().getTimezoneOffset() * 60000 + 5.5 * 3600000);
  const ms = ist.getMilliseconds();
  const sWhole = ist.getSeconds();
  const s = sWhole + ms / 1000;
  const mWhole = ist.getMinutes();
  const m = mWhole + s / 60;
  const hWhole = ist.getHours() % 12;
  const h = hWhole + m / 60;
  return { s: s * 6, m: m * 6, h: h * 30 }; // degrees
}

function handStyle(angleDegOrVar, lengthPct, widthPx) {
  const z = lengthPct >= 46 ? 3 : lengthPct >= 32 ? 2 : 1;
  const rotate = typeof angleDegOrVar === "number" ? `${angleDegOrVar}deg` : angleDegOrVar;
  return {
    position: "absolute",
    left: "50%",
    bottom: "50%",
    width: `${widthPx}px`,
    height: `${lengthPct}%`,
    background: "currentColor",
    borderRadius: "2px",
    transformOrigin: "50% 100%",
    transform: `translateX(-50%) rotate(${rotate})`,
    opacity: 0.9,
    zIndex: z,
    willChange: "transform",
  };
}
