import { Hero } from "@/components/hero/Hero";
import { Ecosystem } from "@/components/ecosystem/Ecosystem";
import { Infrastructure } from "@/components/infrastructure/Infrastructure";
import {
  loadHeroContent,
  loadEcosystemContent,
  loadInfrastructureContent,
} from "@/lib/mdx";

export default async function Home() {
  const [heroContent, ecosystemContent, infrastructureContent] =
    await Promise.all([
      loadHeroContent(),
      loadEcosystemContent(),
      loadInfrastructureContent(),
    ]);

  return (
    <main className="flex-1">
      <Hero
        title={heroContent.title}
        description={heroContent.description}
        primaryCta={heroContent.primaryCta}
        secondaryCta={heroContent.secondaryCta}
        imageAlt={heroContent.imageAlt}
      />
      <Ecosystem
        title={ecosystemContent.title}
        subtitle={ecosystemContent.subtitle}
        cards={ecosystemContent.cards}
      />
      <Infrastructure
        title={infrastructureContent.title}
        subtitle={infrastructureContent.subtitle}
        ctaText={infrastructureContent.ctaText}
        ctaButton={infrastructureContent.ctaButton}
        cards={infrastructureContent.cards}
      />
    </main>
  );
}
