import { Hero } from "@/components/hero/Hero";
import { Ecosystem } from "@/components/ecosystem/Ecosystem";
import { Infrastructure } from "@/components/infrastructure/Infrastructure";
import { Academy } from "@/components/academy/Academy";
import { Programs } from "@/components/programs/Programs";
import { Directions } from "@/components/directions/Directions";
import {
  loadHeroContent,
  loadEcosystemContent,
  loadInfrastructureContent,
  loadAcademyContent,
  loadProgramsContent,
  loadDirectionsContent,
} from "@/lib/mdx";

export default async function Home() {
  const [
    heroContent,
    ecosystemContent,
    infrastructureContent,
    academyContent,
    programsContent,
    directionsContent,
  ] = await Promise.all([
    loadHeroContent(),
    loadEcosystemContent(),
    loadInfrastructureContent(),
    loadAcademyContent(),
    loadProgramsContent(),
    loadDirectionsContent(),
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
      <Academy
        title={academyContent.title}
        subtitle={academyContent.subtitle}
        cards={academyContent.cards}
      />
      <Programs cards={programsContent.cards} />
      <Directions
        title={directionsContent.title}
        chips={directionsContent.chips}
        statement={directionsContent.statement}
      />
    </main>
  );
}
