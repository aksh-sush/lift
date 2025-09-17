"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const slideEase = [0.22, 1, 0.36, 1];
const slideVariants = {
  enter: () => ({ opacity: 0, scale: 1.02, zIndex: 1 }),
  center: {
    opacity: 1,
    scale: 1,
    zIndex: 2,
    transition: { duration: 0.8, ease: slideEase },
  },
  exit: () => ({ opacity: 0, scale: 0.98, zIndex: 1, transition: { duration: 0.8, ease: slideEase } }),
};

function CarouselNavButton({ onClick, ariaLabel, Icon }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className="btn-circle btn-close-anim">
      <Icon className="w-5 h-5" />
    </button>
  );
}

export function ImageCarousel({ images = [], altPrefix = "Slide", autoMs = 5000, carouselId }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef(null);
  const len = images.length || 1;

  const saveCarouselState = useCallback(
    (currentIndex) => {
      if (carouselId && typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`carousel_${carouselId}`, currentIndex.toString());
        } catch {}
      }
    },
    [carouselId]
  );

  useEffect(() => {
    if (carouselId && typeof window !== "undefined") {
      try {
        const savedIndex = sessionStorage.getItem(`carousel_${carouselId}`);
        if (savedIndex !== null) {
          const parsedIndex = parseInt(savedIndex, 10);
          if (parsedIndex >= 0 && parsedIndex < len) setIndex(parsedIndex);
        }
      } catch {}
    }
  }, [carouselId, len]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const saveData = !!conn?.saveData;
      const slow = typeof conn?.effectiveType === 'string' && /(^|-)2g$/i.test(conn.effectiveType || '');
      if (saveData || slow) return; // skip prefetch on data-saver/2G
    } catch {}
    images.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [images]);

  const go = useCallback(
    (dir) => {
      setDirection(dir);
      setIndex((prev) => {
        const next = (prev + dir + len) % len;
        saveCarouselState(next);
        return next;
      });
    },
    [len, saveCarouselState]
  );

  useEffect(() => {
    if (reduceMotion || len <= 1) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % len);
    }, autoMs);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [reduceMotion, len, autoMs]);

  return (
    <div className="relative h-64 overflow-hidden">
      <div className="absolute inset-0 bg-[#080331]" />
      <div className="absolute inset-0">
        <AnimatePresence custom={direction} initial={false} mode="sync">
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
            style={{ willChange: "transform, opacity" }}
          >
            <Image
              src={images[index]}
              alt={`${altPrefix} ${index + 1}`}
              fill
              className="object-cover select-none"
              priority={index === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#080331]/80 via-[#080331]/40 to-transparent pointer-events-none" />
      {len > 1 && (
        <>
          <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20">
            <CarouselNavButton onClick={() => go(-1)} ariaLabel="Previous image" Icon={ArrowLeft} />
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20">
            <CarouselNavButton onClick={() => go(1)} ariaLabel="Next image" Icon={ArrowRight} />
          </div>
        </>
      )}
    </div>
  );
}
