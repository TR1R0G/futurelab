"use client";

import { gsap, registerGsapPlugins } from "@/lib/gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";

const images = [
  { alt: "Технологическая лаборатория", position: "50% 20%" },
  { alt: "Команда за совместной работой", position: "50% 53%" },
  { alt: "Современное офисное пространство", position: "50% 35%" },
  { alt: "Рабочая встреча команды", position: "50% 64%" },
  { alt: "Коворкинг FutureLab", position: "50% 80%" },
];

export function ImageGallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const gallery = galleryRef.current;
    const track = trackRef.current;
    if (!gallery || !track) return;

    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
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
      });
    }, gallery);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={galleryRef}
      className="infrastructure-gallery relative mt-16 w-full overflow-hidden py-3 md:mt-24 lg:mt-28"
      aria-label="Фотографии пространства FutureLab"
    >
      <div
        ref={trackRef}
        className="infrastructure-gallery-track flex w-max will-change-transform"
      >
        {[0, 1].map((setIndex) => (
          <div
            key={setIndex}
            data-gallery-set={setIndex === 0 ? "original" : "clone"}
            className="flex shrink-0 gap-3 pr-3 md:gap-4 md:pr-4"
            aria-hidden={setIndex === 1}
          >
            {images.map((image, index) => (
              <div
                key={`${setIndex}-${image.alt}`}
                className={`infrastructure-gallery-item relative h-[220px] shrink-0 overflow-hidden md:h-[290px] lg:h-[340px] ${
                  index % 3 === 2
                    ? "w-[330px] md:w-[480px] lg:w-[570px]"
                    : "w-[245px] md:w-[330px] lg:w-[390px]"
                }`}
              >
                <Image
                  src="/images/office.png"
                  alt={setIndex === 0 ? image.alt : ""}
                  fill
                  className="scale-[1.04] object-cover"
                  style={{ objectPosition: image.position }}
                  sizes="(max-width: 768px) 330px, (max-width: 1024px) 480px, 570px"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
