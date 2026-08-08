"use client";

import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap";
import { FadeInImage } from "@/components/media/FadeInImage";
import { LazyVideo } from "@/components/media/LazyVideo";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RealizedProject } from "@/lib/mdx";

interface RealizedProjectsProps {
  id?: string;
  title: string;
  projects: RealizedProject[];
}

type RealizedProjectWithVideo = RealizedProject & { video: string };

const hasCyrillic = (value: string) => /[А-Яа-яЁё]/.test(value);
const getProjectActionLabel = (project: RealizedProject) =>
  hasCyrillic(project.title) ? "Смотреть видео" : "Watch video";
const getProjectKey = (project: RealizedProject) =>
  project.video ?? project.image ?? project.imageAlt;

export function RealizedProjects({ id, title, projects }: RealizedProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const desktopScrollTriggerRef = useRef<{
    start: number;
    end: number;
  } | null>(null);
  const prefersReducedMotionRef = useRef(false);
  const [activeProject, setActiveProject] = useState<RealizedProject | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(projects.length > 1);

  useEffect(() => {
    registerGsapPlugins();

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!section || !wrapper || !track) return;

    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const updateDesktopNavigation = () => {
        if (window.innerWidth < 1024) return;

        const cards = cardRefs.current.filter(
          (card): card is HTMLElement => Boolean(card)
        );
        if (!cards.length) return;

        const viewportRect = wrapper.getBoundingClientRect();
        const viewportCenter = viewportRect.left + viewportRect.width / 2;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - viewportCenter);
          if (distance < closestDistance) {
            closestIndex = index;
            closestDistance = distance;
          }
        });

        setActiveIndex(closestIndex);
        setCanScrollPrevious(closestIndex > 0);
        setCanScrollNext(closestIndex < cards.length - 1);
      };

      const setViewportFit = () => {
        const title = section.querySelector<HTMLElement>(".realized-title-frame h2");
        const titleHeight = title?.getBoundingClientRect().height ?? 62;
        const topPadding = Math.min(120, Math.max(56, window.innerHeight * 0.09));
        const cardGap = Math.min(70, Math.max(36, window.innerHeight * 0.055));
        const bottomPadding = Math.min(96, Math.max(44, window.innerHeight * 0.05));
        const availableCardHeight =
          window.innerHeight - topPadding - titleHeight - cardGap - bottomPadding;
        const desktopCardsInView = window.innerWidth >= 1200 ? 3 : 2;
        const trackGap = 40;
        const availableCardWidth =
          (wrapper.clientWidth - trackGap * (desktopCardsInView - 1)) /
          desktopCardsInView;
        const widthScale = availableCardWidth / 698;
        const heightScale = availableCardHeight / 874;
        const scale = Math.min(
          1,
          Math.max(0.48, Math.min(widthScale, heightScale))
        );
        const cards = cardRefs.current.filter(
          (card): card is HTMLElement => Boolean(card)
        );
        const shellHeights =
          window.innerWidth >= 720
            ? cards.map((card) => {
                const shell = card.querySelector<HTMLElement>(
                  ".realized-project-card-shell"
                );
                return shell?.offsetHeight ?? 868;
              })
            : [];
        const shellHeight = shellHeights.length
          ? Math.max(...shellHeights)
          : 868;
        const copyHeight = Math.max(
          0,
          ...cards.map((card) => {
            const copy = card.querySelector<HTMLElement>(
              ".realized-project-card-copy"
            );
            return copy?.offsetHeight ?? 0;
          })
        );
        // The source card is a dark content shell plus a separate 6px gradient edge.
        const cardHeight = (shellHeight + 6) * scale;
        cards.forEach((card) => {
          card.style.setProperty(
            "--realized-card-shell-height",
            `${shellHeight}px`
          );
          card.style.setProperty(
            "--realized-card-copy-height",
            `${copyHeight}px`
          );
          card.style.setProperty(
            "--realized-card-natural-height",
            `${cardHeight}px`
          );
        });
        // Reserve a small track tail for the exposed gradient edge and rounded corners.
        const trackHeight = cardHeight + 8;
        const cardWidth = 698 * scale;
        const sectionHeight =
          topPadding + titleHeight + cardGap + trackHeight + bottomPadding;

        section.style.setProperty("--realized-top-padding", `${topPadding}px`);
        section.style.setProperty("--realized-title-height", `${titleHeight}px`);
        section.style.setProperty("--realized-card-gap", `${cardGap}px`);
        section.style.setProperty("--realized-bottom-padding", `${bottomPadding}px`);
        section.style.setProperty("--realized-card-scale", String(scale));
        section.style.setProperty("--realized-card-width", `${cardWidth}px`);
        section.style.setProperty("--realized-card-height", `${cardHeight}px`);
        section.style.setProperty("--realized-track-height", `${trackHeight}px`);
        section.style.setProperty(
          "--realized-card-half-height",
          `${cardHeight / 2}px`
        );
        section.style.setProperty(
          "--realized-section-height",
          `${Math.max(window.innerHeight, sectionHeight)}px`
        );
      };

      const getScrollDistance = () => {
        return Math.max(0, track.scrollWidth - wrapper.clientWidth);
      };

      setViewportFit();

      void document.fonts.ready.then(() => {
        setViewportFit();
        ScrollTrigger.refresh();
      });

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
            onUpdate: updateDesktopNavigation,
            onRefresh: updateDesktopNavigation,
          },
        });
        desktopScrollTriggerRef.current = tween.scrollTrigger ?? null;
        updateDesktopNavigation();

        return () => {
          desktopScrollTriggerRef.current = null;
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
  }, [projects]);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let frame = 0;
    let disposed = false;

    const updateNavigationState = () => {
      frame = 0;
      const cards = cardRefs.current.filter(
        (card): card is HTMLElement => Boolean(card)
      );
      if (!cards.length) return;

      const containerRect = container.getBoundingClientRect();
      const scrollPaddingStart =
        Number.parseFloat(getComputedStyle(container).scrollPaddingLeft) || 0;
      const currentPosition = container.scrollLeft + scrollPaddingStart;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardPosition =
          container.scrollLeft + cardRect.left - containerRect.left;
        const distance = Math.abs(cardPosition - currentPosition);

        if (distance < nearestDistance) {
          nearestIndex = index;
          nearestDistance = distance;
        }
      });

      const maxScrollLeft = Math.max(
        0,
        container.scrollWidth - container.clientWidth
      );
      const threshold = 4;

      setActiveIndex(nearestIndex);
      setCanScrollPrevious(container.scrollLeft > threshold);
      setCanScrollNext(container.scrollLeft < maxScrollLeft - threshold);
    };

    const scheduleNavigationUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateNavigationState);
    };

    const handleReducedMotionChange = () => {
      prefersReducedMotionRef.current = reducedMotionQuery.matches;
    };

    handleReducedMotionChange();
    container.addEventListener("scroll", scheduleNavigationUpdate, {
      passive: true,
    });
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    const resizeObserver = new ResizeObserver(scheduleNavigationUpdate);
    resizeObserver.observe(container);
    cardRefs.current.forEach((card) => {
      if (card) resizeObserver.observe(card);
    });

    void document.fonts.ready.then(() => {
      if (!disposed) scheduleNavigationUpdate();
    });
    scheduleNavigationUpdate();

    return () => {
      disposed = true;
      container.removeEventListener("scroll", scheduleNavigationUpdate);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
      resizeObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [projects.length]);

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
  const portalRoot =
    typeof document === "undefined" ? null : document.body;
  const isRussian = hasCyrillic(title);
  const navigationLabels = isRussian
    ? {
        navigation: "Навигация по проектам",
        previous: "Предыдущий проект",
        next: "Следующий проект",
        goTo: (index: number) => `Перейти к проекту ${index + 1}`,
      }
    : {
        navigation: "Project navigation",
        previous: "Previous project",
        next: "Next project",
        goTo: (index: number) => `Go to project ${index + 1}`,
      };

  const scrollToCard = (requestedIndex: number) => {
    const container = wrapperRef.current;
    const index = Math.min(
      Math.max(requestedIndex, 0),
      Math.max(projects.length - 1, 0)
    );
    const card = cardRefs.current[index];
    if (!container || !card) return;

    const desktopTrigger = desktopScrollTriggerRef.current;
    if (window.innerWidth >= 1024 && desktopTrigger) {
      const maxTranslation = Math.max(
        0,
        (trackRef.current?.scrollWidth ?? 0) - container.clientWidth
      );
      const targetTranslation = Math.min(
        Math.max(
          card.offsetLeft + card.offsetWidth / 2 - container.clientWidth / 2,
          0
        ),
        maxTranslation
      );
      const progress = maxTranslation ? targetTranslation / maxTranslation : 0;
      const top =
        desktopTrigger.start +
        (desktopTrigger.end - desktopTrigger.start) * progress;

      window.scrollTo({
        top,
        behavior: prefersReducedMotionRef.current ? "auto" : "smooth",
      });
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const scrollPaddingStart =
      Number.parseFloat(getComputedStyle(container).scrollPaddingLeft) || 0;
    const left =
      container.scrollLeft +
      cardRect.left -
      containerRect.left -
      scrollPaddingStart;

    container.scrollTo({
      left: Math.max(0, left),
      behavior: prefersReducedMotionRef.current ? "auto" : "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      className="realized-projects-section relative overflow-hidden bg-black pb-[var(--realized-bottom-padding,112px)] pt-[var(--realized-top-padding,80px)]"
    >
      <div className="realized-title-frame section-shell">
        <h2 className="font-heading text-[42px] font-bold leading-tight tracking-normal text-white md:text-[55px] md:leading-[62px]">
          {title}
        </h2>
      </div>

      <div
        ref={wrapperRef}
        className="realized-projects-viewport section-shell mt-20 overflow-x-auto overflow-y-visible pb-4 [scrollbar-width:none] md:mt-[70px] lg:mt-[var(--realized-card-gap,70px)] lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        <div
          ref={trackRef}
          className="realized-projects-track flex w-max gap-10 will-change-transform"
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={getProjectKey(project)}
              articleRef={(card) => {
                cardRefs.current[index] = card;
              }}
              project={project}
              onOpenVideo={setActiveProject}
            />
          ))}
        </div>
      </div>

      <nav
        className="realized-projects-navigation section-shell"
        aria-label={navigationLabels.navigation}
      >
        <button
          type="button"
          className="realized-projects-arrow realized-projects-arrow--previous"
          aria-label={navigationLabels.previous}
          disabled={!canScrollPrevious}
          onClick={() => scrollToCard(activeIndex - 1)}
        >
          <span className="realized-projects-chevron" aria-hidden="true" />
        </button>

        <div className="realized-projects-pagination">
          {projects.map((project, index) => (
            <button
              key={getProjectKey(project)}
              type="button"
              aria-label={navigationLabels.goTo(index)}
              aria-current={activeIndex === index ? "true" : undefined}
              className="realized-projects-dot"
              onClick={() => scrollToCard(index)}
            />
          ))}
        </div>

        <button
          type="button"
          className="realized-projects-arrow realized-projects-arrow--next"
          aria-label={navigationLabels.next}
          disabled={!canScrollNext}
          onClick={() => scrollToCard(activeIndex + 1)}
        >
          <span className="realized-projects-chevron" aria-hidden="true" />
        </button>
      </nav>

      {activeVideoProject && portalRoot
        ? createPortal(
            <ProjectVideoOverlay
              project={activeVideoProject}
              onClose={() => setActiveProject(null)}
            />,
            portalRoot
          )
        : null}
    </section>
  );
}

