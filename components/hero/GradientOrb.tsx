"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function GradientOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orbRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        orbRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.8,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="hero-light pointer-events-none absolute" ref={orbRef}>
      <div className="hero-light-inner">
        <span className="hero-light-ellipse hero-light-ellipse-blue" />
        <span className="hero-light-ellipse hero-light-ellipse-yellow" />
        <span className="hero-light-ellipse hero-light-ellipse-pink" />
      </div>
    </div>
  );
}
