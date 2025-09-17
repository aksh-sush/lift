// src/components/BackgroundGradient.jsx
import { cn } from "@/lib/utils";
import React from "react";
import { m } from "framer-motion";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
  // Continuous, lightweight background movement
  const bgAnim = animate
    ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
    : undefined;

  const revealBlur = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.7 },
  };
  const revealSharp = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // Build a soft multi-radial green background (all in #78A323 family)
  const bgImage =
    `radial-gradient(60% 60% at 20% 20%, rgba(120,163,35,0.55) 0%, rgba(120,163,35,0) 60%),` +
    `radial-gradient(70% 70% at 80% 25%, rgba(120,163,35,0.45) 0%, rgba(120,163,35,0) 62%),` +
    `radial-gradient(95% 95% at 50% 80%, rgba(120,163,35,0.35) 0%, rgba(120,163,35,0) 65%)`;

  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      {/* Blurred glow layer */}
      <m.div
        variants={revealBlur}
        animate={bgAnim}
        transition={
          animate ? { duration: 5, repeat: Infinity, repeatType: "reverse" } : undefined
        }
        style={{
          backgroundImage: bgImage,
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          // Inherit radius from container so different rounded-* work correctly
          "absolute inset-0 rounded-[inherit] z-[1] opacity-70 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform"
        )}
      />
      {/* Sharp glow layer */}
      <m.div
        variants={revealSharp}
        animate={bgAnim}
        transition={
          animate ? { duration: 5, repeat: Infinity, repeatType: "reverse" } : undefined
        }
        style={{
          backgroundImage: bgImage,
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          // Inherit radius for consistent corners with container
          "absolute inset-0 rounded-[inherit] z-[1] will-change-transform"
        )}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
