"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function StorytellingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Smooth lerp progress references
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const touchStartY = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // 1. Maintain window dimensions
    const updateDimensions = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // 2. Controlled scroll: image expands on wheel/touch, zero third page
    const handleWheel = (e: WheelEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();

      // Active when section is within viewport
      const isActive = rect.top <= 50 && rect.bottom >= window.innerHeight - 50;

      if (isActive) {
        // If scrolling down, expand image up to 1.0; never scroll past it into a third page
        if (e.deltaY > 0) {
          e.preventDefault();
          const step = e.deltaY * 0.0014;
          targetProgressRef.current = Math.min(1, targetProgressRef.current + step);
        } else if (e.deltaY < 0) {
          // If scrolling up, reverse image back to 0; if already at 0, allow natural scroll back to hero
          if (targetProgressRef.current > 0.02) {
            e.preventDefault();
            const step = e.deltaY * 0.0014;
            targetProgressRef.current = Math.max(0, targetProgressRef.current + step);
          }
        }
      }
    };

    // 3. Touch event interception for mobile / tablet devices
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isActive = rect.top <= 50 && rect.bottom >= window.innerHeight - 50;

      if (isActive) {
        const currentY = e.touches[0].clientY;
        const deltaY = touchStartY.current - currentY;
        touchStartY.current = currentY;

        if (deltaY > 0) {
          // Swipe up (scroll down): expand image, block scrolling to third page
          e.preventDefault();
          const step = deltaY * 0.0035;
          targetProgressRef.current = Math.min(1, targetProgressRef.current + step);
        } else if (deltaY < 0) {
          // Swipe down (scroll up): shrink image back
          if (targetProgressRef.current > 0.02) {
            e.preventDefault();
            const step = deltaY * 0.0035;
            targetProgressRef.current = Math.max(0, targetProgressRef.current + step);
          }
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    // 4. Keyboard arrow keys interception (Down/Up/Space/PageDown)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isActive = rect.top <= 50 && rect.bottom >= window.innerHeight - 50;

      if (isActive) {
        if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
          e.preventDefault();
          targetProgressRef.current = Math.min(1, targetProgressRef.current + 0.12);
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
          if (targetProgressRef.current > 0.05) {
            e.preventDefault();
            targetProgressRef.current = Math.max(0, targetProgressRef.current - 0.12);
          }
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    // 5. Silky smooth 120fps Lerp animation loop
    const loop = () => {
      const LERP = 0.09;
      currentProgressRef.current +=
        (targetProgressRef.current - currentProgressRef.current) * LERP;

      setScrollProgress(Math.round(currentProgressRef.current * 10000) / 10000);
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const p = scrollProgress; // 0 to 1

  // Responsive initial 9:16 portrait card sizing
  const isMobile = windowSize.width < 768;
  const initialWidth = isMobile
    ? Math.min(windowSize.width * 0.52, 210)
    : Math.min(windowSize.width * 0.22, 290);
  const initialHeight = initialWidth * (16 / 9);

  // Cinematic growth curve: gentle ease-in leading to decisive full bleed expansion
  const easeProgress = Math.pow(p, 1.4);

  // Interpolated card dimensions from portrait 9:16 to full screen
  const currentWidth =
    initialWidth + (windowSize.width - initialWidth) * easeProgress;
  const currentHeight =
    initialHeight + (windowSize.height - initialHeight) * easeProgress;

  // Border radius: 18px -> 0px (reaches 0 at p >= 0.8)
  const currentRadius = Math.max(0, 18 * (1 - Math.min(1, p / 0.8)));

  // Border opacity: 1 -> 0
  const borderOpacity = Math.max(0, 1 - p * 1.6);

  // Surrounding text fade & translation multiplier
  const textExitOpacity = Math.max(0, 1 - p * 2.2);

  // Click handler to auto-expand to full screen
  const handleAutoExpand = () => {
    targetProgressRef.current = 1;
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-[#000000] text-white select-none overflow-hidden"
    >
      {/* Fullscreen Exhibition Canvas (Exactly 1 screen height, no third page below) */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#000000]">
        {/* Subtle Ambient Background Gradient */}
        <div
          style={{ opacity: Math.max(0, 1 - p * 1.8) }}
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(30,30,30,0.4)_0%,rgba(0,0,0,1)_70%)] transition-opacity duration-300"
        />

        {/* ============================================================ */}
        {/* ASYMMETRIC EDITORIAL "ORGANIZED CHAOS" TEXT ELEMENTS */}
        {/* ============================================================ */}

        {/* 1. TOP-LEFT: Phase & Coordinate Metadata */}
        <div
          style={{
            opacity: textExitOpacity,
            transform: `translate3d(${-p * 220}px, ${-p * 100}px, 0) rotate(${-3 - p * 8}deg)`,
          }}
          className="absolute top-[8%] sm:top-[12%] left-[4%] sm:left-[8%] pointer-events-none z-10 transition-all duration-75"
        >
          <div className="border-l-2 border-white/50 pl-3 py-1">
            <span className="block text-[9px] sm:text-[11px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
              [ 01 // DISCOVERY PHASE ]
            </span>
            <h3 className="text-xs sm:text-sm font-semibold tracking-wider text-neutral-200 uppercase mt-0.5">
              HMW / POV Framework
            </h3>
            <span className="block text-[8px] sm:text-[10px] font-mono tracking-widest text-neutral-500 mt-0.5">
              LAT 07°14&apos;S // LON 112°45&apos;E
            </span>
          </div>
        </div>

        {/* 2. TOP-RIGHT: Editorial Pull Quote */}
        <div
          style={{
            opacity: textExitOpacity,
            transform: `translate3d(${p * 220}px, ${-p * 110}px, 0) rotate(${2 + p * 6}deg)`,
          }}
          className="absolute top-[9%] sm:top-[13%] right-[4%] sm:right-[9%] pointer-events-none z-10 max-w-[200px] sm:max-w-[280px] text-right transition-all duration-75"
        >
          <div className="border border-white/15 bg-neutral-950/70 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl">
            <div className="flex items-center justify-end gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] font-mono tracking-[0.2em] text-amber-300 uppercase">
                FIELD RESEARCH #04
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-serif italic text-neutral-200 leading-relaxed">
              &ldquo;Meredam kecemasan tugas perkuliahan tanpa memicu efek domino penumpukan.&rdquo;
            </p>
            <span className="block text-[8px] sm:text-[9px] font-mono tracking-widest text-neutral-500 uppercase mt-1">
              Cluster 03: Beban Kognitif
            </span>
          </div>
        </div>

        {/* 3. MIDDLE-LEFT: Coin Energy Protocol Stat */}
        <div
          style={{
            opacity: textExitOpacity,
            transform: `translate3d(${-p * 260}px, ${p * 40}px, 0) rotate(${-2 - p * 6}deg) scale(${1 - p * 0.2})`,
          }}
          className="absolute top-[42%] sm:top-[44%] left-[3%] sm:left-[6%] pointer-events-none z-10 max-w-[170px] sm:max-w-[230px] transition-all duration-75"
        >
          <div className="border border-cyan-500/25 bg-cyan-950/20 backdrop-blur-md p-3 rounded-xl shadow-2xl">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-sm border border-cyan-400 rotate-45" />
              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-cyan-300 uppercase">
                COIN ENERGY™
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-300 leading-snug">
              Alokasi 5 koin energi harian untuk mencegah keletihan mental mahasiswa.
            </p>
            <div className="mt-2 pt-1.5 border-t border-cyan-500/20 flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-cyan-400/80">
              <span>PRIORITAS</span>
              <span>DYNAMIC MAPPING</span>
            </div>
          </div>
        </div>

        {/* 4. MIDDLE-RIGHT: Physical to Digital Bridge */}
        <div
          style={{
            opacity: textExitOpacity,
            transform: `translate3d(${p * 260}px, ${p * 50}px, 0) rotate(${3 + p * 8}deg) scale(${1 - p * 0.2})`,
          }}
          className="absolute top-[46%] sm:top-[48%] right-[3%] sm:right-[6%] pointer-events-none z-10 max-w-[180px] sm:max-w-[240px] transition-all duration-75"
        >
          <div className="border border-neutral-700/60 bg-neutral-950/70 backdrop-blur-md p-3 rounded-xl shadow-2xl text-left">
            <span className="inline-block px-2 py-0.5 rounded-full border border-white/20 text-[8px] sm:text-[9px] font-mono tracking-wider text-neutral-300 uppercase mb-1.5">
              PHYSICAL TO DIGITAL
            </span>
            <p className="text-[10px] sm:text-xs text-neutral-200 leading-snug font-medium">
              Desk Planner berwujud fisik yang tersinkronisasi otomatis ke kalender digital.
            </p>
            <span className="block text-[8px] sm:text-[9px] font-mono text-neutral-500 uppercase mt-1">
              Single-Entry Ecosystem
            </span>
          </div>
        </div>

        {/* 5. BOTTOM-LEFT: Commitment Ticket Note */}
        <div
          style={{
            opacity: textExitOpacity,
            transform: `translate3d(${-p * 180}px, ${p * 160}px, 0) rotate(${1.5 - p * 5}deg)`,
          }}
          className="absolute bottom-[9%] sm:bottom-[13%] left-[4%] sm:left-[9%] pointer-events-none z-10 max-w-[190px] sm:max-w-[250px] transition-all duration-75"
        >
          <div className="border-b border-white/30 pb-2">
            <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase">
              TICKET PROTOCOL
            </span>
            <h4 className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-100 uppercase mt-0.5">
              Commitment Ticket
            </h4>
            <p className="text-[9px] sm:text-[11px] text-neutral-400 leading-tight mt-1">
              Mekanisme komitmen non-formal memanfaatkan dukungan sosial rekan sebaya.
            </p>
          </div>
        </div>

        {/* 6. BOTTOM-RIGHT: Museum / Exhibition Curation Stamp */}
        <div
          style={{
            opacity: textExitOpacity,
            transform: `translate3d(${p * 180}px, ${p * 160}px, 0) rotate(${-2.5 + p * 6}deg)`,
          }}
          className="absolute bottom-[9%] sm:bottom-[13%] right-[4%] sm:right-[9%] pointer-events-none z-10 text-right transition-all duration-75"
        >
          <div className="border border-white/15 bg-neutral-950/70 backdrop-blur-md p-3 rounded-xl shadow-2xl">
            <span className="block text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase">
              ARCHIVE // ARTIFACT NO. 01
            </span>
            <span className="block text-[11px] sm:text-xs font-mono font-medium tracking-wider text-neutral-300 uppercase mt-0.5">
              Design Thinking Toolbox
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-mono tracking-widest text-neutral-400 uppercase mt-1.5">
              9:16 EXHIBITION CANVAS
            </span>
          </div>
        </div>

        {/* 7. SCROLL TO EXPLORE HINT (Interactive: Fades out as image expands) */}
        {p < 0.9 && (
          <div
            onClick={handleAutoExpand}
            style={{
              opacity: Math.max(0, 1 - p * 3.5),
              transform: `translateY(${p * 20}px)`,
            }}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 cursor-pointer pointer-events-auto flex flex-col items-center gap-2 group transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-300 group-hover:border-white transition-colors">
              <span>Scroll to Explore Archive</span>
              <span className="text-amber-400">↓</span>
            </div>
            <div className="w-3.5 h-6 rounded-full border border-white/25 flex items-start justify-center p-1">
              <div className="w-1 h-1.5 rounded-full bg-white/70 animate-bounce" />
            </div>
          </div>
        )}

        {/* 8. GOOGLE DRIVE BAR DIRECTLY ABOVE THE IMAGE */}
        <div
          style={{
            opacity: Math.max(0, 1 - p * 2.5),
            transform: `translate3d(-50%, calc(-${currentHeight / 2}px - 44px - ${p * 25}px), 0)`,
          }}
          className="absolute top-1/2 left-1/2 z-30 pointer-events-auto transition-opacity duration-150"
        >
          <a
            href="https://drive.google.com/drive/folders/1MS1UpatF_ncVl2k9pPlTVEzoAh5ZSL5X?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/25 bg-black/80 hover:bg-white text-neutral-300 hover:text-black backdrop-blur-md text-[10px] sm:text-xs font-mono tracking-wider transition-all duration-300 cursor-pointer shadow-2xl hover:border-white group select-none whitespace-nowrap"
          >
            <svg
              className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M22.85 15l-6.56-11.5H9.72L16.28 15" />
            </svg>
            <span>Google Drive Archive</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-neutral-400 group-hover:text-black">
              ↗
            </span>
          </a>
        </div>

        {/* ============================================================ */}
        {/* CENTER SCALING 9:16 IMAGE CONTAINER */}
        {/* Smoothly expands from 9:16 portrait card to 100vw x 100vh full bleed */}
        {/* ============================================================ */}
        <div
          onClick={handleAutoExpand}
          style={{
            width: `${currentWidth}px`,
            height: `${currentHeight}px`,
            borderRadius: `${currentRadius}px`,
            boxShadow:
              p > 0.85
                ? "none"
                : `0 20px 60px rgba(0,0,0,0.9), 0 0 ${40 * (1 - p)}px rgba(255,255,255,${0.08 * (1 - p)})`,
          }}
          className="relative z-20 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer transition-shadow duration-300"
        >
          {/* Subtle Dynamic Border Line */}
          <div
            style={{
              opacity: borderOpacity,
              borderRadius: `${currentRadius}px`,
            }}
            className="absolute inset-0 border border-white/30 pointer-events-none z-10 transition-opacity duration-200"
          />

          {/* Cinematic Vignette Overlay */}
          <div
            style={{ opacity: Math.max(0, 1 - p * 1.5) }}
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none z-[5] transition-opacity duration-300"
          />

          {/* The Story Image (Preserves focal point while expanding to full screen) */}
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <Image
              src="/brainstorming-template-v3.png"
              alt="LARAS Brainstorming POV & HMW Design Thinking Archive"
              fill
              priority
              sizes="100vw"
              className="object-contain object-center select-none pointer-events-none transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${1 + (1 - p) * 0.05})`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
