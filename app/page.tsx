import { Hero } from "@/components/hero/Hero";
import type { Metadata } from "next";
import { Ecosystem } from "@/components/ecosystem/Ecosystem";
import { Infrastructure } from "@/components/infrastructure/Infrastructure";
import { Academy } from "@/components/academy/Academy";
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
  normalizeLanguage,
} from "@/lib/mdx";
import { seoCopy, uiCopy } from "@/lib/i18n";

interface HomeProps {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
}

export async function generateMetadata({
  searchParams,
}: HomeProps): Promise<Metadata> {
  const params = await searchParams;
  const language = normalizeLanguage(params?.lang);
  const seo = seoCopy[language];

  return {
    title: seo.title,
    description: seo.description ?? null,
    keywords: seo.keywords,
    alternates: seo.canonical
      ? {
          canonical: seo.canonical,
        }
      : undefined,
    openGraph: seo.openGraph
      ? {
          title: seo.openGraph.title,
          description: seo.openGraph.description,
          url: seo.canonical,
          type: "website",
          locale: "ru_RU",
        }
      : undefined,
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const language = normalizeLanguage(params?.lang);
  const copy = uiCopy[language];

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
    loadHeroContent(language),
    loadEcosystemContent(language),
    loadInfrastructureContent(language),
    loadAcademyContent(language),
    loadProgramsContent(language),
    loadDirectionsContent(language),
    loadSolutionsContent(language),
    loadRealizedProjectsContent(language),
  ]);

  return (
    <main className="flex-1" lang={language}>
      <Hero
        title={heroContent.title}
        description={heroContent.description}
        primaryCta={heroContent.primaryCta}
        secondaryCta={heroContent.secondaryCta}
        projectsCta={heroContent.projectsCta}
        headerCta={heroContent.headerCta}
        imageAlt={heroContent.imageAlt}
        language={language}
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
        galleryAlts={infrastructureContent.galleryAlts}
        cards={infrastructureContent.cards}
      />
      <Academy
        title={academyContent.title}
        subtitle={academyContent.subtitle}
        cards={academyContent.cards}
        programCards={programsContent.cards}
      />
      <Directions
        title={directionsContent.title}
        chips={directionsContent.chips}
        statement={directionsContent.statement}
        ctaText={copy.directionsCta.text}
        ctaButton={copy.directionsCta.buttonText}
        language={language}
      />
      <Solutions
        id='solutions'
        title={solutionsContent.title}
        description={solutionsContent.description}
        cards={solutionsContent.cards}
        language={language}
      />
      <RealizedProjects
        id='cases'
        title={realizedProjectsContent.title}
        projects={realizedProjectsContent.projects}
      />
      <section className="bg-black px-0 pb-28 pt-24 md:pb-36 md:pt-32 lg:pb-40 lg:pt-[200px]">
        <CTACard
          variant="project"
          text={copy.projectCta.text}
          buttonText={copy.projectCta.buttonText}
          href="#contacts"
        />
      </section>
      <Experience {...copy.experience} />
      <ContactBlock {...copy.contact} />
      <Footer address={copy.footer.address} />
    </main>
  );
}
