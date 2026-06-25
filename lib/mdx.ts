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

export async function loadInfrastructureContent(): Promise<InfrastructureContent> {
  const filePath = path.join(process.cwd(), "content", "infrastructure.mdx");
  const source = await fs.readFile(filePath, "utf-8");

  const { frontmatter } = await compileMDX<InfrastructureContent>({
    source,
    options: { parseFrontmatter: true },
  });

  return frontmatter;
}

export interface AcademyCard {
  title: string;
}

export interface AcademyContent {
  title: string;
  subtitle: string;
  cards: AcademyCard[];
}

export async function loadAcademyContent(): Promise<AcademyContent> {
  const filePath = path.join(process.cwd(), "content", "academy.mdx");
  const source = await fs.readFile(filePath, "utf-8");

  const { frontmatter } = await compileMDX<AcademyContent>({
    source,
    options: { parseFrontmatter: true },
  });

  return frontmatter;
}

export interface ProgramCard {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  audience: string;
  age: string;
  cta: string;
}

export interface ProgramsContent {
  cards: ProgramCard[];
}

export async function loadProgramsContent(): Promise<ProgramsContent> {
  const filePath = path.join(process.cwd(), "content", "programs.mdx");
  const source = await fs.readFile(filePath, "utf-8");

  const { frontmatter } = await compileMDX<ProgramsContent>({
    source,
    options: { parseFrontmatter: true },
  });

  return frontmatter;
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

export async function loadDirectionsContent(): Promise<DirectionsContent> {
  const filePath = path.join(process.cwd(), "content", "directions.mdx");
  const source = await fs.readFile(filePath, "utf-8");

  const { frontmatter } = await compileMDX<DirectionsContent>({
    source,
    options: { parseFrontmatter: true },
  });

  return frontmatter;
}

export interface SolutionsContent {
  title: string;
  description: string;
  card: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    cta: string;
  };
}

export async function loadSolutionsContent(): Promise<SolutionsContent> {
  const filePath = path.join(process.cwd(), "content", "solutions.mdx");
  const source = await fs.readFile(filePath, "utf-8");

  const { frontmatter } = await compileMDX<SolutionsContent>({
    source,
    options: { parseFrontmatter: true },
  });

  return frontmatter;
}
