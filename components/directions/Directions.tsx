"use client";

import type { DirectionsContent } from "@/lib/mdx";
import { ExpandedImageScreen } from "@/components/media/ExpandedImageScreen";
import { CTACard } from "@/components/infrastructure/CTACard";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface DirectionsProps {
  title: string;
  chips: DirectionsContent["chips"];
  statement: DirectionsContent["statement"];
}

const chipLayout = [
  "left-[592px] top-[236px] w-[174px] rotate-[-27.71deg]",
  "left-[755px] top-[301px] w-[249px] rotate-0",
  "left-[836px] top-[166px] w-[450px] rotate-[-7.33deg]",
  "left-[1004px] top-[209px] w-[425px] rotate-[-15.1deg]",
  "left-[1127px] top-[60px] w-[277px] rotate-[14.17deg]",
];

export function Directions({ title, chips, statement }: DirectionsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".directions-statement-line", {
          y: 52,
          opacity: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".directions-statement",
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
      className="directions-section relative z-[70] isolate overflow-visible bg-black px-5 pb-28 pt-20 md:px-8 md:pb-36 md:pt-24 lg:pb-44 lg:pt-20"
    >
      <div className="directions-board relative mx-auto h-auto max-w-[1436px] md:h-[398px]">
        <div
          className="pointer-events-none absolute left-0 top-[7px] hidden h-[391px] w-full rounded-[35px] bg-[linear-gradient(65.17deg,#4B0E5B_-2.47%,#A91E83_18.71%,#FD9A34_44.05%,#F9EB44_68.37%)] md:block"
          aria-hidden="true"
        />
        <div className="relative min-h-[420px] overflow-hidden rounded-[35px] bg-[#1D1D1D] p-8 md:h-[391px] md:min-h-0 md:p-0">
          <h2 className="directions-board-title relative z-10 text-[30px] font-semibold leading-none text-white md:absolute md:left-10 md:top-10 md:text-[33px] md:leading-10">
            {title}
          </h2>

          <div className="mt-12 flex flex-wrap gap-4 md:hidden">
            {chips.map((chip) => (
              <DirectionChip key={chip.label} chip={chip} />
            ))}
          </div>

          <div className="hidden md:block">
            {chips.map((chip, index) => (
              <div
                key={chip.label}
                className={`absolute h-[73px] ${chipLayout[index]}`}
              >
                <DirectionChip chip={chip} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="directions-statement sticky top-[12svh] mx-auto mt-32 max-w-[1420px] text-center md:mt-44 lg:mt-52">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_48%,rgba(254,158,52,0.58),transparent_34%),radial-gradient(circle_at_53%_43%,rgba(177,58,202,0.58),transparent_36%),radial-gradient(circle_at_66%_35%,rgba(42,143,255,0.42),transparent_36%)] blur-[90px]"
          aria-hidden="true"
        />

        <div className="directions-statement-copy relative z-10 text-[32px] font-black leading-[1.48] tracking-[-0.03em] text-white md:text-[44px] lg:text-[52px]">
          {statement.linesBeforeImage.map((line) => (
            <p key={line} className="directions-statement-line">
              {line}
            </p>
          ))}

          <p className="directions-statement-line">
            {statement.imageLead}
            <span className="directions-inline-image mx-5 inline-flex translate-y-[0.18em] overflow-hidden rounded-[12px] align-baseline shadow-[0_10px_34px_rgba(0,0,0,0.45)] md:mx-7">
              <Image
                src={statement.imageSrc}
                alt={statement.imageAlt}
                width={58}
                height={88}
                className="h-[58px] w-[38px] object-cover md:h-[78px] md:w-[52px] lg:h-[88px] lg:w-[58px]"
              />
            </span>
            {statement.imageTail}
          </p>

          {statement.linesAfterImage.map((line) => (
            <p key={line} className="directions-statement-line">
              {line}
            </p>
          ))}
        </div>
      </div>

      <ExpandedImageScreen
        src={statement.imageSrc}
        alt={statement.imageAlt}
        className="-mt-[58svh]"
        movingTextSelector=".directions-statement-copy"
        sourceSelector=".directions-inline-image"
      />

      <div className="directions-post-image relative z-[100] flex min-h-[100svh] flex-col justify-center bg-black pb-28 pt-28 md:pb-36 md:pt-36 lg:pb-44 lg:pt-44">
        <CTACard
          variant="wide"
          text="Начните путь в цифровой профессии через реальные проекты"
          buttonText="Начать обучение"
        />

        <div
          className="mx-auto mt-28 h-1 w-[calc(100%_-_40px)] max-w-[1436px] rounded-sm bg-[linear-gradient(90deg,#4B0E5B_0%,#A91E83_29.9%,#FD9A34_65.67%,#F9EB44_100%)] md:mt-36 md:w-[calc(100%_-_64px)] lg:mt-44"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

function DirectionChip({
  chip,
}: {
  chip: DirectionsContent["chips"][number];
}) {
  const baseClass =
    "directions-chip flex h-[58px] w-full items-center justify-center rounded-full px-7 text-center text-[20px] font-medium leading-[1.7] md:h-[73px] md:rounded-[36.5px] md:text-[23px]";

  if (chip.variant === "gradient") {
    return (
      <div
        className={`${baseClass} bg-[linear-gradient(104deg,#A91E83_0%,#FD9A34_55%,#F9EB44_100%)] text-black`}
      >
        {chip.label}
      </div>
    );
  }

  if (chip.variant === "outline") {
    return (
      <div
        className={`${baseClass} border-2 border-white/80 bg-transparent text-white`}
      >
        {chip.label}
      </div>
    );
  }

  return (
    <div className={`${baseClass} bg-[#F2F3F7] text-[#4C4C4C]`}>
      {chip.label}
    </div>
  );
}
