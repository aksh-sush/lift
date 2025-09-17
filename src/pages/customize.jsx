// "use client";

// import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

// /* ========================== CONFIG ========================== */

// const COLORS = Object.freeze({
//   gold: "#D4AF37",
//   coral: "#FF6F61",
//   metal: "#C0C0C0",
// });

// // Image paths from /public (recommended names — see notes above)
// const ASSETS = Object.freeze({
//   inside: {
//     base: "/lift/inside.png",
//     mask: "/lift/inside-mask.svg",
//   },
//   outside: {
//     base: "/lift/outside.png",
//     mask: "/lift/outside-mask.svg",
//   },
//   texture: "/lift/brushed-base.jpg",
//   roughness: "/lift/brushed-roughness.jpg"
// });

// // Core render resolution (source images are 2048×2048)
// const SRC_SIZE = 2048;

// // Sheen settings
// const SHEEN_MS = 1200; // hover sweep duration
// const SHEEN_THICK = 0.18; // relative thickness of the moving sheen band

// // Transition settings
// const VIEW_TRANSITION_MS = 600; // duration for view change (inside/outside)
// const COLOR_TRANSITION_MS = 400; // duration for color change

// /* ========================== UTILS =========================== */

// function loadImage(src) {
//   return new Promise((resolve) => {
//     if (!src || typeof src !== 'string') {
//       console.warn(`loadImage: Received invalid or null src: ${src}`);
//       return resolve(null);
//     }

//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.decoding = "async";
//     img.onload = () => {
//       // console.log(`loadImage: Successfully loaded ${src}`);
//       resolve(img);
//     };
//     img.onerror = (e) => {
//       console.error(`loadImage: Failed to load image: ${src}`, e);
//       resolve(null);
//     };
//     img.src = src;
//   });
// }

// function loadSvgMaskAsImage(src) {
//   return new Promise((resolve) => {
//     if (!src || typeof src !== 'string') {
//       console.warn(`loadSvgMaskAsImage: Received invalid or null src: ${src}`);
//       return resolve(null);
//     }

//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.onload = () => {
//       // console.log(`loadSvgMaskAsImage: Successfully loaded SVG mask ${src}`);
//       resolve(img);
//     };
//     img.onerror = (e) => {
//       console.error(`loadSvgMaskAsImage: Failed to load SVG mask: ${src}`, e);
//       resolve(null);
//     };
//     img.src = src;
//   });
// }

// // Simple linear interpolation for numbers
// const lerp = (a, b, t) => a + (b - a) * t;

// // Parse hex color to RGB array
// const hexToRgb = (hex) => {
//   const r = parseInt(hex.slice(1, 3), 16);
//   const g = parseInt(hex.slice(3, 5), 16);
//   const b = parseInt(hex.slice(5, 7), 16);
//   return [r, g, b];
// };

// // Interpolate between two hex colors
// const interpolateColor = (color1, color2, t) => {
//   const rgb1 = hexToRgb(color1);
//   const rgb2 = hexToRgb(color2);

//   const r = Math.round(lerp(rgb1[0], rgb2[0], t));
//   const g = Math.round(lerp(rgb1[1], rgb2[1], t));
//   const b = Math.round(lerp(rgb1[2], rgb2[2], t));

//   return `rgb(${r},${g},${b})`;
// };


// /* ========================== PAGE ============================ */

// export default function CustomizePage() {
//   const canvasRef = useRef(null);
//   const wrapRef = useRef(null);

//   const [view, setView] = useState("inside"); // "inside" | "outside"
//   const [colorKey, setColorKey] = useState("gold"); // "gold" | "coral" | "metal"

//   const [loadedAssets, setLoadedAssets] = useState({
//     inside: { base: null, mask: null },
//     outside: { base: null, mask: null },
//     texture: null,
//     roughness: null,
//     isReady: false,
//   });

//   const SWATCH_KEYS = ["gold", "coral", "metal"];
//   const currentColor = useMemo(() => COLORS[colorKey], [colorKey]);

//   // Animation states
//   const sheenRAF = useRef(null);
//   const animationRAF = useRef(null);
//   const animationStartTime = useRef(null);
//   const animationType = useRef(null); // 'view' or 'color'

//   // Store previous states for transitions
//   const previousView = useRef(view);
//   const previousColorKey = useRef(colorKey);

//   /* ------------------------ CORE DRAW ------------------------ */
//   const draw = useCallback((sheenT = 0, animationProgress = 0) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) {
//       console.error("Could not get 2D context for main canvas.");
//       return;
//     }

//     const { inside, outside, texture, roughness, isReady } = loadedAssets;
    
