import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

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
      <body className="min-h-full flex flex-col bg-black text-white">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
