"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
];

export default function PropertySelect({
  id = "propertyType",
  label = "Property Type *",
  placeholder = "Select type…",
  value,
  onChange,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [hoverXY, setHoverXY] = useState({ x: 0, y: 0 });
  const rootRef = useRef(null);
  const btnRef = useRef(null);

  const selected = OPTIONS.find((o) => o.value === value)?.label || "";

  // close on outside click / ESC
  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function choose(val) {
    onChange?.(val);
    setOpen(false);
    // return focus to trigger
    setTimeout(() => btnRef.current?.focus(), 0);
  }

  return (
    <div ref={rootRef} className={cn("w-full", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[#0B0833] mb-2"
      >
        {label}
      </label>

      <div className="relative group rounded-xl">
        {/* subtle hover glow (same vibe as your inputs) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(140px circle at ${hoverXY.x}px ${hoverXY.y}px, rgba(59,130,246,0.20), transparent 70%)`,
            transition: "opacity .2s ease",
            opacity: 0,
          }}
          whileHover={{ opacity: 1 }}
        />

        {/* trigger button styled like inputs */}
        <button
          ref={btnRef}
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          onMouseMove={(e) => {
            const el = e.currentTarget || btnRef.current;
            if (!el || typeof el.getBoundingClientRect !== "function") return;
            const r = el.getBoundingClientRect();
            setHoverXY({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          className={cn(
            "flex w-full items-center justify-between rounded-xl bg-white",
            "px-3 py-2 h-11 text-left text-sm text-[#0B0833]",
            "border border-black/10 shadow-sm outline-none",
            "transition focus:ring-2 focus:ring-[#7BBF31] focus:border-[#7BBF31]"
          )}
        >
          <span className={cn("truncate", !selected && "text-neutral-400")}>
            {selected || placeholder}
          </span>
          <svg
            className={cn(
              "ml-2 h-4 w-4 transition",
              open ? "rotate-180" : "rotate-0"
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.2l3.71-2.97a.75.75 0 111.02 1.1l-4.24 3.4a.75.75 0 01-.95 0l-4.24-3.4a.75.75 0 01-.03-1.11z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* dropdown */}
        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className={cn(
                "absolute z-50 mt-1 w-full overflow-hidden rounded-xl",
                "bg-white border border-black/10 shadow-xl"
              )}
            >
              {OPTIONS.map((opt) => {
                const active = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(opt.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-3 py-2 text-sm",
                      "transition-colors",
                      active
                        ? "bg-[#7BBF31]/15 text-[#0B0833] font-semibold"
                        : "hover:bg-[#7BBF31]/10 text-[#0B0833]"
                    )}
                  >
                    <span>{opt.label}</span>
                    {active && (
                      <svg
                        className="h-4 w-4 text-[#7BBF31]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