//     const W = canvas.width;
//     const H = canvas.height;
//     const d = Math.min(W, H);

//     ctx.clearRect(0, 0, W, H);

//     if (!isReady) {
//       return;
//     }

//     // Determine current and previous packs for view transition
//     const currentPack = view === "inside" ? inside : outside;
//     const prevPack = previousView.current === "inside" ? inside : outside;

//     // Determine current and interpolated colors for color transition
//     const finalColor = COLORS[colorKey];
//     let interpolatedColor = finalColor;

//     if (animationType.current === 'color' && animationProgress < 1) {
//       const startColor = COLORS[previousColorKey.current];
//       interpolatedColor = interpolateColor(startColor, finalColor, animationProgress);
//     }

//     ctx.imageSmoothingEnabled = true;
//     ctx.imageSmoothingQuality = "high";

//     // ----- Helper to draw a single view with color and texture -----
//     const drawViewLayer = (baseImage, maskImage, fillColor, alpha = 1) => {
//       if (!baseImage || !maskImage || !texture) {
//         // console.warn("Skipping drawViewLayer due to missing essential assets.");
//         return null;
//       }

//       const offscreenCanvas = document.createElement("canvas");
//       offscreenCanvas.width = d;
//       offscreenCanvas.height = d;
//       const octx = offscreenCanvas.getContext("2d", { willReadFrequently: false });
//       if (!octx) {
//         console.error("Could not get 2D context for offscreen canvas.");
//         return null;
//       }

//       octx.globalAlpha = alpha;

//       // 1. Draw base image
//       octx.globalCompositeOperation = "source-over";
//       octx.drawImage(baseImage, 0, 0, d, d);

//       // Create tinted + textured layer
//       const tintCanvas = document.createElement("canvas");
//       tintCanvas.width = d;
//       tintCanvas.height = d;
//       const tctx = tintCanvas.getContext("2d", { willReadFrequently: false });
//       if (!tctx) {
//         console.error("Could not get 2D context for tintCanvas.");
//         return null;
//       }

//       // 1) Fill with selected color
//       tctx.fillStyle = fillColor;
//       tctx.fillRect(0, 0, d, d);

//       // 2) Multiply a brushed metal texture over the tint
//       tctx.globalCompositeOperation = "multiply";
//       tctx.drawImage(texture, 0, 0, d, d);

//       // 3) (Optional) use roughness map
//       if (roughness) {
//         tctx.globalCompositeOperation = "overlay";
//         tctx.globalAlpha = 0.25;
//         tctx.drawImage(roughness, 0, 0, d, d);
//         tctx.globalAlpha = 1;
//       }

//       // 4) Clip to mask: draw mask into the same offscreen with destination-in
//       tctx.globalCompositeOperation = "destination-in";
//       tctx.drawImage(maskImage, 0, 0, d, d);
      
//       // Composite the masked/tinted layer over the base on the offscreen canvas
//       octx.globalCompositeOperation = "overlay";
//       octx.drawImage(tintCanvas, 0, 0);

//       octx.globalAlpha = 1; // Reset alpha for next steps

//       // Return the completed offscreen canvas
//       return offscreenCanvas;
//     };

//     let currentViewCanvas = null;
//     let prevViewCanvas = null;

//     if (animationType.current === 'view' && animationProgress < 1) {
//       // During view transition, draw both previous and current views
//       // prevView fades out, currentView fades in
//       prevViewCanvas = drawViewLayer(prevPack.base, prevPack.mask, interpolatedColor, 1 - animationProgress);
//       currentViewCanvas = drawViewLayer(currentPack.base, currentPack.mask, interpolatedColor, animationProgress);
      
//       if (prevViewCanvas) {
//         ctx.drawImage(prevViewCanvas, 0, 0);
//       }
//       if (currentViewCanvas) {
//         ctx.drawImage(currentViewCanvas, 0, 0);
//       }

//     } else {
//       // No active view transition, or view transition finished
//       currentViewCanvas = drawViewLayer(currentPack.base, currentPack.mask, interpolatedColor);
//       if (currentViewCanvas) {
//         ctx.drawImage(currentViewCanvas, 0, 0);
//       }
//     }


//     // ----- Add a static key light (top-left) -----
//     const grad = ctx.createRadialGradient(d * 0.05, d * 0.05, d * 0.05, d * 0.05, d * 0.05, d * 0.7);
//     grad.addColorStop(0, "rgba(255,255,255,0.22)");
//     grad.addColorStop(1, "rgba(255,255,255,0.0)");
//     ctx.globalCompositeOperation = "screen";
//     ctx.fillStyle = grad;
//     ctx.fillRect(0, 0, d, d);

