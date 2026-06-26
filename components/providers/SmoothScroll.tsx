"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { registerGsapPlugins, gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const tickerFnRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    registerGsapPlugins();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    const refreshLayout = () => {
      requestAnimationFrame(() => {
        (lenis as { resize?: () => void }).resize?.();
        ScrollTrigger.refresh();
      });
    };

    lenis.on("scroll", ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    tickerFnRef.current = tickerFn;

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    window.addEventListener("load", refreshLayout);
    window.addEventListener("futurelab:critical-assets-ready", refreshLayout);
    window.addEventListener("futurelab:image-loaded", refreshLayout);

    if ("fonts" in document) {
      document.fonts.ready.then(refreshLayout).catch(() => undefined);
    }

    const refreshTimeout = window.setTimeout(refreshLayout, 500);

    return () => {
      window.removeEventListener("load", refreshLayout);
      window.removeEventListener(
        "futurelab:critical-assets-ready",
        refreshLayout
      );
      window.removeEventListener("futurelab:image-loaded", refreshLayout);
      window.clearTimeout(refreshTimeout);

      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }

      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
