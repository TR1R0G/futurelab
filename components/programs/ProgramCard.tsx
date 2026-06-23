import type { ProgramCard as ProgramCardType } from "@/lib/mdx";
import Image from "next/image";

interface ProgramCardProps {
  card: ProgramCardType;
}

export function ProgramCard({ card }: ProgramCardProps) {
  return (
    <article className="program-card overflow-hidden rounded-[34px] bg-[#FCFF00] text-black shadow-[0_18px_60px_rgba(0,0,0,0.2)] md:rounded-[40px]">
      <div className="relative aspect-square overflow-hidden rounded-t-[34px] bg-[#8F08C5] md:rounded-t-[40px]">
        <Image
          src={card.image}
          alt={card.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 454px"
        />
      </div>

      <div className="rounded-b-[30px] bg-[#1F1F1F] px-8 pb-10 pt-10 md:h-[258px] md:px-10 md:pt-12 lg:px-12">
        <h3 className="max-w-[330px] text-[31px] font-black leading-[1.08] tracking-[-0.03em] text-[#FCFF00] md:text-[34px] lg:text-[38px]">
          {card.title}
        </h3>
        <p className="mt-8 max-w-[370px] text-[21px] font-bold leading-[1.14] tracking-[-0.02em] text-[#BDBDBD] md:text-[23px] lg:text-[24px]">
          {card.description}
        </p>
      </div>

      <div className="flex flex-col justify-between px-8 pb-10 pt-9 md:h-[226px] md:px-10 lg:px-12">
        <div className="space-y-4 text-[20px] font-bold leading-none tracking-[-0.02em] md:text-[23px] lg:text-[25px]">
          <p>{card.audience}</p>
          <p>{card.age}</p>
        </div>

        <button
          type="button"
          className="mt-10 flex h-[58px] w-full items-center justify-center rounded-[12px] bg-[#1F1F1F] px-5 text-center text-[20px] font-bold leading-none tracking-[-0.02em] text-white transition-transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.99] md:text-[21px] lg:text-[23px]"
        >
          {card.cta}
        </button>
      </div>
    </article>
  );
}