//     // ----- Sheen sweep on hover -----
//     if (sheenT > 0) {
//       const bandPos = -SHEEN_THICK + sheenT * (1 + SHEEN_THICK * 2);
//       const sheenGradient = ctx.createLinearGradient(0, 0, d, d);
      
//       const clampedBandPos = Math.max(0, Math.min(1, bandPos));

//       sheenGradient.addColorStop(Math.max(0, clampedBandPos - SHEEN_THICK / 2), "rgba(255,255,255,0.0)");
//       sheenGradient.addColorStop(clampedBandPos, "rgba(255,255,255,0.25)");
//       sheenGradient.addColorStop(Math.min(1, clampedBandPos + SHEEN_THICK / 2), "rgba(255,255,255,0.0)");

//       ctx.globalCompositeOperation = "screen";
//       ctx.fillStyle = sheenGradient;
//       ctx.fillRect(0, 0, d, d);
//     }

//     ctx.globalCompositeOperation = "source-over"; // Restore default
//   }, [loadedAssets, view, colorKey, previousView, previousColorKey]); // Add previous states to deps

//   // Animation loop for view/color changes
//   const animateTransition = useCallback((timestamp) => {
//     if (!animationStartTime.current) {
//       animationStartTime.current = timestamp;
//     }

//     const elapsed = timestamp - animationStartTime.current;
//     const duration = animationType.current === 'view' ? VIEW_TRANSITION_MS : COLOR_TRANSITION_MS;
//     const progress = Math.min(1, elapsed / duration);

//     draw(0, progress); // Draw with animation progress

//     if (progress < 1) {
//       animationRAF.current = requestAnimationFrame(animateTransition);
//     } else {
//       // Animation finished
//       animationStartTime.current = null;
//       animationType.current = null;
//       // Ensure final state is drawn correctly after animation
//       draw(0); 
//     }
//   }, [draw]);


//   // Effect for handling view changes
//   useEffect(() => {
//     if (!loadedAssets.isReady) return;
//     if (view !== previousView.current) {
//       // Start view transition
//       cancelAnimationFrame(animationRAF.current);
//       animationStartTime.current = null; // Reset start time for new animation
//       animationType.current = 'view';
//       animationRAF.current = requestAnimationFrame(animateTransition);
//       previousView.current = view; // Update previous view immediately
//     } else {
//       // No transition, just draw if current view changes (e.g., after initial load)
//       if (!animationType.current) { // Only draw directly if no other animation is active
//         draw();
//       }
//     }
//   }, [view, loadedAssets.isReady, draw, animateTransition]);


//   // Effect for handling color changes
//   useEffect(() => {
//     if (!loadedAssets.isReady) return;
//     if (colorKey !== previousColorKey.current) {
//       // Start color transition
//       cancelAnimationFrame(animationRAF.current);
//       animationStartTime.current = null; // Reset start time for new animation
//       animationType.current = 'color';
//       animationRAF.current = requestAnimationFrame(animateTransition);
//       previousColorKey.current = colorKey; // Update previous color key immediately
//     } else {
//       // No transition, just draw if current color changes (e.g., after initial load)
//       if (!animationType.current) { // Only draw directly if no other animation is active
//         draw();
//       }
//     }
//   }, [colorKey, loadedAssets.isReady, draw, animateTransition]);


//   const onEnter = useCallback(() => {
//     if (!loadedAssets.isReady) return;
//     const start = performance.now();
//     cancelAnimationFrame(sheenRAF.current);
//     const step = (t) => {
//       const pct = Math.min(1, (t - start) / SHEEN_MS);
//       draw(pct, animationType.current ? (t - animationStartTime.current) / (animationType.current === 'view' ? VIEW_TRANSITION_MS : COLOR_TRANSITION_MS) : 0);
//       if (pct < 1) sheenRAF.current = requestAnimationFrame(step);
//       else draw(0); // Reset sheen after animation completes
//     };
//     sheenRAF.current = requestAnimationFrame(step);
//   }, [draw, loadedAssets.isReady, animationType, animationStartTime]); // Added animationType, animationStartTime to deps

//   const onLeave = useCallback(() => {
//     if (!loadedAssets.isReady) return;
//     cancelAnimationFrame(sheenRAF.current);
//     draw(0, animationType.current ? (performance.now() - animationStartTime.current) / (animationType.current === 'view' ? VIEW_TRANSITION_MS : COLOR_TRANSITION_MS) : 0); // Draw with no sheen, preserving active animation
//   }, [draw, loadedAssets.isReady, animationType, animationStartTime]); // Added animationType, animationStartTime to deps

