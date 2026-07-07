"use client";

import type { InfrastructureCard as InfrastructureCardType } from "@/lib/mdx";
import { ZonesIcon, InteractionIcon, LabsIcon } from "./InfrastructureIcons";

interface InfrastructureCardProps {
  card: InfrastructureCardType;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zones: ZonesIcon,
  interaction: InteractionIcon,
  labs: LabsIcon,
};

export function InfrastructureCard({ card }: InfrastructureCardProps) {
  const Icon = iconMap[card.icon] ?? ZonesIcon;

  return (
    <article className="infrastructure-card relative flex min-h-[360px] flex-col rounded-[28px] bg-[#F2F2F5] p-7 md:min-h-[400px] md:p-7 lg:aspect-[452/636] lg:min-h-0 lg:rounded-[32px] lg:p-9">
      <h3 className="w-[calc(66.666667%+37.333px)] text-[26px] font-semibold leading-[1.15] text-[#A91FC3] md:text-[28px] lg:w-[calc(66.666667%+48px)] lg:text-[33px]">
        {card.title}
      </h3>
      <p className="mt-5 w-[calc(80%+44.8px)] text-[18px] font-medium leading-[1.24] text-[#202024] md:text-[20px] lg:w-[calc(80%+57.6px)] lg:text-[23px]">
        {card.description}
      </p>
      <div className="mt-auto flex justify-end pt-8">
        <Icon className="h-[62px] w-[62px] lg:h-[72px] lg:w-[72px]" />
      </div>
    </article>
  );
}
