"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText, registerGsapPlugins } from "@/lib/gsap";

interface HeroTitleProps {
  title: string;
}

const TITLE_LINE_MAP: Record<
  string,
  {
    desktop: string[];
    compact: string[];
  }
> = {
  "Студия цифровых технологий и развития молодых специалистов": {
    desktop: [
      "Студия цифровых технологий",
      "и развития молодых",
      "специалистов",
    ],
    compact: [
      "Студия цифровых",
      "технологий",
      "и развития молодых",
      "специалистов",
    ],
  },
  "CreativeTech-хаб для обучения, практики и разработки иммерсивных digital-продуктов":
    {
      desktop: [
        "CreativeTech-хаб для обучения,",
        "практики и разработки иммерсивных",
        "digital-продуктов",
      ],
      compact: [
        "CreativeTech-хаб для",
        "обучения, практики и",
        "разработки иммерсивных",
        "digital-продуктов",
      ],
    },
  "Digital technology studio for young specialist development": {
    desktop: [
      "Digital technology studio",
      "for young specialist",
      "development",
    ],
    compact: [
      "Digital technology",
      "studio for young",
      "specialist development",
    ],
  },
  "CreativeTech hub for education, practice, and development of immersive digital products":
    {
      desktop: [
        "CreativeTech hub for education,",
        "practice, and development of immersive",
        "digital products",
      ],
      compact: [
        "CreativeTech hub for",
        "education, practice, and",
        "development of immersive",
        "digital products",
      ],
    },
};

export function HeroTitle({ title }: HeroTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const lineConfig = TITLE_LINE_MAP[title];
  const compactTitleLines = lineConfig?.compact ?? null;
  const titleLines = lineConfig?.desktop ?? title.split("|");

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
      {compactTitleLines ? (
        <>
          <span className="hero-title-lines-default">
            {titleLines.map((line) => (
              <span
                key={line}
                className="block whitespace-normal min-[1200px]:whitespace-nowrap"
              >
                {line}
              </span>
            ))}
          </span>
          <span className="hero-title-lines-compact">
            {compactTitleLines.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </span>
        </>
      ) : (
        titleLines.map((line) => (
          <span
            key={line}
            className="block whitespace-normal min-[1200px]:whitespace-nowrap"
          >
            {line}
          </span>
        ))
      )}
    </h1>
  );
}
