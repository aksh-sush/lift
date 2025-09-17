// Input with green hover glow border
"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(function Input(
  {
    className,
    type = "text",
    glowColor = "#7BBF31", // green
    radius = 120,          // glow size
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

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ background }}
      className="rounded-xl p-[2px] transition duration-300"
    >
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full h-11 rounded-xl bg-white px-3 py-2 text-sm text-[#0B0833]",
          "border border-black/10 shadow-sm outline-none transition",
          "placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-[#7BBF31]",
          className
        )}
        {...props}
      />
    </motion.div>
  );
});