//   const resize = useCallback(() => {
//     const el = canvasRef.current;
//     const wrap = wrapRef.current;
//     if (!el || !wrap) return;
//     const rect = wrap.getBoundingClientRect();
//     const sizeCss = Math.min(rect.width, 720);
//     const dpr = Math.min(2, window.devicePixelRatio || 1);

//     el.style.width = `${sizeCss}px`;
//     el.style.height = `${sizeCss}px`;
//     el.width = Math.floor(sizeCss * dpr);
//     el.height = Math.floor(sizeCss * dpr);

//     if (loadedAssets.isReady) {
//       draw(0, animationType.current ? (performance.now() - animationStartTime.current) / (animationType.current === 'view' ? VIEW_TRANSITION_MS : COLOR_TRANSITION_MS) : 0); // Preserve current animation state
//     }
//   }, [draw, loadedAssets.isReady, animationType, animationStartTime]); // Added animationType, animationStartTime to deps

//   // Lazy load images once
//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         const [
//           insideBase, insideMask,
//           outsideBase, outsideMask,
//           textureImg, roughnessImg
//         ] = await Promise.all([
//           loadImage(ASSETS.inside.base),
//           loadSvgMaskAsImage(ASSETS.inside.mask),
//           loadImage(ASSETS.outside.base),
//           loadSvgMaskAsImage(ASSETS.outside.mask),
//           loadImage(ASSETS.texture),
//           loadImage(ASSETS.roughness),
//         ]);

//         if (cancelled) return;

//         // Only mark isReady true if essential assets are loaded
//         const essentialAssetsLoaded = insideBase && insideMask && outsideBase && outsideMask && textureImg;

//         setLoadedAssets({
//           inside: { base: insideBase, mask: insideMask },
//           outside: { base: outsideBase, mask: outsideMask },
//           texture: textureImg,
//           roughness: roughnessImg,
//           isReady: essentialAssetsLoaded,
//         });

//       } catch (e) {
//         console.error("Critical error during image loading Promise.all:", e);
//         setLoadedAssets(prev => ({ ...prev, isReady: false }));
//       }
//     })();

//     return () => {
//       cancelled = true;
//       cancelAnimationFrame(sheenRAF.current);
//       cancelAnimationFrame(animationRAF.current);
//     };
//   }, []);

//   // Setup ResizeObserver after component mounts and assets are ready
//   useEffect(() => {
//     if (!loadedAssets.isReady) return;

//     const wrap = wrapRef.current;
//     if (!wrap) return;

//     resize();

//     const observer = new ResizeObserver((entries) => {
//       const entry = entries[0];
//       if (entry && entry.contentBoxSize) {
//         resize();
//       }
//     });
//     observer.observe(wrap);

//     return () => {
//       observer.disconnect();
//     };
//   }, [loadedAssets.isReady, resize]);


//   /* ------------------------ RENDER UI ------------------------ */

