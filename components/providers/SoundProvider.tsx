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
const SOUND_GROUP_SYNC_THRESHOLD = 0.08;

const activeSoundGroupVideos = new Map<string, HTMLVideoElement>();
const soundGroupPlaybackTimes = new Map<string, number>();

type SoundContextValue = {
  soundEnabled: boolean;
  hasVisibleMedia: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function isElementAudiblyVisible(element: Element) {
  let current: Element | null = element;

  while (current) {
    const style = window.getComputedStyle(current);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse" ||
      Number(style.opacity) <= 0.01
    ) {
      return false;
    }

    current = current.parentElement;
  }

  return true;
}

function getVisibleRatio(element: Element) {
  if (!isElementAudiblyVisible(element)) return 0;

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

function playVideoMuted(video: HTMLVideoElement) {
  video.muted = true;
  video.volume = 0;
  return video.play().catch(() => undefined);
}

function unmuteWhenPlaying(video: HTMLVideoElement) {
  video.muted = false;
  video.volume = 1;

  window.setTimeout(() => {
    if (video.paused) {
      void playVideoMuted(video);
    }
  }, 60);
}

function syncVideoElement(video: HTMLVideoElement, shouldBeAudible: boolean) {
  if (!video.autoplay) {
    video.muted = !shouldBeAudible;
    video.volume = shouldBeAudible ? 1 : 0;
    return;
  }

  if (!shouldBeAudible) {
    void playVideoMuted(video);
    return;
  }

  if (video.paused) {
    video.muted = true;
    video.volume = 0;
    void video
      .play()
      .then(() => {
        unmuteWhenPlaying(video);
      })
      .catch(() => {
        void playVideoMuted(video);
      });
    return;
  }

  unmuteWhenPlaying(video);
}

function syncGroupedVideoElement(
  video: HTMLVideoElement,
  shouldBeAudible: boolean
) {
  syncVideoElement(video, shouldBeAudible);
}

function readVideoTime(video: HTMLVideoElement) {
  return Number.isFinite(video.currentTime) ? video.currentTime : null;
}

function syncVideoTime(video: HTMLVideoElement, time: number | null | undefined) {
  if (time == null || !Number.isFinite(time)) return;

  const maxTime =
    Number.isFinite(video.duration) && video.duration > 0
      ? Math.max(0, video.duration - 0.05)
      : time;
  const nextTime = Math.max(0, Math.min(time, maxTime));

  if (Math.abs(video.currentTime - nextTime) <= SOUND_GROUP_SYNC_THRESHOLD) {
    return;
  }

  try {
    video.currentTime = nextTime;
  } catch {
    // The browser can reject seeking before metadata is ready.
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
  const nextActiveGroupedVideos = new Map<string, HTMLVideoElement>();
  const groupedVideoRatios = new Map<HTMLVideoElement, number>();
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video"));

  videos.forEach((video) => {
    const visibleRatio = getVisibleRatio(video);
    const inView = visibleRatio >= MIN_VISIBLE_RATIO;
    const soundGroup = video.dataset.soundGroup;

    if (inView) {
      visibleCount += 1;
    }

    if (!soundGroup) {
      syncVideoElement(video, soundEnabled && inView);
      return;
    }

    if (!inView) return;

    groupedVideoRatios.set(video, visibleRatio);

    const currentActiveVideo = nextActiveGroupedVideos.get(soundGroup);
    const currentActiveRatio = currentActiveVideo
      ? groupedVideoRatios.get(currentActiveVideo) ?? 0
      : 0;

    if (visibleRatio > currentActiveRatio) {
      nextActiveGroupedVideos.set(soundGroup, video);
    }
  });

  nextActiveGroupedVideos.forEach((activeVideo, soundGroup) => {
    const previousActiveVideo = activeSoundGroupVideos.get(soundGroup);

    if (
      previousActiveVideo &&
      previousActiveVideo !== activeVideo &&
      previousActiveVideo.isConnected
    ) {
      syncVideoTime(activeVideo, readVideoTime(previousActiveVideo));
    } else if (!previousActiveVideo || !previousActiveVideo.isConnected) {
      syncVideoTime(activeVideo, soundGroupPlaybackTimes.get(soundGroup));
    }

    activeSoundGroupVideos.set(soundGroup, activeVideo);
    soundGroupPlaybackTimes.set(soundGroup, readVideoTime(activeVideo) ?? 0);
  });

  activeSoundGroupVideos.forEach((video, soundGroup) => {
    if (nextActiveGroupedVideos.has(soundGroup)) return;

    activeSoundGroupVideos.delete(soundGroup);
    const time = readVideoTime(video);

    if (time != null) {
      soundGroupPlaybackTimes.set(soundGroup, time);
    }
  });

  videos.forEach((video) => {
    const soundGroup = video.dataset.soundGroup;
    if (!soundGroup) return;
    const activeVideo = nextActiveGroupedVideos.get(soundGroup);

    if (activeVideo && activeVideo !== video) {
      syncVideoTime(video, readVideoTime(activeVideo));
    }

    syncGroupedVideoElement(
      video,
      soundEnabled && activeVideo === video
    );
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

    if (video.dataset.soundGroup) {
      syncPageMedia(soundEnabled);
      return;
    }

    syncVideoElement(video, soundEnabled && isMediaInView(video));
    // dependencies lets callers resync after a source key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled, videoRef, ...dependencies]);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(false);
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
    const { visibleCount } = syncPageMedia(enabled);
    setVisibleMediaState(visibleCount);

    window.requestAnimationFrame(() => {
      const nextState = syncPageMedia(enabled);
      setVisibleMediaState(nextState.visibleCount);
    });
  }, [setVisibleMediaState]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled);
  }, [setSoundEnabled, soundEnabled]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSoundEnabledState(
        window.localStorage.getItem(SOUND_STORAGE_KEY) === "1"
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

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
