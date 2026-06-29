"use client";

import type { ProgramsContent } from "@/lib/mdx";
import { ProgramCard } from "./ProgramCard";

interface ProgramsProps {
  cards: ProgramsContent["cards"];
}

export function Programs({ cards }: ProgramsProps) {
  return (
    <section
      className="programs-section relative z-[80] -mt-[90svh] bg-black px-5 pb-24 pt-10 md:px-8 md:pb-32 md:pt-16 xl:pb-[220px] xl:pt-[92px]"
    >
      <div className="mx-auto grid max-w-[1436px] gap-8 md:grid-cols-3 md:gap-10">
        {cards.map((card) => (
          <ProgramCard key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}
