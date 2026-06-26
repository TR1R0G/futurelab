import type { ProgramCard as ProgramCardType } from "@/lib/mdx";
import Image from "next/image";

interface ProgramCardProps {
  card: ProgramCardType;
}

export function ProgramCard({ card }: ProgramCardProps) {
  return (
    <article className="program-card relative overflow-hidden rounded-[34px] bg-[#FFFF19] text-black shadow-[0_18px_60px_rgba(0,0,0,0.2)] md:rounded-[35px] lg:h-[932px] lg:w-[452px]">
      <div
        className="pointer-events-none absolute inset-0 hidden rounded-[35px] bg-[#FFFF19] lg:block"
        aria-hidden="true"
      />

      <div className="relative z-10 bg-[#1D1D1D] md:rounded-[35px] lg:absolute lg:left-0 lg:top-0 lg:h-[692px] lg:w-full">
        <div className="relative aspect-square overflow-hidden rounded-t-[34px] bg-[#8F08C5] md:rounded-t-[35px] lg:h-[450px] lg:w-full">
          <Image
            src={card.image}
            alt={card.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 452px"
          />
        </div>

        <div className="px-8 pb-10 pt-10 md:px-10 md:pt-10 lg:p-0">
          <h3 className="max-w-[330px] text-[31px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#FFFF19] md:text-[33px] md:leading-[40px] lg:absolute lg:left-10 lg:top-[490px] lg:w-[372px]">
            {card.title}
          </h3>
          <p className="mt-8 max-w-[370px] text-[21px] font-medium leading-[1.18] tracking-[-0.01em] text-[#C4C4C4] md:text-[22px] md:leading-[26px] lg:absolute lg:left-10 lg:top-[595px] lg:mt-0 lg:w-[372px]">
            {card.description}
          </p>
        </div>
      </div>

      <div className="relative z-20 flex flex-col justify-between px-8 pb-10 pt-9 md:px-10 lg:absolute lg:left-10 lg:top-[732px] lg:h-[161px] lg:w-[372px] lg:p-0">
        <div className="space-y-[13px] text-[20px] font-medium leading-[26px] tracking-[-0.01em] text-[#1D1D1D] md:text-[22px]">
          <p>{card.audience}</p>
          <p>{card.age}</p>
        </div>

        <button
          type="button"
          className="mt-10 flex h-[55px] w-full items-center justify-center rounded-[13px] bg-[#1D1D1D] px-5 text-center text-[20px] font-medium leading-[26px] tracking-[-0.01em] text-white transition-transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.99] md:text-[22px] lg:mt-0"
        >
          {card.cta}
        </button>
      </div>
    </article>
  );
}
