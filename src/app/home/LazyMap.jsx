"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";

export function LazyMap({ src, title = "Google Map", className = "", eager = false }) {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [saveDataMode, setSaveDataMode] = useState(false);

  useEffect(() => {
    if (eager) {
      setShouldLoad(true);
      return;
    }
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const saveData = !!conn?.saveData;
      const slow = typeof conn?.effectiveType === 'string' && /(^|-)2g$/i.test(conn?.effectiveType || '');
      if (saveData || slow) {
        setSaveDataMode(true);
        return; // require user tap to load
      }
    } catch {}

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      });
    }, { root: null, rootMargin: '1200px', threshold: 0.01 });
    if (containerRef.current) io.observe(containerRef.current);
    return () => io.disconnect();
  }, [eager]);

  const handleLoadClick = useCallback(() => setShouldLoad(true), []);

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <iframe
          src={src}
          width="100%"
          height="100%"
          className="rounded-b-3xl border-0"
          title={title}
          allowFullScreen
          loading={eager ? "eager" : "lazy"}
          importance={eager ? "high" : undefined}
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="relative w-full h-full min-h-[320px] rounded-b-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0833] to-[#0f0b40]" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="relative z-10 h-full w-full grid place-items-center p-6 text-center text-white">
            <div className="max-w-md">
              <h4 className="text-lg font-semibold mb-2">Map deferred for performance</h4>
              <p className="text-white/80 text-sm mb-4">{saveDataMode ? 'You are on a data-saver/slow connection.' : 'We load the map when needed to keep the page fast.'}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadClick}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#7BBF31] text-[#0A0833] font-semibold shadow-md active:scale-[.98]"
                >
                  Load Map
                </button>
                <a
                  href="https://maps.google.com/?q=SVS%20UNITECH%20Elevators%20Bangalore%20560001"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
