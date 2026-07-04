"use client";

import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { FadeInImage } from "@/components/media/FadeInImage";
import { useEffect, useRef } from "react";

const GALLERY_GAP = 20;

const carouselPath = (path: string) => encodeURI(path);

const gallerySourceItems = [
  {
    src: carouselPath("/images/block4/carousel/Shourum.jpeg"),
    alt: "Современное пространство FutureLab",
    width: 552,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/Вертикальные/IMG_3752.JPG"),
    alt: "Вертикальное фото пространства FutureLab",
    width: 306,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/IMG_2708.JPG"),
    alt: "Коворкинг зона FutureLab",
    width: 552,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/Вертикальные/IMG game.png"),
    alt: "Игровая зона FutureLab",
    width: 306,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/IMG_2723.JPG"),
    alt: "Команда за совместной работой в FutureLab",
    width: 552,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/Вертикальные/IMG game2.png"),
    alt: "Вертикальное фото игровой зоны FutureLab",
    width: 306,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/koworking zone.jpeg"),
    alt: "Коворкинг пространство FutureLab",
    width: 552,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/Вертикальные/IMG_4442.JPG"),
    alt: "Вертикальное фото участника FutureLab",
    width: 306,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/terrassa.jpeg"),
    alt: "Терраса FutureLab",
    width: 552,
    position: "50% 50%",
  },
  {
    src: carouselPath("/images/block4/carousel/ARVR lab.jpeg"),
    alt: "Технологическая лаборатория FutureLab",
    width: 552,
    position: "50% 50%",
  },
];

const galleryItems = gallerySourceItems.map((item, index) => ({
  ...item,
  left: gallerySourceItems
    .slice(0, index)
    .reduce((offset, previous) => offset + previous.width + GALLERY_GAP, 0),
}));

const gallerySetWidth =
  galleryItems.reduce((offset, item) => offset + item.width + GALLERY_GAP, 0);

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
            className="relative h-[396px] shrink-0"
            style={{ width: gallerySetWidth }}
            aria-hidden={setIndex === 1}
          >
            {galleryItems.map((backplate) => (
              <div
                key={`${setIndex}-backplate-${backplate.src}`}
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
