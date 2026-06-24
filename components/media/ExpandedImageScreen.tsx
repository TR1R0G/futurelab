"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { GradientOrb } from "@/components/hero/GradientOrb";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap";

interface ExpandedImageScreenProps {
  src: string;
  alt: string;
  className?: string;
  movingTextSelector?: string;
  sourceSelector?: string;
}

export function ExpandedImageScreen({
  src,
  alt,
  className = "",
  movingTextSelector,
  sourceSelector,
}: ExpandedImageScreenProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const section = sectionRef.current;
    const frame = frameRef.current;
    const gradient = gradientRef.current;
    if (!section || !frame || !gradient) return;

    const triggerStart = "top top";
    const triggerEnd = "+=120%";

    const readSourceRect = () => {
      const source = sourceSelector
        ? document.querySelector<HTMLElement>(sourceSelector)
        : null;
      const rect = source?.getBoundingClientRect();

      if (rect && rect.width > 0 && rect.height > 0) {
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
      }

      const target = readTargetRect();
      return {
        left: target.left + target.width / 2,
        top: target.top + target.height / 2,
        width: Math.max(42, target.width * 0.1),
        height: Math.max(64, target.height * 0.1),
      };
    };

    const mix = (start: number, end: number, progress: number) =>
      start + (end - start) * progress;

    const mixRect = (
      start: ReturnType<typeof readTargetRect>,
      end: ReturnType<typeof readTargetRect>,
      progress: number
    ) => ({
      left: mix(start.left, end.left, progress),
      top: mix(start.top, end.top, progress),
      width: mix(start.width, end.width, progress),
      height: mix(start.height, end.height, progress),
    });

    const readTargetRect = () => {
      const height = Math.round(window.innerHeight * 0.9);
      const width = Math.min(
        Math.round(window.innerWidth * 0.85),
        Math.round(height * 0.6)
      );

      return {
        left: Math.round((window.innerWidth - width) / 2),
        top: Math.round((window.innerHeight - height) / 2),
        width,
        height,
      };
    };

    const readMiddleRect = () => {
      const height = Math.round(window.innerHeight * 0.26);
      const width = Math.round(height * 0.58);

      return {
        left: Math.round(window.innerWidth * 0.515),
        top: Math.round(window.innerHeight * 0.35),
        width,
        height,
      };
    };

    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const movingText = movingTextSelector
          ? document.querySelector<HTMLElement>(movingTextSelector)
          : null;
        const sourceImage = sourceSelector
          ? document.querySelector<HTMLElement>(sourceSelector)
          : null;

        const middleEnd = 0.55;
        let startRect = readSourceRect();
        let hasStartRect = false;

        ScrollTrigger.create({
          trigger: section,
          start: triggerStart,
          end: triggerEnd,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            let rect = startRect;
            const middle = readMiddleRect();
            const target = readTargetRect();

            if (progress <= 0.001) {
              startRect = readSourceRect();
              hasStartRect = true;
              gsap.set(sourceImage, { opacity: 1 });
              gsap.set(frame, { autoAlpha: 0 });
              return;
            }

            gsap.set(sourceImage, { opacity: 0 });
            if (!hasStartRect || Math.abs(startRect.top) > window.innerHeight) {
              startRect = readSourceRect();
              hasStartRect = true;
              rect = startRect;
            }

            if (progress <= middleEnd) {
              rect = mixRect(startRect, middle, progress / middleEnd);
            } else {
              rect = mixRect(
                middle,
                target,
                (progress - middleEnd) / (1 - middleEnd)
              );
            }

            gsap.set(frame, {
              ...rect,
              autoAlpha: 1,
              borderRadius: 14,
            });
          },
          onLeaveBack: () => {
            startRect = readSourceRect();
            hasStartRect = false;
            gsap.set(frame, { autoAlpha: 0 });
            gsap.set(sourceImage, { opacity: 1 });
          },
          onRefresh: (self) => {
            if (self.progress === 0) {
              startRect = readSourceRect();
              hasStartRect = false;
              gsap.set(frame, { autoAlpha: 0 });
              gsap.set(sourceImage, { opacity: 1 });
            }
          },
        });

        gsap.fromTo(
          gradient,
          { opacity: 0, scale: 0.72 },
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: triggerStart,
              end: triggerEnd,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );

        if (movingText) {
          const textTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: triggerStart,
              end: triggerEnd,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });

          textTimeline.to(movingText, {
            y: () => -window.innerHeight * 0.08,
            opacity: 1,
            ease: "none",
            duration: 0.55,
          });

          textTimeline.to(movingText, {
            y: () => -window.innerHeight * 0.78,
            opacity: 0.16,
            ease: "none",
            duration: 0.75,
          });
        }

      });
    }, section);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, [movingTextSelector, sourceSelector]);

  return (
    <section
      ref={sectionRef}
      className={`expanded-image-section relative z-[90] ml-[calc(50%_-_50vw)] h-[220svh] w-screen bg-transparent ${className}`}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-transparent">
        <div ref={gradientRef} className="absolute inset-0">
          <GradientOrb
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) rotate(-12.33deg) scale(2.9)",
              opacity: 1,
            }}
          />
        </div>

        <div
          ref={frameRef}
          className="absolute z-10 h-[90svh] w-[min(85vw,54svh)] overflow-hidden rounded-[14px] opacity-0 shadow-2xl shadow-black/45 max-sm:w-[min(85vw,49.5svh)]"
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="85vw"
          />
        </div>
      </div>
    </section>
  );
}
