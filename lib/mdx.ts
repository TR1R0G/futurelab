import { compileMDX } from "next-mdx-remote/rsc";
import fs from "fs/promises";
import path from "path";

export type Language = "ru" | "en";

export function normalizeLanguage(value?: string | string[] | null): Language {
  const language = Array.isArray(value) ? value[0] : value;
  return language === "en" ? "en" : "ru";
}

async function loadFrontmatter<T>(fileName: string, language: Language): Promise<T> {
  const localizedPath = path.join(process.cwd(), "content", language, fileName);
  const defaultPath = path.join(process.cwd(), "content", fileName);

  const source = await fs.readFile(language === "ru" ? defaultPath : localizedPath, "utf-8");

  const { frontmatter } = await compileMDX<T>({
    source,
    options: { parseFrontmatter: true },
  });

  return frontmatter;
}

export interface HeroContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  headerCta: string;
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

export async function loadHeroContent(language: Language = "ru"): Promise<HeroContent> {
  return loadFrontmatter<HeroContent>("hero.mdx", language);
}

export async function loadEcosystemContent(language: Language = "ru"): Promise<EcosystemContent> {
  return loadFrontmatter<EcosystemContent>("ecosystem.mdx", language);
}

export interface InfrastructureCard {
  icon: string;
  title: string;
  description: string;
}

export interface InfrastructureContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaButton: string;
  cards: InfrastructureCard[];
}

export async function loadInfrastructureContent(language: Language = "ru"): Promise<InfrastructureContent> {
  return loadFrontmatter<InfrastructureContent>("infrastructure.mdx", language);
}

export interface AcademyCard {
  title: string;
}

export interface AcademyContent {
  title: string;
  subtitle: string;
  cards: AcademyCard[];
}

export async function loadAcademyContent(language: Language = "ru"): Promise<AcademyContent> {
  return loadFrontmatter<AcademyContent>("academy.mdx", language);
}

export interface ProgramCard {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  audience: string;
  age: string;
  cta: string;
  ctaHref?: string;
}

export interface ProgramsContent {
  cards: ProgramCard[];
}

export async function loadProgramsContent(language: Language = "ru"): Promise<ProgramsContent> {
  return loadFrontmatter<ProgramsContent>("programs.mdx", language);
}

export interface DirectionChip {
  label: string;
  variant: "gradient" | "light" | "outline";
}

export interface DirectionsContent {
  title: string;
  chips: DirectionChip[];
  statement: {
    linesBeforeImage: string[];
    imageAlt: string;
    imageSrc: string;
    imageLead: string;
    imageTail: string;
    linesAfterImage: string[];
  };
}

export async function loadDirectionsContent(language: Language = "ru"): Promise<DirectionsContent> {
  return loadFrontmatter<DirectionsContent>("directions.mdx", language);
}

export interface SolutionsContent {
  title: string;
  description: string;
  cards: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    cta: string;
    href?: string;
    youtubeVideoId?: string;
  }[];
}

export async function loadSolutionsContent(language: Language = "ru"): Promise<SolutionsContent> {
  return loadFrontmatter<SolutionsContent>("solutions.mdx", language);
}

export interface RealizedProject {
  title: string;
  description: string;
  image?: string;
  imageAlt: string;
  video?: string;
}

export interface RealizedProjectsContent {
  title: string;
  projects: RealizedProject[];
}

export async function loadRealizedProjectsContent(language: Language = "ru"): Promise<RealizedProjectsContent> {
  return loadFrontmatter<RealizedProjectsContent>("realized-projects.mdx", language);
}
