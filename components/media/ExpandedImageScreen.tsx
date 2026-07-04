"use client";

import { useEffect, useRef } from "react";
import { GradientOrb } from "@/components/hero/GradientOrb";
import { FadeInImage } from "@/components/media/FadeInImage";
import { gsap, registerGsapPlugins } from "@/lib/gsap";

interface ExpandedImageScreenProps {
  src: string;
  alt: string;
  videoSrc?: string;
  className?: string;
  movingTextSelector?: string;
  fadingElementSelector?: string;
  sourceSelector?: string;
}

export function ExpandedImageScreen({
  src,
  alt,
  videoSrc,
  className = "",
  movingTextSelector,
  fadingElementSelector,
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

    const positionEase = gsap.parseEase("power2.inOut");
    const fullSizeAt = 0.82;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const getSourceElements = () =>
      sourceSelector
        ? Array.from(document.querySelectorAll<HTMLElement>(sourceSelector))
        : [];

    const getVisibleSourceElement = () =>
      getSourceElements().find((source) => {
        const rect = source.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }) ?? null;

    const readSourceRect = () => {
      const source = getVisibleSourceElement();
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
      const visualGroupWidth = 1013.91;
      const visualGroupHeight = 946.61;
      const visualScale = Math.min(
        1,
        (window.innerWidth * 0.9) / visualGroupWidth,
        (window.innerHeight * 0.92) / visualGroupHeight
      );
      const width = Math.round(530 * visualScale);
      const height = Math.round(928 * visualScale);

      return {
        left: Math.round((window.innerWidth - width) / 2),
        top: Math.max(32, Math.round((window.innerHeight - height) / 2)),
        width,
        height,
      };
    };

    const ctx = gsap.context(() => {
      const movingText = movingTextSelector
        ? document.querySelector<HTMLElement>(movingTextSelector)
        : null;
      const fadingElements = fadingElementSelector
        ? Array.from(document.querySelectorAll<HTMLElement>(fadingElementSelector))
        : [];
      let frameId = 0;
      let startRect = readSourceRect();
      let hasStartRect = false;

      const resetStartRect = () => {
        gsap.set(getSourceElements(), { opacity: 1 });
        gsap.set(frame, { autoAlpha: 0 });
        startRect = readSourceRect();
        hasStartRect = true;
      };

      const update = () => {
        frameId = 0;

        const maxScroll = Math.max(1, section.offsetHeight - window.innerHeight);
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const progress = clamp((window.scrollY - sectionTop) / maxScroll);
        const target = readTargetRect();

        if (progress <= 0.001) {
          resetStartRect();
          if (movingText) {
            gsap.set(movingText, { y: 0, opacity: 1 });
          }
          gsap.set(fadingElements, { opacity: 1 });
          gsap.set(gradient, { opacity: 0, scale: 0.72 });
          return;
        }

        if (!hasStartRect) {
          startRect = readSourceRect();
          hasStartRect = true;
        }

        const imageProgress = clamp(progress / fullSizeAt);
        const easedProgress = positionEase(imageProgress);
        const rect = mixRect(startRect, target, easedProgress);

        gsap.set(getSourceElements(), { opacity: 0 });
        gsap.set(frame, {
          ...rect,
          autoAlpha: 1,
          borderRadius: mix(12, 35, easedProgress),
        });
        const gradientFadeOut = clamp((progress - 0.82) / 0.18);
        gsap.set(gradient, {
          opacity: mix(easedProgress, 0, gradientFadeOut),
          scale: mix(0.72, 1, easedProgress),
        });

        if (movingText) {
          const firstPhase = clamp(progress / 0.42);
          const secondPhase = clamp((progress - 0.42) / 0.5);
          const textY = mix(
            mix(0, -window.innerHeight * 0.08, positionEase(firstPhase)),
            -window.innerHeight * 0.78,
            positionEase(secondPhase)
          );

          gsap.set(movingText, {
            y: textY,
            opacity: mix(1, 0.16, positionEase(secondPhase)),
          });
          gsap.set(fadingElements, {
            opacity: mix(1, 0, positionEase(secondPhase)),
          });
        }
      };

      const requestUpdate = () => {
        if (frameId) return;
        frameId = window.requestAnimationFrame(update);
      };

      const handleResize = () => {
        hasStartRect = false;
        resetStartRect();
        requestUpdate();
      };

      gsap.set(frame, {
        force3D: true,
        willChange: "left, top, width, height, border-radius, opacity",
      });

      resetStartRect();
      update();

      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", handleResize);

      return () => {
        if (frameId) window.cancelAnimationFrame(frameId);
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", handleResize);
      };
    }, section);

    return () => {
      ctx.revert();
    };
  }, [fadingElementSelector, movingTextSelector, sourceSelector]);

  return (
    <section
      ref={sectionRef}
      className={`expanded-image-section relative z-[90] ml-[calc(50%_-_50vw)] h-[220svh] w-screen bg-transparent ${className}`}
    >
      <div className="expanded-image-stage sticky top-0 h-[100svh] overflow-hidden bg-transparent">
        <div ref={gradientRef} className="video-gradient-field absolute inset-0">
          <GradientOrb variant="video" />
        </div>

        <div
          ref={frameRef}
          className="absolute z-10 h-[min(86svh,928px)] w-[min(85vw,calc(min(86svh,928px)*0.57112))] overflow-hidden rounded-[35px] opacity-0 shadow-2xl shadow-black/45"
        >
          {videoSrc ? (
            <video
              key={videoSrc}
              className="h-full w-full object-cover"
              aria-label={alt}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={src}
              disablePictureInPicture
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <FadeInImage
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="85vw"
              unoptimized
            />
          )}
        </div>
      </div>
    </section>
  );
}
