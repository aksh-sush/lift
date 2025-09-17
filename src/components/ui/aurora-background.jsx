// src/components/ui/aurora-background.jsx
"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Minimal Aurora background:
 * - Transparent wrapper (no glass/backdrop blur)
 * - Soft animated gradient sheet behind content
 * - Optional radial mask for a gentle vignette
 */
export function AuroraBackground({
  className,
  children,
  showRadialMask = true,
  ...props
}) {
  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {/* Subtle animated layer behind content */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 aurora will-change-transform",
          showRadialMask &&
            "[mask-image:radial-gradient(120%_90%_at_85%_0%,black_28%,transparent_72%)]"
        )}
        aria-hidden
      />

      {/* Content */}
      <div className="relative">{children}</div>

      <style jsx>{`
        .aurora {
          /* same palette, just toned down */
          background-image: repeating-linear-gradient(
            100deg,
            rgba(59, 130, 246, 0.7) 0%,
            rgba(165, 180, 252, 0.7) 10%,
            rgba(147, 197, 253, 0.7) 20%,
            rgba(221, 214, 254, 0.7) 30%,
            rgba(96, 165, 250, 0.7) 40%,
            rgba(59, 130, 246, 0.7) 50%
          );
          background-size: 240% 240%;
          filter: blur(14px) saturate(105%);
          opacity: 0.32;              /* lighter, more minimal */
          animation: auroraShift 26s linear infinite;
        }

        @keyframes auroraShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}

export default AuroraBackground;
