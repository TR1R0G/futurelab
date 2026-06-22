"use client";

import type { InfrastructureContent } from "@/lib/mdx";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { useEffect, useRef } from "react";
import { InfrastructureCard } from "./InfrastructureCard";
import { ImageGallery } from "./ImageGallery";
import { CTACard } from "./CTACard";

interface InfrastructureProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaButton: string;
  cards: InfrastructureContent["cards"];
}

export function Infrastructure({
  title,
  subtitle,
  ctaText,
  ctaButton,
  cards,
}: InfrastructureProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              once: true,
            },
          })
          .from(".infrastructure-heading > *", {
            y: 44,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
          })
          .from(
            ".infrastructure-card",
            {
              y: 70,
              opacity: 0,
              rotate: (index) => [-2, 1.5, -1][index] ?? 0,
              duration: 0.85,
              stagger: 0.14,
              ease: "power3.out",
            },
            "-=0.42"
          );

        gsap.from(".infrastructure-cta", {
          y: 54,
          opacity: 0,
          scale: 0.97,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".infrastructure-cta",
            start: "top 88%",
            once: true,
          },
        });

        gsap.from(".infrastructure-separator", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.25,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: ".infrastructure-separator",
            start: "top 92%",
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
      className="infrastructure-section w-full overflow-hidden bg-black pb-24 pt-24 md:pb-32 md:pt-32 lg:pb-40 lg:pt-40"
    >
      <div className="infrastructure-heading mx-auto max-w-[1120px] px-5 md:px-8">
        <h2 className="max-w-3xl text-[36px] font-bold leading-[1.08] text-white md:text-5xl lg:text-[56px]">
          {title}
        </h2>
        <p className="mt-8 max-w-2xl text-base font-medium text-white/60 md:text-lg">
          {subtitle}
        </p>
      </div>

      <div className="infrastructure-cards mx-auto mt-12 grid max-w-[1120px] gap-4 px-5 md:mt-16 md:grid-cols-3 md:gap-5 md:px-8">
        {cards.map((card) => (
          <InfrastructureCard key={card.title} card={card} />
        ))}
      </div>

      <ImageGallery />

      <CTACard text={ctaText} buttonText={ctaButton} />

      <div
        className="infrastructure-separator mx-auto mt-28 h-1 w-[calc(100%_-_40px)] max-w-[1436px] rounded-sm bg-[linear-gradient(90deg,#4B0E5B_0%,#A91E83_29.9%,#FD9A34_65.67%,#F9EB44_100%)] md:mt-36 md:w-[calc(100%_-_64px)] lg:mt-44"
        aria-hidden="true"
      />
    </section>
  );
}