//   return (
//     <div className="min-h-[70vh] w-full bg-white">
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-[#0B0833]">
//           Customize Your Lift
//         </h1>
//         <p className="text-[#0B0833]/70 mt-1">
//           Pick a finish and preview the {view === "inside" ? "inside" : "outside"} view.
//         </p>

//         <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
//           {/* Preview */}
//           <div
//             ref={wrapRef}
//             className="w-full aspect-square bg-[#0A0833] rounded-xl shadow-xl overflow-hidden flex items-center justify-center relative" 
//             onMouseEnter={onEnter}
//             onMouseLeave={onLeave}
//             aria-label="Lift preview region"
//           >
//             <canvas 
//               ref={canvasRef} 
//               aria-label="Lift preview canvas" 
//               style={{ backgroundColor: '#0A0833', display: loadedAssets.isReady ? 'block' : 'none' }}
//             />
//             {!loadedAssets.isReady && (
//               <div className="absolute text-white text-lg animate-pulse">Loading Lift Model...</div>
//             )}
//           </div>

//           {/* Controls */}
//           <div className="w-full">
//             <h2 className="font-bold text-[#0B0833]">Finish</h2>
//             <div className="mt-3 grid grid-cols-3 gap-3">
//               {SWATCH_KEYS.map((k) => (
//                  <button
//                  key={k}
//                  onClick={() => setColorKey(k)}
//                  className={`h-10 rounded-md border transition ring-offset-2 ${
//                    colorKey === k ? "ring-2 ring-[#78A323] border-transparent" : "border-black/10"
//                  }`}
//                  title={k[0].toUpperCase() + k.slice(1)}
//                  aria-pressed={colorKey === k}
//                  disabled={!loadedAssets.isReady || (animationType.current === 'color' && previousColorKey.current !== k)} // Disable during active color transition to prevent new transitions
//                >
//                  <span
//                    className="block w-full h-full rounded-md"
//                    style={{ backgroundColor: COLORS[k] }}
//                  />
//                </button>
//              ))}
//            </div>

//             <div className="mt-6">
//               <h2 className="font-bold text-[#0B0833]">View</h2>
//               <button
//                 onClick={() => setView((v) => (v === "inside" ? "outside" : "inside"))}
//                 className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#78A323] text-[#0A0833] font-extrabold uppercase"
//                 disabled={!loadedAssets.isReady || animationType.current === 'view'} // Disable during active view transition
//               >
//                 {view === "inside" ? "External view" : "Internal view"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Accessibility hint */}
//         <p className="sr-only">
//           Use the color swatches to change the metal finish. Press the button to toggle inside and outside views.
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

/* ========================== CONFIG ========================== */

const COLORS = Object.freeze({
  // Original colors
  gold: "#D4AF37",
  coral: "#FF6F61",
  metal: "#C0C0C0",

  // LAMINATED SHEET (approximated hex values)
  laminatedGrey: "#A8A8A8",
  laminatedDarkBrown: "#5A443A",
  laminatedWood: "#8B4513", // Representative for wood grain
  laminatedLightGrey: "#D3D3D3",

  // SS MIRROR SHEET (approximated hex values)
  ssMirrorGold: "#FFD700", // Brighter gold
  ssMirrorCopper: "#B87333", // Reddish copper

  // MS - PRE COATED SHEET (approximated hex values)
  msBlack: "#000000",
  msOrange: "#FF8C00",
  msDarkBlue: "#1C3D5A",
});

// Image paths from /public (recommended names — see notes above)
const ASSETS = Object.freeze({
  inside: {
    base: "/lift/inside.png",
    mask: "/lift/inside-mask.svg",
  },
  outside: {
    base: "/lift/outside.png",
    mask: "/lift/outside-mask.svg",
  },
  texture: "/lift/brushed-base.jpg", // This texture will be applied to all finishes
  roughness: "/lift/brushed-roughness.jpg"
});

// Core render resolution (source images are 2048×2048)
const SRC_SIZE = 2048;

// Sheen settings
const SHEEN_MS = 1200; // hover sweep duration
const SHEEN_THICK = 0.18; // relative thickness of the moving sheen band

// Transition settings
const VIEW_TRANSITION_MS = 600; // duration for view change (inside/outside)
const COLOR_TRANSITION_MS = 400; // duration for color change

/* ========================== UTILS =========================== */

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string') {
      console.warn(`loadImage: Received invalid or null src: ${src}`);
      return resolve(null);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      // console.log(`loadImage: Successfully loaded ${src}`);
      resolve(img);
    };
    img.onerror = (e) => {
      console.error(`loadImage: Failed to load image: ${src}`, e);
      resolve(null);
    };
    img.src = src;
  });
}

function loadSvgMaskAsImage(src) {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string') {
      console.warn(`loadSvgMaskAsImage: Received invalid or null src: ${src}`);
      return resolve(null);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // console.log(`loadSvgMaskAsImage: Successfully loaded SVG mask ${src}`);
      resolve(img);
    };
    img.onerror = (e) => {
      console.error(`loadSvgMaskAsImage: Failed to load SVG mask: ${src}`, e);
      resolve(null);
    };
    img.src = src;
  });
}

// Simple linear interpolation for numbers
const lerp = (a, b, t) => a + (b - a) * t;

// Parse hex color to RGB array
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

// Interpolate between two hex colors
const interpolateColor = (color1, color2, t) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = Math.round(lerp(rgb1[0], rgb2[0], t));
  const g = Math.round(lerp(rgb1[1], rgb2[1], t));
  const b = Math.round(lerp(rgb1[2], rgb2[2], t));

  return `rgb(${r},${g},${b})`;
};


/* ========================== PAGE ============================ */