function ProjectCard({
  articleRef,
  project,
  onOpenVideo,
}: {
  articleRef: (card: HTMLElement | null) => void;
  project: RealizedProject;
  onOpenVideo: (project: RealizedProject) => void;
}) {
  return (
    <article
      ref={articleRef}
      className="realized-project-card relative h-[var(--realized-card-height,874px)] w-[var(--realized-card-width,698px)] shrink-0 origin-top-left overflow-hidden bg-[#1D1D1D]"
    >
      <div className="realized-project-card-shell relative z-10 h-[868px] w-[698px] origin-top-left scale-[var(--realized-card-scale,1)] rounded-[35px] bg-[#1D1D1D]">
        <div className="realized-project-card-copy absolute left-10 top-10 w-[618px]">
          <h3 className="realized-project-card-title project-mini-heading text-[40px] font-semibold leading-[48px] text-[#DE5CFF]">
            {project.title}
          </h3>

          <p className="realized-project-card-description mt-8 whitespace-pre-line text-[23px] font-medium leading-[28px] text-[#C4C4C4]">
            {project.description}
          </p>
        </div>

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
  const hasVideo = Boolean(project.video);
  const actionLabel = getProjectActionLabel(project);

  return (
    <div className="realized-project-media absolute left-10 top-[496px] h-[332px] w-[618px] overflow-hidden rounded-[10px]">
      {project.image ? (
        <FadeInImage
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="618px"
          className="select-none object-cover [backface-visibility:hidden] [transform:translateZ(0)]"
          unoptimized
        />
      ) : null}

      {hasVideo ? (
        <PlayButton onClick={() => onOpenVideo(project)} />
      ) : project.image ? (
        <PlayIcon />
      ) : null}

      {hasVideo ? (
        <button
          type="button"
          className="realized-project-case-button project-mini-heading"
          aria-label={`${actionLabel}: ${project.title}`}
          onClick={() => onOpenVideo(project)}
        >
          {actionLabel}
        </button>
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
          className="realized-project-overlay-close absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center text-black transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:right-6 md:top-6 md:h-14 md:w-14"
        >
          <span className="realized-project-overlay-close-line absolute h-[4px] w-10 rotate-45 rounded-full bg-black md:w-12" />
          <span className="realized-project-overlay-close-line absolute h-[4px] w-10 -rotate-45 rounded-full bg-black md:w-12" />
        </button>

        <LazyVideo
          ref={videoRef}
          key={project.video}
          className="aspect-video max-h-[calc(100svh-96px)] w-full bg-black object-cover"
          controls
          autoPlay
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
      className="absolute left-1/2 top-1/2 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 active:bg-black/75"
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
