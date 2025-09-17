// Textarea with green hover glow border
"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef(function Textarea(
  {
    className,
    as = "textarea", // "textarea" | "input"
    wrapperClassName,
    borderWidth = 2,
    rows = 6,
    glowColor = "#7BBF31",
    radius = 140,
    ...props
  },
  ref
) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [visible, setVisible] = React.useState(false);

  function handleMouseMove(e) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  const background = useMotionTemplate`
    radial-gradient(
      ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
      ${glowColor},
      transparent 80%
    )
  `;

  const Element = as === "input" ? "input" : "textarea";

  const fieldClass = cn(
    "w-full rounded-xl bg-white px-3 py-2 text-sm text-[#0B0833]",
    "border border-black/10 shadow-sm outline-none transition",
    "placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-[#7BBF31]",
    as === "textarea" ? "resize-y" : "",
    className
  );

  const wrapperCls = cn("rounded-xl transition duration-300", wrapperClassName);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{
        background,
        padding: `${borderWidth}px`,
      }}
      className={wrapperCls}
    >
      <Element
        ref={ref}
        {...(as === "textarea" ? { rows } : {})}
        className={fieldClass}
        {...props}
      />
    </motion.div>
  );
});
