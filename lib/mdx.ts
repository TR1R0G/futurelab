import { compileMDX } from "next-mdx-remote/rsc";
import fs from "fs/promises";
import path from "path";

export interface HeroContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  imageAlt: string;
}

export interface EcosystemCard {
  icon: string;
  title: string;
  description: string;
}

export interface EcosystemContent {
  title: string;
  subtitle: string;
  cards: EcosystemCard[];
}

export async function loadHeroContent(): Promise<HeroContent> {
  const filePath = path.join(process.cwd(), "content", "hero.mdx");
  const source = await fs.readFile(filePath, "utf-8");

  const { frontmatter } = await compileMDX<HeroContent>({
    source,
    options: { parseFrontmatter: true },
  });

  return frontmatter;
}

export async function loadEcosystemContent(): Promise<EcosystemContent> {
  const filePath = path.join(process.cwd(), "content", "ecosystem.mdx");
  const source = await fs.readFile(filePath, "utf-8");

  const { frontmatter } = await compileMDX<EcosystemContent>({
    source,
    options: { parseFrontmatter: true },
  });

  return frontmatter;
}
