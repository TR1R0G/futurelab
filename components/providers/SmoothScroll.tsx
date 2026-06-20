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

    lenis.on("scroll", ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    tickerFnRef.current = tickerFn;

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
