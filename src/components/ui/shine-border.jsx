"use client";;
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shine Border
 * Left = blue, Right = green, flowing through each other in animation.
 * Uses layered gradients + blend modes; still respects your --animate-shine keyframes.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  // You can pass a string or array, defaults to brand colors.
  shineColor = ["var(--brand-deep-blue, #080331)", "var(--brand-green, #78A323)"],
  className,
  style,
  ...props
}) {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor];
  const blue  = colors[0] ?? "var(--brand-deep-blue, #080331)";
  const green = colors[1] ?? "var(--brand-green, #78A323)";

  /* Layers:
     1) Subtle white radial gleam (adds contrast to thin rings)
     2) Blue sweep from the LEFT, fading to transparent past the midline
     3) Green sweep from the RIGHT, fading to transparent past the midline
     With large background-size and animated background-position (via --animate-shine),
     they cross over the center and appear to flow through each other.
  */
  const backgroundImage = `
    radial-gradient(circle at 50% 50%,
      rgba(255,255,255,0) 45%,
      rgba(255,255,255,0.65) 50%,
      rgba(255,255,255,0) 55%
    ),
    linear-gradient(90deg,
      ${blue} 0%,
      ${blue} 48%,
      rgba(8,3,49,0.0) 65%
    ),
    linear-gradient(270deg,
      ${green} 0%,
      ${green} 48%,
      rgba(123,191,49,0.0) 65%
    )
  `;

  return (
    <div
      style={{
        "--border-width": `${borderWidth}px`,
        "--duration": `${duration}s`,
        backgroundImage,
        // Large canvases give room for a smooth crossfade motion
        backgroundSize: "280% 100%, 240% 100%, 240% 100%",
        backgroundPosition: "0% 50%",
        // Blend to make the crossover vivid but tasteful
        backgroundBlendMode: "screen, screen, screen",
        // Mask keeps the effect as a ring around your content
        mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "var(--border-width)",
        // Gentle glow to keep visibility at small widths
        filter:
          "drop-shadow(0 0 6px rgba(123,191,49,0.25)) drop-shadow(0 0 2px rgba(8,3,49,0.3))",
        pointerEvents: "none",
        ...style,
      }}
      className={cn(
        // Uses your @theme inline: --animate-shine keyframes
        "absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine",
        className
      )}
      {...props}
    />
  );
}