export default function CustomizePage() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const [view, setView] = useState("inside"); // "inside" | "outside"
  const [colorKey, setColorKey] = useState("gold"); // Initial color

  const [loadedAssets, setLoadedAssets] = useState({
    inside: { base: null, mask: null },
    outside: { base: null, mask: null },
    texture: null,
    roughness: null,
    isReady: false,
  });

  // Updated SWATCH_KEYS to include all new colors
  const SWATCH_KEYS = [
    "laminatedGrey", "laminatedDarkBrown", "laminatedWood", "laminatedLightGrey",
    "gold", "ssMirrorGold", "coral", "ssMirrorCopper", "metal",
    "msBlack", "msOrange", "msDarkBlue",
  ];
  const currentColor = useMemo(() => COLORS[colorKey], [colorKey]);

  // Animation states
  const sheenRAF = useRef(null);
  const animationRAF = useRef(null);
  const animationStartTime = useRef(null);
  const animationType = useRef(null); // 'view' or 'color'

  // Store previous states for transitions
  const previousView = useRef(view);
  const previousColorKey = useRef(colorKey);

  /* ------------------------ CORE DRAW ------------------------ */
  const draw = useCallback((sheenT = 0, animationProgress = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get 2D context for main canvas.");
      return;
    }

    const { inside, outside, texture, roughness, isReady } = loadedAssets;
    
    const W = canvas.width;
    const H = canvas.height;
    const d = Math.min(W, H);

    ctx.clearRect(0, 0, W, H);

    if (!isReady) {
      return;
    }

    // Determine current and previous packs for view transition
    const currentPack = view === "inside" ? inside : outside;
    const prevPack = previousView.current === "inside" ? inside : outside;

    // Determine current and interpolated colors for color transition
    const finalColor = COLORS[colorKey];
    let interpolatedColor = finalColor;

    if (animationType.current === 'color' && animationProgress < 1) {
      const startColor = COLORS[previousColorKey.current];
      interpolatedColor = interpolateColor(startColor, finalColor, animationProgress);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // ----- Helper to draw a single view with color and texture -----
    const drawViewLayer = (baseImage, maskImage, fillColor, alpha = 1) => {
      if (!baseImage || !maskImage || !texture) {
        // console.warn("Skipping drawViewLayer due to missing essential assets.");
        return null;
      }

      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = d;
      offscreenCanvas.height = d;
      const octx = offscreenCanvas.getContext("2d", { willReadFrequently: false });
      if (!octx) {
        console.error("Could not get 2D context for offscreen canvas.");
        return null;
      }

      octx.globalAlpha = alpha;

      // 1. Draw base image
      octx.globalCompositeOperation = "source-over";
      octx.drawImage(baseImage, 0, 0, d, d);

      // Create tinted + textured layer
      const tintCanvas = document.createElement("canvas");
      tintCanvas.width = d;
      tintCanvas.height = d;
      const tctx = tintCanvas.getContext("2d", { willReadFrequently: false });
      if (!tctx) {
        console.error("Could not get 2D context for tintCanvas.");
        return null;
      }

      // 1) Fill with selected color
      tctx.fillStyle = fillColor;
      tctx.fillRect(0, 0, d, d);

      // 2) Multiply a brushed metal texture over the tint
      tctx.globalCompositeOperation = "multiply";
      tctx.drawImage(texture, 0, 0, d, d);

      // 3) (Optional) use roughness map
      if (roughness) {
        tctx.globalCompositeOperation = "overlay";
        tctx.globalAlpha = 0.25;
        tctx.drawImage(roughness, 0, 0, d, d);
        tctx.globalAlpha = 1;
      }

      // 4) Clip to mask: draw mask into the same offscreen with destination-in
      tctx.globalCompositeOperation = "destination-in";
      tctx.drawImage(maskImage, 0, 0, d, d);
      
      // Composite the masked/tinted layer over the base on the offscreen canvas
      octx.globalCompositeOperation = "overlay";
      octx.drawImage(tintCanvas, 0, 0);

      octx.globalAlpha = 1; // Reset alpha for next steps

      // Return the completed offscreen canvas
      return offscreenCanvas;
    };

    let currentViewCanvas = null;
    let prevViewCanvas = null;

    if (animationType.current === 'view' && animationProgress < 1) {
      // During view transition, draw both previous and current views
      // prevView fades out, currentView fades in
      prevViewCanvas = drawViewLayer(prevPack.base, prevPack.mask, interpolatedColor, 1 - animationProgress);
      currentViewCanvas = drawViewLayer(currentPack.base, currentPack.mask, interpolatedColor, animationProgress);
      
      if (prevViewCanvas) {
        ctx.drawImage(prevViewCanvas, 0, 0);
      }
      if (currentViewCanvas) {
        ctx.drawImage(currentViewCanvas, 0, 0);
      }

    } else {
      // No active view transition, or view transition finished
      currentViewCanvas = drawViewLayer(currentPack.base, currentPack.mask, interpolatedColor);
      if (currentViewCanvas) {
        ctx.drawImage(currentViewCanvas, 0, 0);
      }
    }


    // ----- Add a static key light (top-left) -----
    const grad = ctx.createRadialGradient(d * 0.05, d * 0.05, d * 0.05, d * 0.05, d * 0.05, d * 0.7);
    grad.addColorStop(0, "rgba(255,255,255,0.22)");
    grad.addColorStop(1, "rgba(255,255,255,0.0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, d, d);

    // ----- Sheen sweep on hover -----
    if (sheenT > 0) {
      const bandPos = -SHEEN_THICK + sheenT * (1 + SHEEN_THICK * 2);
      const sheenGradient = ctx.createLinearGradient(0, 0, d, d);
      
      const clampedBandPos = Math.max(0, Math.min(1, bandPos));

      sheenGradient.addColorStop(Math.max(0, clampedBandPos - SHEEN_THICK / 2), "rgba(255,255,255,0.0)");
      sheenGradient.addColorStop(clampedBandPos, "rgba(255,255,255,0.25)");
      sheenGradient.addColorStop(Math.min(1, clampedBandPos + SHEEN_THICK / 2), "rgba(255,255,255,0.0)");

      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = sheenGradient;
      ctx.fillRect(0, 0, d, d);
    }

    ctx.globalCompositeOperation = "source-over"; // Restore default
  }, [loadedAssets, view, colorKey, previousView, previousColorKey]); // Added previous states to deps

  // Animation loop for view/color changes
  const animateTransition = useCallback((timestamp) => {
    if (!animationStartTime.current) {
      animationStartTime.current = timestamp;
    }

    const elapsed = timestamp - animationStartTime.current;
    const duration = animationType.current === 'view' ? VIEW_TRANSITION_MS : COLOR_TRANSITION_MS;
    const progress = Math.min(1, elapsed / duration);

    draw(0, progress); // Draw with animation progress

    if (progress < 1) {
      animationRAF.current = requestAnimationFrame(animateTransition);
    } else {
      // Animation finished
      animationStartTime.current = null;
      animationType.current = null;
      // Ensure final state is drawn correctly after animation
      draw(0); 
    }
  }, [draw]);


  // Effect for handling view changes
  useEffect(() => {
    if (!loadedAssets.isReady) return;
    if (view !== previousView.current) {
      // Start view transition
      cancelAnimationFrame(animationRAF.current);
      animationStartTime.current = null; // Reset start time for new animation
      animationType.current = 'view';
      animationRAF.current = requestAnimationFrame(animateTransition);
      previousView.current = view; // Update previous view immediately
    } else {
      // No transition, just draw if current view changes (e.g., after initial load)
      if (!animationType.current) { // Only draw directly if no other animation is active
        draw();
      }
    }
  }, [view, loadedAssets.isReady, draw, animateTransition]);


  // Effect for handling color changes
  useEffect(() => {
    if (!loadedAssets.isReady) return;
    if (colorKey !== previousColorKey.current) {
      // Start color transition
      cancelAnimationFrame(animationRAF.current);
      animationStartTime.current = null; // Reset start time for new animation
      animationType.current = 'color';
      animationRAF.current = requestAnimationFrame(animateTransition);
      previousColorKey.current = colorKey; // Update previous color key immediately
    } else {
      // No transition, just draw if current color changes (e.g., after initial load)
      if (!animationType.current) { // Only draw directly if no other animation is active
        draw();
      }
    }
  }, [colorKey, loadedAssets.isReady, draw, animateTransition]);


  const onEnter = useCallback(() => {
    if (!loadedAssets.isReady) return;
    const start = performance.now();
    cancelAnimationFrame(sheenRAF.current);
    const step = (t) => {
      const pct = Math.min(1, (t - start) / SHEEN_MS);
      draw(pct, animationType.current ? (t - animationStartTime.current) / (animationType.current === 'view' ? VIEW_TRANSITION_MS : COLOR_TRANSITION_MS) : 0);
      if (pct < 1) sheenRAF.current = requestAnimationFrame(step);
      else draw(0); // Reset sheen after animation completes
    };
    sheenRAF.current = requestAnimationFrame(step);
  }, [draw, loadedAssets.isReady, animationType, animationStartTime]); // Added animationType, animationStartTime to deps

  const onLeave = useCallback(() => {
    if (!loadedAssets.isReady) return;
    cancelAnimationFrame(sheenRAF.current);
    draw(0, animationType.current ? (performance.now() - animationStartTime.current) / (animationType.current === 'view' ? VIEW_TRANSITION_MS : COLOR_TRANSITION_MS) : 0); // Draw with no sheen, preserving active animation
  }, [draw, loadedAssets.isReady, animationType, animationStartTime]); // Added animationType, animationStartTime to deps

  const resize = useCallback(() => {
    const el = canvasRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const sizeCss = Math.min(rect.width, 720);
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    el.style.width = `${sizeCss}px`;
    el.style.height = `${sizeCss}px`;
    el.width = Math.floor(sizeCss * dpr);
    el.height = Math.floor(sizeCss * dpr);

    if (loadedAssets.isReady) {
      draw(0, animationType.current ? (performance.now() - animationStartTime.current) / (animationType.current === 'view' ? VIEW_TRANSITION_MS : COLOR_TRANSITION_MS) : 0); // Preserve current animation state
    }
  }, [draw, loadedAssets.isReady, animationType, animationStartTime]); // Added animationType, animationStartTime to deps

  // Lazy load images once
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [
          insideBase, insideMask,
          outsideBase, outsideMask,
          textureImg, roughnessImg
        ] = await Promise.all([
          loadImage(ASSETS.inside.base),
          loadSvgMaskAsImage(ASSETS.inside.mask),
          loadImage(ASSETS.outside.base),
          loadSvgMaskAsImage(ASSETS.outside.mask),
          loadImage(ASSETS.texture),
          loadImage(ASSETS.roughness),
        ]);

        if (cancelled) return;

        // Only mark isReady true if essential assets are loaded
        const essentialAssetsLoaded = insideBase && insideMask && outsideBase && outsideMask && textureImg;

        setLoadedAssets({
          inside: { base: insideBase, mask: insideMask },
          outside: { base: outsideBase, mask: outsideMask },
          texture: textureImg,
          roughness: roughnessImg,
          isReady: essentialAssetsLoaded,
        });

      } catch (e) {
        console.error("Critical error during image loading Promise.all:", e);
        setLoadedAssets(prev => ({ ...prev, isReady: false }));
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(sheenRAF.current);
      cancelAnimationFrame(animationRAF.current);
    };
  }, []);

  // Setup ResizeObserver after component mounts and assets are ready
  useEffect(() => {
    if (!loadedAssets.isReady) return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    resize();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentBoxSize) {
        resize();
      }
    });
    observer.observe(wrap);

    return () => {
      observer.disconnect();
    };
  }, [loadedAssets.isReady, resize]);


  /* ------------------------ RENDER UI ------------------------ */

  const formatColorName = (key) => {
    // Simple formatting for display in titles
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^(.)|\s(.)/g, (match) => match.toUpperCase()); // Capitalize first letter of each word
  };

  return (
    <div className="min-h-[70vh] w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-[#0B0833]">
          Customize Your Lift
        </h1>
        <p className="text-[#0B0833]/70 mt-1">
          Pick a finish and preview the {view === "inside" ? "inside" : "outside"} view.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Preview */}
          <div
            ref={wrapRef}
            className="w-full aspect-square bg-[#0A0833] rounded-xl shadow-xl overflow-hidden flex items-center justify-center relative" 
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            aria-label="Lift preview region"
          >
            <canvas 
              ref={canvasRef} 
              aria-label="Lift preview canvas" 
              style={{ backgroundColor: '#0A0833', display: loadedAssets.isReady ? 'block' : 'none' }}
            />
            {!loadedAssets.isReady && (
              <div className="absolute text-white text-lg animate-pulse">Loading Lift Model...</div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full">
            <h2 className="font-bold text-[#0B0833]">Finish</h2>
            {/* Group swatches by type as seen in the image if desired, for now, they are all together */}
            <div className="mt-3 grid grid-cols-4 gap-3"> {/* Changed to 4 columns for more swatches */}
              {SWATCH_KEYS.map((k) => (
                 <button
                 key={k}
                 onClick={() => setColorKey(k)}
                 className={`h-10 rounded-md border transition ring-offset-2 ${
                   colorKey === k ? "ring-2 ring-[#78A323] border-transparent" : "border-black/10"
                 }`}
                 title={formatColorName(k)} // Use formatted name for title
                 aria-pressed={colorKey === k}
                 disabled={!loadedAssets.isReady || (animationType.current === 'color' && previousColorKey.current !== k)} // Disable during active color transition to prevent new transitions
               >
                 <span
                   className="block w-full h-full rounded-md"
                   style={{ backgroundColor: COLORS[k] }}
                 />
               </button>
             ))}
           </div>

            <div className="mt-6">
              <h2 className="font-bold text-[#0B0833]">View</h2>
              <button
                onClick={() => setView((v) => (v === "inside" ? "outside" : "inside"))}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#78A323] text-[#0A0833] font-extrabold uppercase"
                disabled={!loadedAssets.isReady || animationType.current === 'view'} // Disable during active view transition
              >
                {view === "inside" ? "External view" : "Internal view"}
              </button>
            </div>
          </div>
        </div>

        {/* Accessibility hint */}
        <p className="sr-only">
          Use the color swatches to change the metal finish. Press the button to toggle inside and outside views.
        </p>
      </div>
    </div>
  );
}