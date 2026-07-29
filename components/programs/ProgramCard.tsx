import type { ProgramCard as ProgramCardType } from "@/lib/mdx";
import Image from "next/image";

interface ProgramCardProps {
  card: ProgramCardType;
}

const ctaClassName =
  "program-card-cta flex min-h-[55px] w-full items-center justify-center rounded-[13px] bg-[#1D1D1D] px-5 text-center text-[20px] font-medium leading-[26px] tracking-normal text-white transition-transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.99] md:text-[22px]";

export function ProgramCard({ card }: ProgramCardProps) {
  const isExternalCta = card.ctaHref?.startsWith("http");

  return (
    <article className="program-card flex flex-col rounded-[34px] bg-[#FFFF19] text-black shadow-[0_18px_60px_rgba(0,0,0,0.2)] md:rounded-[35px]">
      <div className="program-card-body flex flex-1 flex-col bg-[#1D1D1D] md:rounded-[35px]">
        <div className="program-card-media relative aspect-square flex-none overflow-hidden rounded-[34px] bg-[#8F08C5] md:rounded-[35px]">
          <Image
            src={card.image}
            alt={card.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 452px"
          />
        </div>

        <div className="program-card-copy program-card-content flex flex-1 flex-col px-8 pb-10 pt-10 md:px-10 md:pt-10">
          <h3 className="program-card-title project-mini-heading max-w-[330px] text-[31px] font-semibold leading-[1.08] tracking-normal text-[#FFFF19] md:text-[33px] md:leading-[40px]">
            {card.title}
          </h3>
          <p className="program-card-description max-w-[370px] text-[21px] font-medium leading-[1.18] tracking-normal text-[#C4C4C4] md:text-[22px] md:leading-[26px]">
            {card.description}
          </p>
        </div>
      </div>

      <div className="program-card-footer flex flex-none flex-col px-8 pb-10 pt-9 md:px-10">
        <div className="program-card-meta space-y-[13px] text-[20px] font-medium leading-[26px] tracking-normal text-[#1D1D1D] md:text-[22px]">
          <p>{card.audience}</p>
          <p>{card.age}</p>
        </div>

        <div className="program-card-action w-full">
          {card.ctaHref ? (
            <a
              href={card.ctaHref}
              className={ctaClassName}
              target={isExternalCta ? "_blank" : undefined}
              rel={isExternalCta ? "noopener noreferrer" : undefined}
            >
              {card.cta}
            </a>
          ) : (
            <button type="button" className={ctaClassName}>
              {card.cta}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
