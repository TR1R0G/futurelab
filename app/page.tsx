import { Hero } from "@/components/hero/Hero";
import { Ecosystem } from "@/components/ecosystem/Ecosystem";
import { Infrastructure } from "@/components/infrastructure/Infrastructure";
import { Academy } from "@/components/academy/Academy";
import { Programs } from "@/components/programs/Programs";
import { Directions } from "@/components/directions/Directions";
import { Solutions } from "@/components/solutions/Solutions";
import { RealizedProjects } from "@/components/realized-projects/RealizedProjects";
import { CTACard } from "@/components/infrastructure/CTACard";
import { Experience } from "@/components/experience/Experience";
import { ContactBlock } from "@/components/contact/ContactBlock";
import { Footer } from "@/components/footer/Footer";
import {
  loadHeroContent,
  loadEcosystemContent,
  loadInfrastructureContent,
  loadAcademyContent,
  loadProgramsContent,
  loadDirectionsContent,
  loadSolutionsContent,
  loadRealizedProjectsContent,
} from "@/lib/mdx";

export default async function Home() {
  const [
    heroContent,
    ecosystemContent,
    infrastructureContent,
    academyContent,
    programsContent,
    directionsContent,
    solutionsContent,
    realizedProjectsContent,
  ] = await Promise.all([
    loadHeroContent(),
    loadEcosystemContent(),
    loadInfrastructureContent(),
    loadAcademyContent(),
    loadProgramsContent(),
    loadDirectionsContent(),
    loadSolutionsContent(),
    loadRealizedProjectsContent(),
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
      <Solutions
        title={solutionsContent.title}
        description={solutionsContent.description}
        cards={solutionsContent.cards}
      />
      <RealizedProjects
        title={realizedProjectsContent.title}
        projects={realizedProjectsContent.projects}
      />
      <section className="bg-black px-0 pb-28 pt-24 md:pb-36 md:pt-32 lg:pb-40 lg:pt-[200px]">
        <CTACard
          variant="project"
          text="Обсудим и предложим решение под Ваш проект"
          buttonText="Обсудить проект"
        />
      </section>
      <Experience />
      <ContactBlock />
      <Footer />
    </main>
  );
}
