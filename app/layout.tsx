import type { Metadata, Viewport } from "next";
import { Golos_Text, Onest } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { PageLoadGate } from "@/components/providers/PageLoadGate";
import { SoundProvider } from "@/components/providers/SoundProvider";

const golosText = Golos_Text({
  variable: "--font-golos-text",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const sansation = localFont({
  variable: "--font-sansation",
  src: [
    {
      path: "./fonts/sansation-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sansation-700.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
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
          <SoundProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </SoundProvider>
        </PageLoadGate>
      </body>
    </html>
  );
}
