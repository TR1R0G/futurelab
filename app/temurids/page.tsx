import { normalizeLanguage } from "@/lib/mdx";

interface TemuridsPageProps {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
}

const TEMURIDS_PDF_SRC =
  "/documents/temurids/Интерактивная_музейная_экспозиция_Эпоха_Темуридов_2_для_сайта.pdf";

export default async function TemuridsPage({ searchParams }: TemuridsPageProps) {
  const params = await searchParams;
  const language = normalizeLanguage(params?.lang);
  const backHref = `/?lang=${language}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="flex h-20 items-center justify-between px-5 md:px-8">
        <a
          href={backHref}
          className="text-[18px] font-medium text-white/80 transition-colors hover:text-white"
        >
          FutureLab
        </a>
        <a
          href={TEMURIDS_PDF_SRC}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[13px] bg-[#0B5CFF] px-6 py-3 text-[16px] font-medium text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {language === "en" ? "Download PDF" : "Скачать PDF"}
        </a>
      </header>

      <iframe
        data-temurids-pdf
        src={TEMURIDS_PDF_SRC}
        title={
          language === "en"
            ? "Timurid Era project PDF"
            : "PDF проекта «Эпоха Темуридов»"
        }
        className="h-[calc(100vh-80px)] w-full border-0 bg-[#1D1D1D]"
      />
    </main>
  );
}
