"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { GradientOrb } from "./GradientOrb";
import { HeroTitle } from "./HeroTitle";
import { HeroActions } from "./HeroActions";

interface HeroProps {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  imageAlt: string;
}

export function Hero({
  title,
  description,
  primaryCta,
  secondaryCta,
  imageAlt,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const header = headerRef.current;
      const copy = copyRef.current;
      const desc = descRef.current;
      const image = imageRef.current;
      const actions = actionsRef.current;
      const light = section?.querySelector<HTMLElement>(".hero-light");

      if (!section || !header || !copy || !desc || !image || !actions || !light) {
        return;
      }

      const clamp = (value: number) => Math.min(1, Math.max(0, value));
      const lerp = (start: number, end: number, progress: number) =>
        start + (end - start) * progress;

      const readRect = (element: HTMLElement) => {
        const computed = getComputedStyle(element);
        return {
          left: parseFloat(computed.left) || 0,
          right: parseFloat(computed.right) || 0,
          top: parseFloat(computed.top) || 0,
          width: parseFloat(computed.width) || 0,
          height: parseFloat(computed.height) || 0,
        };
      };

      const getTarget = (): ScrollTarget => {
        const width = window.innerWidth;

        if (width >= 1600) {
          return {
            image: { top: 126, width: 418, height: 784 },
            description: { left: 154, top: 480, width: 520 },
            actions: { right: 195, top: 468, width: 390 },
            gradientScale: 3.05,
            gradientTop: 285,
          };
        }

        if (width >= 1200) {
          return {
            image: { top: 112, width: 405, height: 735 },
            description: { left: 180, top: 462, width: 390 },
            actions: { right: 116, top: 456, width: 255 },
            gradientScale: 2.65,
            gradientTop: 260,
          };
        }

        if (width >= 900) {
          return {
            image: { top: 150, width: 345, height: 612 },
            description: { left: 112, top: 424, width: 245 },
            actions: { right: 48, top: 404, width: 248 },
            gradientScale: 2.25,
            gradientTop: 285,
          };
        }

        if (width >= 640) {
          return {
            image: { top: 168, width: 352, height: 600 },
            description: { left: 92, top: 430, width: 245 },
            actions: { right: 54, top: 474, width: 244 },
            gradientScale: 2.2,
            gradientTop: 300,
          };
        }

        return {
          image: { top: 112, width: 236, height: 620 },
          hideText: true,
          gradientScale: 1.9,
          gradientTop: 260,
        };
      };

      let frame = 0;
      let start = {
        desc: readRect(desc),
        image: readRect(image),
        actions: readRect(actions),
        light: readRect(light),
      };

      const resetInlineStyles = () => {
        for (const element of [header, copy, desc, image, actions, light]) {
          element.removeAttribute("style");
        }

        start = {
          desc: readRect(desc),
          image: readRect(image),
          actions: readRect(actions),
          light: readRect(light),
        };
      };

      const update = () => {
        frame = 0;

        const maxScroll = Math.max(1, section.offsetHeight - window.innerHeight);
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const progress = clamp((window.scrollY - sectionTop) / maxScroll);
        const eased = gsap.parseEase("power2.inOut")(progress);
        const target = getTarget();

        header.style.opacity = String(1 - clamp(progress * 3));
        header.style.transform =
          window.innerWidth >= 1600
            ? `translateY(${-90 * eased}px)`
            : `translateX(-50%) translateY(${-90 * eased}px)`;

        copy.style.opacity = String(1 - clamp(progress * 3));
        copy.style.transform = `translateY(${-150 * eased}px)`;

        light.style.opacity = "1";
        light.style.top = `${lerp(start.light.top, target.gradientTop, eased)}px`;
        light.style.transform = `rotate(-12.33deg) scale(${lerp(1, target.gradientScale, eased)})`;

        image.style.left = "50%";
        image.style.top = `${lerp(start.image.top, target.image.top, eased)}px`;
        image.style.width = `${lerp(start.image.width, target.image.width, eased)}px`;
        image.style.height = `${lerp(start.image.height, target.image.height, eased)}px`;
        image.style.transform = "translateX(-50%)";

        if (target.hideText) {
          desc.style.opacity = String(1 - clamp(progress * 2));
          actions.style.opacity = String(1 - clamp(progress * 2));
          return;
        }

        const description = target.description;
        const actionTarget = target.actions;

        if (!description || !actionTarget) return;

        desc.style.opacity = "1";
        desc.style.left = `${lerp(start.desc.left, description.left, eased)}px`;
        desc.style.top = `${lerp(start.desc.top, description.top, eased)}px`;
        desc.style.width = `${lerp(start.desc.width, description.width, eased)}px`;

        actions.style.opacity = "1";
        actions.style.left = "auto";
        actions.style.right = `${lerp(start.actions.right, actionTarget.right, eased)}px`;
        actions.style.top = `${lerp(start.actions.top, actionTarget.top, eased)}px`;
        actions.style.width = `${lerp(start.actions.width, actionTarget.width, eased)}px`;
      };

      const requestUpdate = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(update);
      };

      resetInlineStyles();
      update();

      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", resetInlineStyles);
      window.addEventListener("resize", requestUpdate);

      return () => {
        if (frame) window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", resetInlineStyles);
        window.removeEventListener("resize", requestUpdate);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-section relative w-full bg-black"
    >
      <div className="hero-stage sticky top-0 h-screen w-full overflow-hidden bg-black">
        <div className="absolute inset-0">
          <GradientOrb />
        </div>

        <HeroHeader cta="Связаться с нами" headerRef={headerRef} />

        <div ref={copyRef} className="hero-copy relative z-10">
          <HeroTitle title={title} />
        </div>

        <p ref={descRef} className="hero-description relative z-10">
          {description}
        </p>

        <div ref={imageRef} className="hero-image relative z-10">
          <div className="hero-image-frame relative h-full w-full overflow-hidden rounded-[14px] shadow-2xl shadow-black/45">
            <Image
              src="/images/office.png"
              alt={imageAlt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 350px, 420px"
            />
          </div>
        </div>

        <div ref={actionsRef} className="hero-action-panel relative z-10">
          <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
        </div>
      </div>
    </section>
  );
}

interface ScrollTarget {
  image: {
    top: number;
    width: number;
    height: number;
  };
  gradientScale: number;
  gradientTop: number;
  hideText?: boolean;
  description?: {
    left: number;
    top: number;
    width: number;
  };
  actions?: {
    right: number;
    top: number;
    width: number;
  };
}

function HeroHeader({
  cta,
  headerRef,
}: {
  cta: string;
  headerRef: RefObject<HTMLElement | null>;
}) {
  return (
    <header ref={headerRef} className="hero-header relative z-20" aria-label="Future Lab">
      <div className="hero-brand-shell">
        <a className="hero-brand" href="#" aria-label="Future Lab">
          <Image
            src="/images/logo.svg"
            alt="futurelab by NAZZAR Innovation"
            width={144}
            height={30}
            priority
          />
        </a>
        <button className="hero-header-button bg-[#0B5CFF] font-medium text-white">
          {cta}
        </button>
      </div>
      <div className="hero-language" aria-label="Language">
        <span>Eng</span>
        <span className="hero-language-divider" aria-hidden="true" />
        <strong>Рус</strong>
      </div>
    </header>
  );
}
