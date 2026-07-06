"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";

const SOUND_STORAGE_KEY = "futurelab:sound-enabled";
const MIN_VISIBLE_RATIO = 0.2;

type SoundContextValue = {
  soundEnabled: boolean;
  hasVisibleMedia: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function getVisibleRatio(element: Element) {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return 0;

  const intersectionWidth = Math.max(
    0,
    Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)
  );
  const intersectionHeight = Math.max(
    0,
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
  );

  return (intersectionWidth * intersectionHeight) / (rect.width * rect.height);
}

function isMediaInView(element: Element) {
  return getVisibleRatio(element) >= MIN_VISIBLE_RATIO;
}

function syncVideoElement(video: HTMLVideoElement, shouldBeAudible: boolean) {
  video.muted = !shouldBeAudible;
  video.volume = shouldBeAudible ? 1 : 0;

  if (video.autoplay) {
    void video.play().catch(() => undefined);
  }
}

function postYoutubeCommand(
  iframe: HTMLIFrameElement,
  func: "mute" | "unMute" | "playVideo"
) {
  const targetWindow = iframe.contentWindow;
  if (!targetWindow) return;

  let targetOrigin = "https://www.youtube.com";
  try {
    targetOrigin = new URL(iframe.src).origin;
  } catch {
    // Keep the YouTube default origin above.
  }

  targetWindow.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    targetOrigin
  );
}

function syncYoutubeEmbeds(soundEnabled: boolean) {
  let visibleCount = 0;

  document
    .querySelectorAll<HTMLIFrameElement>('iframe[src*="youtube.com/embed"]')
    .forEach((iframe) => {
      const inView = isMediaInView(iframe);
      const shouldBeAudible = soundEnabled && inView;

      if (inView) {
        visibleCount += 1;
      }

      postYoutubeCommand(iframe, shouldBeAudible ? "unMute" : "mute");

      if (shouldBeAudible) {
        postYoutubeCommand(iframe, "playVideo");
      }
    });

  return visibleCount;
}

function syncPageMedia(soundEnabled: boolean) {
  let visibleCount = 0;

  document
    .querySelectorAll<HTMLVideoElement>("video")
    .forEach((video) => {
      const inView = isMediaInView(video);

      if (inView) {
        visibleCount += 1;
      }

      syncVideoElement(video, soundEnabled && inView);
    });

  visibleCount += syncYoutubeEmbeds(soundEnabled);

  return { visibleCount };
}

export function useGlobalSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useGlobalSound must be used within SoundProvider");
  }

  return context;
}

export function useGlobalVideoSound(
  videoRef: RefObject<HTMLVideoElement | null>,
  dependencies: ReadonlyArray<unknown> = []
) {
  const { soundEnabled } = useGlobalSound();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    syncVideoElement(video, soundEnabled && isMediaInView(video));
    // dependencies lets callers resync after a source key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled, videoRef, ...dependencies]);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.localStorage.getItem(SOUND_STORAGE_KEY) === "1";
  });
  const [hasVisibleMedia, setHasVisibleMedia] = useState(false);

  const setVisibleMediaState = useCallback((visibleCount: number) => {
    const nextHasVisibleMedia = visibleCount > 0;

    setHasVisibleMedia((current) =>
      current === nextHasVisibleMedia ? current : nextHasVisibleMedia
    );
  }, []);

  const syncCurrentPageMedia = useCallback(() => {
    const { visibleCount } = syncPageMedia(soundEnabled);
    setVisibleMediaState(visibleCount);
  }, [setVisibleMediaState, soundEnabled]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);

    if (typeof window === "undefined") return;

    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "1" : "0");
    window.requestAnimationFrame(() => {
      const { visibleCount } = syncPageMedia(enabled);
      setVisibleMediaState(visibleCount);
    });
  }, [setVisibleMediaState]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled);
  }, [setSoundEnabled, soundEnabled]);

  useEffect(() => {
    let frame = 0;

    const requestSync = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncCurrentPageMedia();
      });
    };

    const observer = new MutationObserver(requestSync);

    requestSync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      observer.disconnect();
    };
  }, [syncCurrentPageMedia]);

  const value = useMemo(
    () => ({ soundEnabled, hasVisibleMedia, setSoundEnabled, toggleSound }),
    [hasVisibleMedia, setSoundEnabled, soundEnabled, toggleSound]
  );

  return (
    <SoundContext.Provider value={value}>
      {children}
      <GlobalSoundToggle />
    </SoundContext.Provider>
  );
}

function GlobalSoundToggle() {
  const { soundEnabled, hasVisibleMedia, toggleSound } = useGlobalSound();
  const label = soundEnabled ? "Выключить звук" : "Включить звук";

  return (
    <button
      type="button"
      data-sound-toggle
      aria-label={label}
      aria-pressed={soundEnabled}
      aria-hidden={!hasVisibleMedia}
      title={label}
      onClick={toggleSound}
      disabled={!hasVisibleMedia}
      tabIndex={hasVisibleMedia ? 0 : -1}
      className={`group fixed bottom-[max(18px,env(safe-area-inset-bottom))] right-[max(18px,env(safe-area-inset-right))] z-[900] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-[0_14px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl transition duration-200 hover:scale-105 hover:border-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/80 active:scale-95 md:bottom-6 md:right-6 md:h-14 md:w-14 ${
        hasVisibleMedia
          ? "opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <span
        className={`absolute inset-[-2px] rounded-full bg-[linear-gradient(135deg,#4B0E5B_0%,#DE5CFF_38%,#FCCC01_100%)] transition-opacity duration-200 ${
          soundEnabled ? "opacity-100" : "opacity-0 group-hover:opacity-70"
        }`}
        aria-hidden="true"
      />
      <span className="absolute inset-[2px] rounded-full bg-black/80" aria-hidden="true" />
      <span className="relative flex h-6 w-6 items-center justify-center md:h-7 md:w-7">
        {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
      </span>
      <span className="pointer-events-none absolute bottom-full right-0 mb-3 hidden whitespace-nowrap rounded-md border border-white/10 bg-black/80 px-3 py-2 text-xs font-medium text-white/90 opacity-0 shadow-lg shadow-black/30 backdrop-blur-xl transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        {label}
      </span>
    </button>
  );
}

function SoundOnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden="true">
      <path
        d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4Z"
        fill="currentColor"
      />
      <path
        d="M15 8.2a5.2 5.2 0 0 1 0 7.6M17.6 5.8a8.7 8.7 0 0 1 0 12.4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden="true">
      <path
        d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4Z"
        fill="currentColor"
      />
      <path
        d="m16 9 4 4m0-4-4 4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
