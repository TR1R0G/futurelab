"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText, registerGsapPlugins } from "@/lib/gsap";

interface HeroTitleProps {
  title: string;
}

export function HeroTitle({ title }: HeroTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const titleLines = title
    .replace(" технологий и развития", " технологий|и развития")
    .replace(" молодых специалистов", " молодых|специалистов")
    .replace(" for young specialist", " for young|specialist")
    .split("|");

  useEffect(() => {
    registerGsapPlugins();
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const split = new SplitText(containerRef.current, {
        type: "words,chars",
        wordsClass: "hero-word inline-block overflow-hidden",
        charsClass: "hero-char inline-block",
      });

      gsap.set(split.chars, { yPercent: 110, opacity: 0 });

      const tl = gsap.timeline({ delay: 0.1 });

      tl.to(split.chars, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.025,
        ease: "power4.out",
      });

      return () => {
        split.revert();
      };
    });

    return () => ctx.revert();
  }, [title]);

  return (
    <h1
      ref={containerRef}
      className="hero-title font-bold text-white"
    >
      {titleLines.map((line, index) => (
        <span key={line} className="block">
          {line}
          {index < titleLines.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
}
