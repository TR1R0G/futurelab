import type { Metadata, Viewport } from "next";
import { Golos_Text, Onest, Sansation } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { PageLoadGate } from "@/components/providers/PageLoadGate";

const golosText = Golos_Text({
  variable: "--font-golos-text",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const sansation = Sansation({
  variable: "--font-sansation",
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  adjustFontFallback: false,
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Future Lab — Студия цифровых технологий",
  description:
    "Пространство, где развиваются специалисты, создаются проекты и внедряются цифровые решения.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${golosText.variable} ${sansation.variable} ${onest.variable} h-full antialiased dark`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/optimized/office.webp"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black font-sans text-white">
        <PageLoadGate>
          <SmoothScroll>{children}</SmoothScroll>
        </PageLoadGate>
      </body>
    </html>
  );
}
