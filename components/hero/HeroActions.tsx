"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollToHashTarget } from "@/lib/smooth-scroll";

interface HeroActionsProps {
  primaryCta: string;
  secondaryCta: string;
  projectsCta?: string;
}

export function HeroActions({
  primaryCta,
  secondaryCta,
  projectsCta,
}: HeroActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 719px)").matches;

      gsap.fromTo(
        containerRef.current,
        { y: isMobile ? 0 : 40, opacity: 0 },
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
      <a
        href="https://creativetech.uz/"
        target="_blank"
        rel="noopener noreferrer"
        className="hero-button bg-[#0B5CFF] font-medium text-white transition-transform hover:scale-[1.01] hover:bg-[#0050f2] active:scale-[0.99]"
      >
        {primaryCta}
      </a>
      <a
        href="#contacts"
        onClick={(event) => scrollToHashTarget(event, "#contacts")}
        className="hero-button bg-[#0B5CFF] font-medium text-white transition-transform hover:scale-[1.01] hover:bg-[#0050f2] active:scale-[0.99]"
      >
        {secondaryCta}
      </a>
      {projectsCta ? (
        <a
          href="#cases"
          onClick={(event) => scrollToHashTarget(event, "#cases")}
          className="hero-button bg-[#0B5CFF] font-medium text-white transition-transform hover:scale-[1.01] hover:bg-[#0050f2] active:scale-[0.99]"
        >
          {projectsCta}
        </a>
      ) : null}
    </div>
  );
}
