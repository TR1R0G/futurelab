"use client";

import type { ProgramsContent } from "@/lib/mdx";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { useEffect, useRef } from "react";
import { ProgramCard } from "./ProgramCard";

interface ProgramsProps {
  cards: ProgramsContent["cards"];
}

export function Programs({ cards }: ProgramsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".program-card", {
          y: 76,
          opacity: 0,
          duration: 0.9,
          stagger: 0.16,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
          },
        });
      });
    }, section);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="programs-section bg-black px-5 pb-24 pt-10 md:px-8 md:pb-32 md:pt-16 lg:pb-40 lg:pt-[92px]"
    >
      <div className="mx-auto grid max-w-[1436px] gap-8 md:grid-cols-3 md:gap-10">
        {cards.map((card) => (
          <ProgramCard key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}
