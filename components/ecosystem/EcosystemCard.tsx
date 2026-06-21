"use client";

import type { EcosystemCard as EcosystemCardType } from "@/lib/mdx";
import { WorkspaceIcon, TrainingIcon, ProductsIcon } from "./EcosystemIcons";

interface EcosystemCardProps {
  card: EcosystemCardType;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  workspace: WorkspaceIcon,
  training: TrainingIcon,
  products: ProductsIcon,
};

export function EcosystemCard({ card }: EcosystemCardProps) {
  const Icon = iconMap[card.icon] ?? WorkspaceIcon;

  return (
    <div className="ecosystem-card flex shrink-0 flex-col pl-12 pr-6 md:pl-16 md:pr-8 lg:pl-20 lg:pr-12">
      <div className="ecosystem-card-icon">
        <Icon className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28" />
      </div>
      <h3 className="ecosystem-card-title mt-5 max-w-md text-xl font-bold leading-tight text-white md:mt-7 md:text-2xl lg:mt-8 lg:text-3xl">
        {card.title}
      </h3>
      <p className="ecosystem-card-description mt-3 max-w-sm text-base leading-relaxed text-white/85 md:mt-4 md:text-lg">
        {card.description}
      </p>
    </div>
  );
}
