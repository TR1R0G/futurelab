"use client";

import type { AcademyContent } from "@/lib/mdx";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { useEffect, useRef } from "react";

interface AcademyProps {
  title: string;
  subtitle: string;
  cards: AcademyContent["cards"];
}

const cardStyles = [
  {
    color: "#FFD13D",
    x: "-230px",
    y: "18px",
    rotate: "-17deg",
    zIndex: 5,
  },
  {
    color: "#FFD643",
    x: "-95px",
    y: "8px",
    rotate: "12deg",
    zIndex: 4,
  },
  {
    color: "#FFE93A",
    x: "35px",
    y: "26px",
    rotate: "0deg",
    zIndex: 3,
  },
  {
    color: "#FCFF19",
    x: "165px",
    y: "13px",
    rotate: "-8deg",
    zIndex: 2,
  },
  {
    color: "#DFFF2D",
    x: "300px",
    y: "30px",
    rotate: "22deg",
    zIndex: 1,
  },
] as const;

export function Academy({ title, subtitle, cards }: AcademyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const section = sectionRef.current;
    const pin = pinRef.current;
    const programsSection = document.querySelector<HTMLElement>(
      ".programs-section"
    );
    if (!section || !pin) return;

    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".academy-heading > *", {
          y: 46,
          opacity: 0,
          duration: 0.85,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });

        const cardShells = gsap.utils.toArray<HTMLElement>(
          ".academy-card-shell"
        );
        const lastCardIndex = cardShells.length - 1;
        const lastCardExitStart = lastCardIndex * 1.16 + 0.54;

        gsap.set(cardShells, { y: 0, opacity: 1, rotate: 0 });
        if (programsSection) {
          gsap.set(programsSection, {
            y: () => window.innerHeight * 0.6,
            willChange: "transform",
          });
        }

        const cardsTimeline = gsap.timeline({
          defaults: { ease: "power2.in" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        cardShells.forEach((cardShell, index) => {
          const style = cardStyles[index % cardStyles.length];
          const focusedX = -parseFloat(style.x);
          const focusedRotate = -parseFloat(style.rotate);

          cardsTimeline.set(cardShell, { zIndex: 100 + index }, index * 1.16);

          cardsTimeline.to(
            cardShell,
            {
              x: focusedX,
              rotate: focusedRotate,
              duration: 0.32,
              ease: "power2.out",
            },
            index * 1.16
          );

          cardsTimeline.to(
            cardShell,
            {
              y: () => -window.innerHeight * 1.18 - index * 36,
              x: () => focusedX + (index - 2) * -28,
              rotate: () => focusedRotate + ([-8, 7, -5, 6, -7][index] ?? -6),
              duration: 0.82,
            },
            index * 1.16 + 0.54
          );
        });

        if (programsSection) {
          cardsTimeline.to(
            programsSection,
            {
              y: () => window.innerHeight * 0.28,
              duration: 1.82,
            },
            lastCardExitStart - 1.1
          );
        }
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
      className="academy-section relative min-h-[560svh] bg-black"
    >
      <div
        ref={pinRef}
        className="academy-pin sticky top-0 z-40 flex min-h-[100svh] flex-col justify-center overflow-visible py-16 md:py-20 lg:py-24"
      >
        <div className="academy-heading relative z-[500] mx-auto w-full max-w-[1436px] px-5 md:px-8">
          <h2 className="max-w-[980px] text-[42px] font-bold leading-[1.06] tracking-[-0.02em] text-white md:text-6xl lg:text-[72px]">
            {title}
          </h2>
          <p className="mt-10 max-w-[1040px] text-xl font-semibold leading-[1.23] text-[#A6A6A6] md:text-2xl lg:mt-20 lg:text-[31px]">
            {subtitle}
          </p>
        </div>

        <div
          className="academy-card-stage relative mx-auto mt-8 h-[440px] w-full max-w-[980px] scale-[0.52] sm:scale-75 md:mt-16 md:h-[520px] md:scale-90 lg:mt-24 lg:scale-100"
          aria-label="Преимущества академии и акселерации"
        >
          {cards.map((card, index) => {
            const style = cardStyles[index % cardStyles.length];

            return (
              <div
                key={card.title}
                className="academy-card-shell absolute left-1/2 top-1/2 will-change-transform"
                style={{
                  zIndex: style.zIndex,
                }}
              >
                <article
                  className="academy-card flex h-[330px] w-[300px] items-center justify-center rounded-[34px] px-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
                  style={{
                    backgroundColor: style.color,
                    transform: `translate(calc(-50% + ${style.x}), calc(-50% + ${style.y})) rotate(${style.rotate})`,
                  }}
                >
                  <h3 className="max-w-[245px] text-[27px] font-black leading-[1.1] tracking-[-0.03em] text-black md:text-[30px]">
                    {card.title}
                  </h3>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
