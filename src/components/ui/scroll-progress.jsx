"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform } from "framer-motion";
import React, { useEffect, useRef } from "react";

/**
 * Pass `variant="inline"` to place the bar anywhere in your layout.
 * Default keeps it fixed at the very top of the page.
 */
export const ScrollProgress = React.forwardRef(
  ({ className, variant = "fixedTop", ...props }, ref) => {
    // Custom progress that accounts for dynamic mobile viewports (iOS toolbars, etc.)
    const progress = useMotionValue(0);
    const rafRef = useRef(null);

    const compute = () => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
      const viewportH = window.visualViewport?.height || window.innerHeight || doc.clientHeight || 0;
      const scrollH = Math.max(doc.scrollHeight, body.scrollHeight, doc.offsetHeight, body.offsetHeight, doc.clientHeight);
      const maxScrollable = Math.max(scrollH - viewportH, 1);
      // Nudge near-bottom to 100% to avoid off-by-a-few-px on mobile
      const raw = scrollTop / maxScrollable;
      const nearBottom = maxScrollable - scrollTop <= 2; // within 2px of bottom
      // Clamp between 0 and 1. Show 0% exactly at top as requested.
      const clamped = Math.min(Math.max(nearBottom ? 1 : raw, 0), 1);
      progress.set(clamped);
    };

    useEffect(() => {
      const onScroll = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(compute);
      };
      const onResize = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(compute);
      };
      compute();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      window.visualViewport?.addEventListener?.("resize", onResize);
      window.visualViewport?.addEventListener?.("scroll", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        window.visualViewport?.removeEventListener?.("resize", onResize);
        window.visualViewport?.removeEventListener?.("scroll", onResize);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    // Use width% instead of scaleX so the bar remains visible at 100%
    const progressWidth = useTransform(progress, (v) => `${v * 100}%`);

    return (
      <motion.div
        ref={ref}
        aria-hidden="true"
        role="presentation"
        className={cn(
          "bg-[#7BBF31]", // green line
          variant === "fixedTop"
            ? "fixed inset-x-0 top-0 z-[9999] h-[3px]" // fixed at top
            : "w-full h-[4px]", // inline usage (e.g., inside header), slightly thicker
          className
        )}
        style={{ width: progressWidth }}
        {...props}
      />
    );
  }
);

ScrollProgress.displayName = "ScrollProgress";
