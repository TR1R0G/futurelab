"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { GradientOrb } from "./GradientOrb";
import { HeroTitle } from "./HeroTitle";
import { HeroActions } from "./HeroActions";

interface HeroProps {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  imageAlt: string;
}

export function Hero({
  title,
  description,
  primaryCta,
  secondaryCta,
  imageAlt,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const ctx = gsap.context(() => {
      if (descRef.current) {
        gsap.fromTo(
          descRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
        );
      }

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.4,
          }
        );
      }

      if (sectionRef.current && imageRef.current) {
        gsap.to(imageRef.current, {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-section relative min-h-screen w-full overflow-hidden bg-black"
    >
      <div ref={orbRef} className="absolute inset-0">
        <GradientOrb />
      </div>

      <HeroHeader cta="Связаться с нами" />

      <div className="hero-copy relative z-10">
        <HeroTitle title={title} />
      </div>

      <p ref={descRef} className="hero-description relative z-10">
        {description}
      </p>

      <div ref={imageRef} className="hero-image relative z-10">
        <div className="relative h-full w-full overflow-hidden rounded-[14px] shadow-2xl shadow-black/45">
          <Image
            src="/images/office.png"
            alt={imageAlt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 180px, 180px"
          />
        </div>
      </div>

      <div className="hero-action-panel relative z-10">
        <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
      </div>
    </section>
  );
}

function HeroHeader({ cta }: { cta: string }) {
  return (
    <header className="hero-header relative z-20" aria-label="Future Lab">
      <div className="hero-brand-shell">
        <a className="hero-brand" href="#" aria-label="Future Lab">
          <Image
            src="/images/logo.svg"
            alt="futurelab by NAZZAR Innovation"
            width={144}
            height={30}
            priority
          />
        </a>
        <button className="hero-header-button bg-[#0B5CFF] font-medium text-white">
          {cta}
        </button>
      </div>
      <div className="hero-language" aria-label="Language">
        <span>Eng</span>
        <span className="hero-language-divider" aria-hidden="true" />
        <strong>Рус</strong>
      </div>
    </header>
  );
}
