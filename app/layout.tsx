import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { PageLoadGate } from "@/components/providers/PageLoadGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Future Lab — Студия цифровых технологий",
  description:
    "Пространство, где развиваются специалисты, создаются проекты и внедряются цифровые решения.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} h-full antialiased dark`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/optimized/office.webp"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        <PageLoadGate>
          <SmoothScroll>{children}</SmoothScroll>
        </PageLoadGate>
      </body>
    </html>
  );
}
