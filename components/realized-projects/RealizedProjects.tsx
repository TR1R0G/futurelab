"use client";

import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap";
import { FadeInImage } from "@/components/media/FadeInImage";
import { LazyVideo } from "@/components/media/LazyVideo";
import { useGlobalVideoSound } from "@/components/providers/SoundProvider";
import { useEffect, useRef, useState } from "react";
import type { RealizedProject } from "@/lib/mdx";

interface RealizedProjectsProps {
  title: string;
  projects: RealizedProject[];
}

type RealizedProjectWithVideo = RealizedProject & { video: string };

export function RealizedProjects({ title, projects }: RealizedProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeProject, setActiveProject] = useState<RealizedProject | null>(null);

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

  useEffect(() => {
    if (!activeProject) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject]);

  const activeVideoProject = activeProject?.video
    ? (activeProject as RealizedProjectWithVideo)
    : null;

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
            <ProjectCard
              key={project.title}
              project={project}
              onOpenVideo={setActiveProject}
            />
          ))}
        </div>
      </div>

      {activeVideoProject ? (
        <ProjectVideoOverlay
          project={activeVideoProject}
          onClose={() => setActiveProject(null)}
        />
      ) : null}
    </section>
  );
}

function ProjectCard({
  project,
  onOpenVideo,
}: {
  project: RealizedProject;
  onOpenVideo: (project: RealizedProject) => void;
}) {
  return (
    <article className="realized-project-card relative h-[var(--realized-card-height,874px)] w-[var(--realized-card-width,698px)] shrink-0 origin-top-left overflow-hidden bg-[#1D1D1D]">
      <div className="relative z-10 h-[868px] w-[698px] origin-top-left scale-[var(--realized-card-scale,1)] rounded-[35px] bg-[#1D1D1D]">
        <h3 className="absolute left-10 top-10 w-[618px] text-[40px] font-semibold leading-[48px] text-[#DE5CFF]">
          {project.title}
        </h3>

        <p className="absolute left-10 top-[176px] w-[618px] whitespace-pre-line text-[23px] font-medium leading-[28px] text-[#C4C4C4]">
          {project.description}
        </p>

        <ProjectMedia project={project} onOpenVideo={onOpenVideo} />
      </div>
    </article>
  );
}

function ProjectMedia({
  project,
  onOpenVideo,
}: {
  project: RealizedProject;
  onOpenVideo: (project: RealizedProject) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useGlobalVideoSound(videoRef, [project.video]);

  return (
    <div className="absolute left-10 top-[496px] h-[332px] w-[618px] overflow-hidden rounded-[10px]">
      {project.video ? (
        <LazyVideo
          ref={videoRef}
          className="h-full w-full object-cover"
          preload="metadata"
          playsInline
          loop
          poster={project.image}
          aria-label={project.imageAlt}
          sourceSrc={project.video}
        />
      ) : project.image ? (
        <FadeInImage
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="618px"
          className="object-cover"
          unoptimized
        />
      ) : null}

      {project.video ? (
        <PlayButton onClick={() => onOpenVideo(project)} />
      ) : project.image ? (
        <PlayIcon />
      ) : null}
    </div>
  );
}

function ProjectVideoOverlay({
  project,
  onClose,
}: {
  project: RealizedProjectWithVideo;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => undefined);
  }, [project.video]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-5 py-8 backdrop-blur-[1px] md:px-8"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={onClose}
    >
      <div
        className="relative w-[min(84vw,1490px)] overflow-hidden rounded-[20px] bg-black shadow-2xl shadow-black/60 md:rounded-[28px] lg:rounded-[35px]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Закрыть видео"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center text-black transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:right-6 md:top-6 md:h-14 md:w-14"
        >
          <span className="absolute h-[4px] w-10 rotate-45 rounded-full bg-black md:w-12" />
          <span className="absolute h-[4px] w-10 -rotate-45 rounded-full bg-black md:w-12" />
        </button>

        <LazyVideo
          ref={videoRef}
          key={project.video}
          className="aspect-video max-h-[calc(100svh-96px)] w-full bg-black object-cover"
          controls
          autoPlay
          playsInline
          preload="auto"
          poster={project.image}
          aria-label={project.imageAlt}
          data-manual-sound="true"
          sourceSrc={project.video}
          eager
        />
      </div>
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
