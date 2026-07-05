"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface HeroActionsProps {
  primaryCta: string;
  secondaryCta: string;
}

export function HeroActions({ primaryCta, secondaryCta }: HeroActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          delay: 0.8,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="hero-actions flex flex-col">
      <button className="hero-button bg-[#0B5CFF] font-medium text-white transition-transform hover:scale-[1.01] hover:bg-[#0050f2] active:scale-[0.99]">
        {primaryCta}
      </button>
      <a
        href="#contacts"
        className="hero-button bg-[#0B5CFF] font-medium text-white transition-transform hover:scale-[1.01] hover:bg-[#0050f2] active:scale-[0.99]"
      >
        {secondaryCta}
      </a>
    </div>
  );
}
