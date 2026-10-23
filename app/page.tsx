"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroModel from "./components/HeroModel";
import StorytellingSection from "./components/StorytellingSection";

export default function Home() {
  const containerRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0, y: 0, active: false });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const LERP_FACTOR = 0.12; // Smooth slight easing/lerp for spotlight

    const render = () => {
      // Easing / LERP towards mouse coordinates
      currentPos.current.x +=
        (targetPos.current.x - currentPos.current.x) * LERP_FACTOR;
      currentPos.current.y +=
        (targetPos.current.y - currentPos.current.y) * LERP_FACTOR;

      if (revealRef.current && targetPos.current.active) {
        const x = currentPos.current.x.toFixed(2);
        const y = currentPos.current.y.toFixed(2);
        // Soft feathered 260px radius circular spotlight mask
        const maskValue = `radial-gradient(circle 260px at ${x}px ${y}px, black 0%, black 140px, rgba(0, 0, 0, 0.75) 200px, transparent 260px)`;
        revealRef.current.style.maskImage = maskValue;
        revealRef.current.style.webkitMaskImage = maskValue;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update spotlight position
    if (!targetPos.current.active) {
      currentPos.current = { x, y };
      targetPos.current.active = true;
      if (revealRef.current) {
        revealRef.current.style.opacity = "1";
      }
    }

    targetPos.current.x = x;
    targetPos.current.y = y;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPos.current = { x, y };
    targetPos.current = { x, y, active: true };

    if (revealRef.current) {
      revealRef.current.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    targetPos.current.active = false;
    if (revealRef.current) {
      revealRef.current.style.opacity = "0";
    }
  };

  return (
    <div className="relative w-full bg-[#000000] text-white overflow-x-hidden">
      {/* ============================================================ */}
      {/* EXISTING HERO SECTION: Kept exactly as it is without alterations */}
      {/* ============================================================ */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12 lg:px-20 lg:py-14 select-none overflow-hidden"
      >
        {/* BASE BACKGROUND IMAGE (NIGHT / BG_IMAGE_2) */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
          <Image
            src="/bg-reveal.jpg"
            alt="Base Hero Library Night"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center pointer-events-none select-none brightness-95"
          />
          {/* Subtle dark vignette/overlay to maintain editorial contrast */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>

        {/* REVEAL LAYER (DAY / BG_IMAGE_1) WITH SPOTLIGHT MASK */}
        <div
          ref={revealRef}
          style={{
            opacity: 0,
            maskImage: "none",
            WebkitMaskImage: "none",
          }}
          className="absolute inset-0 w-full h-full z-[1] pointer-events-none select-none transition-opacity duration-300 ease-out"
        >
          <Image
            src="/bg-base.jpg"
            alt="Reveal Warm Library Day"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center pointer-events-none select-none"
          />
        </div>

        {/* Top Navigation */}
        <header className="relative w-full flex items-center justify-between z-30 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <div className="flex items-center">
            <span className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.28em] text-neutral-100 uppercase transition-opacity hover:opacity-80">
              LARAS
            </span>
          </div>

          <nav aria-label="Social and External Links">
            <ul className="flex items-center space-x-6 sm:space-x-8 md:space-x-12 text-[10px] sm:text-xs md:text-[13px] font-mono tracking-[0.2em] uppercase text-neutral-300">
              <li>
                <Link
                  href="#instagram"
                  className="hover:text-white transition-colors duration-200"
                >
                  /INSTAGRAM
                </Link>
              </li>
              <li>
                <Link
                  href="#behance"
                  className="hover:text-white transition-colors duration-200"
                >
                  /BEHANCE
                </Link>
              </li>
              <li>
                <Link
                  href="#x"
                  className="hover:text-white transition-colors duration-200"
                >
                  /X
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        {/* Main Dominant Hero Section (Upper-Center) */}
        <section className="relative w-full flex-1 flex flex-col items-center justify-center text-center my-auto py-8 sm:py-10 -translate-y-[10%] sm:-translate-y-[15%] md:-translate-y-[20%] transition-transform z-10">
          {/* Supporting Eyebrow Text */}
          <div className="w-full mb-3 sm:mb-4 md:mb-6 relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <p className="text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-medium tracking-[0.18em] sm:tracking-[0.22em] text-neutral-200 uppercase leading-snug max-w-2xl mx-auto text-center">
              Memadukan antara keseimbangan Belajar, Mental, Tenaga, dan Bersenang Senang
            </p>
          </div>

          {/* Oversized Headline */}
          <div className="w-full overflow-hidden flex justify-center relative z-10">
            <h1 className="text-[clamp(4.2rem,21.5vw,22rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.035em] text-white select-none text-center inline-block drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
              LARAS
            </h1>
          </div>
        </section>

        {/* 3D Model: Grounded RIGHT AT THE BOTTOM CENTER of the hero section, Z-index 1000 (above all elements) */}
        <div
          style={{ zIndex: 1000 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none flex items-end justify-center"
        >
          <div className="w-[380px] h-[480px] sm:w-[520px] sm:h-[600px] md:w-[650px] md:h-[700px] lg:w-[780px] lg:h-[780px] max-w-[100vw]">
            <HeroModel />
          </div>
        </div>

        {/* Bottom Area: Description & Action CTAs */}
        <footer className="relative w-full flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-14 pt-4 sm:pt-6 z-30 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {/* Editorial Description Text */}
          <div className="max-w-md sm:max-w-lg lg:max-w-xl text-left bg-black/40 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-3 sm:p-0 rounded">
            <p className="text-xs sm:text-[13px] md:text-sm leading-relaxed sm:leading-6 text-neutral-200 font-normal">
              Platform manajemen waktu yang membantu mahasiswa mengatur jadwal,
              menentukan prioritas, dan mengelola beban kegiatan melalui Desk
              planner, Coin Energy, dan Commitment Ticket.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 shrink-0">
            <Link
              href="#explore"
              className="group relative inline-flex items-center justify-center px-5 py-3 sm:px-6 sm:py-3.5 border border-white/35 hover:border-white text-xs sm:text-sm font-medium tracking-wider text-white hover:text-black bg-black/50 hover:bg-white backdrop-blur-sm transition-all duration-300 ease-out"
            >
              <span>Explore Website</span>
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="#content"
              className="group relative inline-flex items-center justify-center px-5 py-3 sm:px-6 sm:py-3.5 border border-white/35 hover:border-white text-xs sm:text-sm font-medium tracking-wider text-white hover:text-black bg-black/50 hover:bg-white backdrop-blur-sm transition-all duration-300 ease-out"
            >
              <span>Our Content</span>
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </footer>
      </section>

      {/* ============================================================ */}
      {/* CINEMATIC SCROLL-DRIVEN STORYTELLING SECTION */}
      {/* ============================================================ */}
      <StorytellingSection />
    </div>
  );
}
