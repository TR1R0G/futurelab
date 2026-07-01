"use client";

import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { FadeInImage } from "@/components/media/FadeInImage";
import { useEffect, useRef } from "react";

const galleryItems = [
  {
    src: "/images/block4/carousel/optimized/presentation.webp",
    alt: "Современное пространство FutureLab",
    left: 0,
    width: 552,
    position: "50% 50%",
  },
  {
    src: "/images/block4/carousel/optimized/team.webp",
    alt: "Команда за совместной работой",
    left: 572,
    width: 306,
    position: "50% 50%",
  },
  {
    src: "/images/block4/carousel/optimized/lab.webp",
    alt: "Технологическая лаборатория FutureLab",
    left: 898,
    width: 552,
    position: "50% 50%",
  },
  {
    src: "/images/block4/carousel/optimized/zone.webp",
    alt: "Презентационная зона FutureLab",
    left: 1470,
    width: 552,
    position: "50% 50%",
  },
  {
    src: "/images/block4/carousel/optimized/workspace.webp",
    alt: "Рабочая зона FutureLab",
    left: 2042,
    width: 306,
    position: "50% 50%",
  },
];

const galleryBackplates = [
  { left: 0, width: 552 },
  { left: 572, width: 291 },
  { left: 898, width: 552 },
  { left: 1470, width: 552 },
  { left: 2042, width: 306 },
];

export function ImageGallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const gallery = galleryRef.current;
    const track = trackRef.current;
    if (!gallery || !track) return;

    const ctx = gsap.context(() => {
      const firstSet = track.querySelector<HTMLElement>(
        "[data-gallery-set='original']"
      );
      if (!firstSet) return;

      const tween = gsap.to(track, {
        x: () => -firstSet.offsetWidth,
        duration: 28,
        ease: "none",
        repeat: -1,
        invalidateOnRefresh: true,
      });

      const slowDown = () => tween.timeScale(0.28);
      const speedUp = () => tween.timeScale(1);
      gallery.addEventListener("pointerenter", slowDown);
      gallery.addEventListener("pointerleave", speedUp);
      gallery.addEventListener("focusin", slowDown);
      gallery.addEventListener("focusout", speedUp);

      return () => {
        gallery.removeEventListener("pointerenter", slowDown);
        gallery.removeEventListener("pointerleave", speedUp);
        gallery.removeEventListener("focusin", slowDown);
        gallery.removeEventListener("focusout", speedUp);
        tween.kill();
      };
    }, gallery);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={galleryRef}
      className="infrastructure-gallery relative mt-16 h-[468px] w-full overflow-hidden pt-[72px] md:mt-24 lg:mt-28"
      aria-label="Фотографии пространства FutureLab"
    >
      <div
        ref={trackRef}
        className="infrastructure-gallery-track flex h-[396px] w-max will-change-transform"
      >
        {[0, 1].map((setIndex) => (
          <div
            key={setIndex}
            data-gallery-set={setIndex === 0 ? "original" : "clone"}
            className="relative h-[396px] w-[2368px] shrink-0"
            aria-hidden={setIndex === 1}
          >
            {galleryBackplates.map((backplate) => (
              <div
                key={`${setIndex}-backplate-${backplate.left}`}
                className="absolute top-0 h-[396px]"
                style={{
                  left: backplate.left,
                  width: backplate.width,
                  backgroundColor: "#000",
                }}
              />
            ))}

            {galleryItems.map((image) => (
              <div
                key={`${setIndex}-${image.alt}`}
                className="infrastructure-gallery-item absolute top-0 h-[396px] overflow-hidden will-change-transform"
                style={{
                  left: image.left,
                  width: image.width,
                }}
              >
                <FadeInImage
                  src={image.src}
                  alt={setIndex === 0 ? image.alt : ""}
                  fill
                  className="object-cover"
                  style={{ objectPosition: image.position }}
                  sizes={`${image.width}px`}
                  unoptimized
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[242px] bg-[linear-gradient(270deg,rgba(0,0,0,0)_0%,#000_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[242px] bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,#000_100%)]"
        aria-hidden="true"
      />
      <GalleryCurveOverlay position="top" />
      <GalleryCurveOverlay position="bottom" />
    </div>
  );
}

function GalleryCurveOverlay({ position }: { position: "top" | "bottom" }) {
  const isTop = position === "top";

  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 z-20 h-[48px] w-full ${
        isTop ? "top-[72px]" : "bottom-0"
      }`}
      viewBox="0 0 1920 48"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={
          isTop
            ? "M0 0H1920C1440 22 480 22 0 0Z"
            : "M0 48C480 26 1440 26 1920 48H0Z"
        }
        fill="black"
      />
    </svg>
  );
}
