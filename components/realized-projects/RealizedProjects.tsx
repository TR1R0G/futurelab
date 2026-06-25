"use client";

import { gsap, registerGsapPlugins } from "@/lib/gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
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
      media.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const getScrollDistance = () => {
            const wrapperRect = wrapper.getBoundingClientRect();
            const trackRect = track.getBoundingClientRect();
            const sideSpace = trackRect.left - wrapperRect.left;

            return Math.max(
              0,
              track.scrollWidth - wrapper.clientWidth + sideSpace * 2
            );
          };

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
        }
      );
    }, section);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="realized-projects-section overflow-hidden bg-black pb-28 pt-20 md:pb-36 md:pt-28 lg:h-[1126px] lg:pb-0 lg:pt-[120px]"
    >
      <div className="mx-auto max-w-[1436px]">
        <h2 className="text-[42px] font-bold leading-tight tracking-[-0.03em] text-white md:text-[55px] md:leading-[62px]">
          {title}
        </h2>
      </div>

      <div
        ref={wrapperRef}
        className="mt-20 overflow-x-auto overflow-y-visible pb-4 [scrollbar-width:none] md:mt-[70px] lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
      >
        <div
          ref={trackRef}
          className="flex w-max gap-10 px-5 will-change-transform md:px-8 lg:ml-[max(32px,calc((100vw-1436px)/2))] lg:px-0"
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
    <article className="relative h-[874px] w-[698px] shrink-0 overflow-hidden rounded-[35px] bg-[linear-gradient(65.17deg,#4B0E5B_-2.47%,#A91E83_18.71%,#FD9A34_44.05%,#F9EB44_68.37%)]">
      <div className="relative h-[868px] rounded-[35px] bg-[#1D1D1D]">
        <h3 className="absolute left-10 top-10 w-[618px] text-[40px] font-semibold leading-[48px] text-[#DE5CFF]">
          {project.title}
        </h3>

        <p className="absolute left-10 top-[176px] w-[618px] whitespace-pre-line text-[23px] font-medium leading-[28px] text-[#C4C4C4]">
          {project.description}
        </p>

        <div className="absolute left-10 top-[496px] h-[332px] w-[618px] overflow-hidden rounded-[10px]">
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            sizes="618px"
            className="object-cover"
          />
          <PlayButton />
        </div>
      </div>
    </article>
  );
}

function PlayButton() {
  return (
    <button
      type="button"
      aria-label="Смотреть видео"
      className="absolute left-1/2 top-1/2 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 active:scale-95"
    >
      <span
        className="ml-1 h-0 w-0 border-y-[13px] border-l-[20px] border-y-transparent border-l-white"
        aria-hidden="true"
      />
    </button>
  );
}
