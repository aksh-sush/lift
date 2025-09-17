"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function LogosCarousel({ logos, speedSec = 28 /*, canHover*/ }) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const style = mounted
    ? (reduceMotion ? { animation: "none" } : { ["--marquee-duration"]: `${speedSec}s` })
    : { ["--marquee-duration"]: `${speedSec}s` };
  return (
    <div className="relative group overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
      <ul
        className="marquee-track flex items-center gap-10 md:gap-16 min-w-max"
        style={style}
        aria-label="Our Successful Clients logos scrolling horizontally"
      >
        {[...logos, ...logos].map((logo, i) => (
          <li key={i} className="flex-shrink-0 w-[180px] flex items-center justify-center">
            <div className="w-full px-4">
              <div className="relative h-24 md:h-32">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain opacity-90"
                  sizes="(min-width: 1024px) 180px, (min-width: 640px) 160px, 140px"
                  priority={i === 0}
                  draggable={false}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

