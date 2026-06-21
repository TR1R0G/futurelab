import { Hero } from "@/components/hero/Hero";
import { Ecosystem } from "@/components/ecosystem/Ecosystem";
import { loadHeroContent, loadEcosystemContent } from "@/lib/mdx";

export default async function Home() {
  const heroContent = await loadHeroContent();
  const ecosystemContent = await loadEcosystemContent();

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
    </main>
  );
}
