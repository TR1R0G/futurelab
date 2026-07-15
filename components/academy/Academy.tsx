"use client";

import type { AcademyContent, ProgramsContent } from "@/lib/mdx";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { useEffect, useRef } from "react";
import { ProgramCard } from "@/components/programs/ProgramCard";

interface AcademyProps {
  title: string;
  subtitle: string;
  cards: AcademyContent["cards"];
  programCards: ProgramsContent["cards"];
}

const cardStyles = [
  {
    color: "#FFCC40",
    x: "-220px",
    y: "18px",
    rotate: "-19deg",
    zIndex: 6,
  },
  {
    color: "#FFD240",
    x: "-142px",
    y: "8px",
    rotate: "12.42deg",
    zIndex: 5,
  },
  {
    color: "#FFE240",
    x: "-29px",
    y: "26px",
    rotate: "-0.53deg",
    zIndex: 4,
  },
  {
    color: "#FFFF40",
    x: "39px",
    y: "13px",
    rotate: "-11.81deg",
    zIndex: 3,
  },
  {
    color: "#FFFF19",
    x: "127px",
    y: "8px",
    rotate: "-8.17deg",
    zIndex: 1,
  },
  {
    color: "#DCFF40",
    x: "213px",
    y: "30px",
    rotate: "24.31deg",
    zIndex: 0,
  },
] as const;

export function Academy({ title, subtitle, cards, programCards }: AcademyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    const ctx = gsap.context(() => {
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
      const cardElements = gsap.utils.toArray<HTMLElement>(".academy-card");
      const programsStage = section.querySelector<HTMLElement>(
        ".academy-programs-stage"
      );
      const lastCardIndex = cardShells.length - 1;
      const lastCardExitStart = lastCardIndex * 1.16 + 0.54;
      const cardExitDuration = 0.82;

      gsap.set(cardShells, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        opacity: 1,
        rotate: 0,
      });
      if (programsStage) {
        gsap.set(programsStage, {
          opacity: 1,
          visibility: "hidden",
          y: () => window.innerHeight * 0.42,
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
        const cardElement = cardElements[index];
        const exitRotate = [-8, 7, -5, 6, -7][index] ?? -6;
        const raiseAt =
          index === 0
            ? 0
            : (index - 1) * 1.16 + 0.54 + cardExitDuration + 0.01;

        cardsTimeline.set(cardShell, { zIndex: 100 + index }, raiseAt);

        cardsTimeline.to(
          cardElement,
          {
            x: 0,
            y: 0,
            rotate: 0,
            duration: 0.32,
            ease: "power2.out",
          },
          index * 1.16
        );

        cardsTimeline.to(
          cardShell,
          {
            y: () => -window.innerHeight * 1.18 - index * 36,
            x: 0,
            duration: cardExitDuration,
          },
          index * 1.16 + 0.54
        );

        cardsTimeline.to(
          cardElement,
          {
            rotate: exitRotate,
            duration: cardExitDuration,
          },
          index * 1.16 + 0.54
        );

        cardsTimeline.set(
          cardShell,
          {
            autoAlpha: 0,
          },
          index * 1.16 + 0.54 + cardExitDuration
        );
      });

      if (programsStage) {
        cardsTimeline.set(
          programsStage,
          {
            visibility: "visible",
          },
          lastCardExitStart + cardExitDuration + 0.04
        );

        cardsTimeline.to(
          programsStage,
          {
            y: 0,
            duration: 1.28,
            ease: "power2.out",
          },
          lastCardExitStart + cardExitDuration + 0.04
        );
      }
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="academy-section relative z-[200] min-h-[560svh] bg-black"
    >
      <div
        ref={pinRef}
        className="academy-pin sticky top-0 z-[210] box-border flex h-[100svh] flex-col justify-start overflow-visible bg-black pb-16 pt-0 md:pb-20 lg:pb-24"
      >
        <div className="academy-heading relative z-[600] mx-auto w-full max-w-[1436px] px-5 md:px-8 xl:px-0">
          <h2 className="font-heading max-w-[805px] text-[42px] font-bold leading-none tracking-normal text-white md:text-6xl lg:text-[65px]">
            {title}
          </h2>
          <p className="mt-10 max-w-[845px] text-xl font-medium leading-[1.2] text-[#C4C4C4] md:text-2xl lg:mt-[37px] lg:text-[25px]">
            {subtitle}
          </p>
        </div>

        <div
          className="academy-card-stage relative z-[700] mx-auto mt-8 h-[440px] w-full max-w-[980px] scale-[0.52] sm:scale-75 md:mt-16 md:h-[520px] md:scale-90 lg:mt-24 lg:scale-100"
          aria-label="Преимущества академии и акселерации"
        >
          {cards.map((card, index) => {
            const style = cardStyles[index % cardStyles.length];

            return (
              <div
                key={card.title}
                className="academy-card-shell absolute left-1/2 top-1/2 h-[280px] w-[280px] will-change-transform"
                style={{
                  zIndex: style.zIndex,
                }}
              >
                <article
                  className="academy-card flex h-full w-full items-center justify-center rounded-[35px] px-[29px] text-center shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
                  style={{
                    backgroundColor: style.color,
                    transform: `translate(${style.x}, ${style.y}) rotate(${style.rotate})`,
                  }}
                >
                  <h3 className="max-w-[221px] text-[25px] font-semibold leading-normal tracking-normal text-black">
                    {card.title}
                  </h3>
                </article>
              </div>
            );
          })}
        </div>

        <div
          className="academy-programs-stage pointer-events-auto absolute left-1/2 z-[800] w-full max-w-[1436px] -translate-x-1/2 px-5 md:px-8 xl:px-0"
          style={{ visibility: "hidden" }}
        >
          <div className="academy-programs-scale">
            <div className="programs-grid mx-auto grid max-w-[1436px] gap-8 md:grid-cols-3 md:gap-10">
              {programCards.map((card) => (
                <ProgramCard key={card.title} card={card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
