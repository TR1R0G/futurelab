import { Hero } from "@/components/hero/Hero";
import { loadHeroContent } from "@/lib/mdx";

export default async function Home() {
  const content = await loadHeroContent();

  return (
    <main className="flex-1">
      <Hero
        title={content.title}
        description={content.description}
        primaryCta={content.primaryCta}
        secondaryCta={content.secondaryCta}
        imageAlt={content.imageAlt}
      />
    </main>
  );
}
