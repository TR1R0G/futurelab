"use client";

import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap";
import { FadeInImage } from "@/components/media/FadeInImage";
import { useGlobalVideoSound } from "@/components/providers/SoundProvider";
import { useEffect, useRef, useState } from "react";
import type { RealizedProject } from "@/lib/mdx";

interface RealizedProjectsProps {
  title: string;
  projects: RealizedProject[];
}

export function RealizedProjects({ title, projects }: RealizedProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!section || !wrapper || !track) return;

    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const setViewportFit = () => {
        const title = section.querySelector<HTMLElement>(".realized-title-frame h2");
        const titleHeight = title?.getBoundingClientRect().height ?? 62;
        const topPadding = Math.min(120, Math.max(56, window.innerHeight * 0.09));
        const cardGap = Math.min(70, Math.max(36, window.innerHeight * 0.055));
        const bottomPadding = Math.min(96, Math.max(44, window.innerHeight * 0.05));
        const horizontalPadding = window.innerWidth >= 768 ? 64 : 40;
        const availableCardHeight =
          window.innerHeight - topPadding - titleHeight - cardGap - bottomPadding;
        const widthScale = (window.innerWidth - horizontalPadding) / 698;
        const heightScale = availableCardHeight / 874;
        const scale = Math.min(
          1,
          Math.max(0.48, Math.min(widthScale, heightScale))
        );
        const cardHeight = 874 * scale;
        const cardWidth = 698 * scale;
        const sectionHeight = topPadding + titleHeight + cardGap + cardHeight + bottomPadding;

        section.style.setProperty("--realized-top-padding", `${topPadding}px`);
        section.style.setProperty("--realized-card-gap", `${cardGap}px`);
        section.style.setProperty("--realized-bottom-padding", `${bottomPadding}px`);
        section.style.setProperty("--realized-card-scale", String(scale));
        section.style.setProperty("--realized-card-width", `${cardWidth}px`);
        section.style.setProperty("--realized-card-height", `${cardHeight}px`);
        section.style.setProperty(
          "--realized-section-height",
          `${Math.max(window.innerHeight, sectionHeight)}px`
        );
      };

      const getScrollDistance = () => {
        const wrapperRect = wrapper.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const sideSpace = trackRect.left - wrapperRect.left;

        return Math.max(
          0,
          track.scrollWidth - wrapper.clientWidth + sideSpace * 2
        );
      };

      setViewportFit();

      const handleResize = () => {
        setViewportFit();
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);

      media.add("(min-width: 1024px)", () => {
        const tween = gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          tween.kill();
        };
      });

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, section);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="realized-projects-section overflow-hidden bg-black pb-[var(--realized-bottom-padding,112px)] pt-[var(--realized-top-padding,80px)]"
    >
      <div className="realized-title-frame mx-auto max-w-[1436px]">
        <h2 className="font-heading text-[42px] font-bold leading-tight tracking-normal text-white md:text-[55px] md:leading-[62px]">
          {title}
        </h2>
      </div>

      <div
        ref={wrapperRef}
        className="mt-20 overflow-x-auto overflow-y-visible pb-4 [scrollbar-width:none] md:mt-[70px] lg:mt-[var(--realized-card-gap,70px)] lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
      >
        <div
          ref={trackRef}
          className="realized-projects-track flex w-max gap-10 px-5 will-change-transform md:px-8 lg:ml-[max(32px,calc((100vw-1436px)/2))] lg:px-0"
        >
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: RealizedProject }) {
  return (
    <article className="realized-project-card relative h-[var(--realized-card-height,874px)] w-[var(--realized-card-width,698px)] shrink-0 origin-top-left overflow-hidden bg-[#1D1D1D]">
      <div className="relative z-10 h-[868px] w-[698px] origin-top-left scale-[var(--realized-card-scale,1)] rounded-[35px] bg-[#1D1D1D]">
        <h3 className="absolute left-10 top-10 w-[618px] text-[40px] font-semibold leading-[48px] text-[#DE5CFF]">
          {project.title}
        </h3>

        <p className="absolute left-10 top-[176px] w-[618px] whitespace-pre-line text-[23px] font-medium leading-[28px] text-[#C4C4C4]">
          {project.description}
        </p>

        <ProjectMedia project={project} />
      </div>
    </article>
  );
}

function ProjectMedia({ project }: { project: RealizedProject }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useGlobalVideoSound(videoRef, [project.video]);

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.ended) {
      video.currentTime = 0;
    }

    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="absolute left-10 top-[496px] h-[332px] w-[618px] overflow-hidden rounded-[10px]">
      {project.video ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster={project.image}
          preload="metadata"
          playsInline
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          aria-label={project.imageAlt}
        >
          <source src={project.video} type="video/mp4" />
        </video>
      ) : (
        <FadeInImage
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="618px"
          className="object-cover"
          unoptimized
        />
      )}

      {project.video ? (
        !isPlaying && <PlayButton onClick={handlePlay} />
      ) : (
        <PlayIcon />
      )}
    </div>
  );
}

function PlayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Смотреть видео"
      onClick={onClick}
      className="absolute left-1/2 top-1/2 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 active:scale-95"
    >
      <PlayTriangle />
    </button>
  );
}

function PlayIcon() {
  return (
    <span
      className="pointer-events-none absolute left-1/2 top-1/2 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50"
      aria-hidden="true"
    >
      <PlayTriangle />
    </span>
  );
}

function PlayTriangle() {
  return (
    <span
      className="ml-1 h-0 w-0 border-y-[13px] border-l-[20px] border-y-transparent border-l-white"
      aria-hidden="true"
    />
  );
}
