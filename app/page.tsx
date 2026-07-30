import { normalizeLanguage } from "@/lib/mdx";
import { permanentRedirect } from "next/navigation";

interface RootPageProps {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
}

export default async function RootPage({ searchParams }: RootPageProps) {
  const params = await searchParams;
  const language = normalizeLanguage(params?.lang);

  permanentRedirect(`/${language}`);
}
