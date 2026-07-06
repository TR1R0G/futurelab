/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

function collectVideoState() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return Array.from(document.querySelectorAll("video")).map((video) => {
    const rect = video.getBoundingClientRect();
    const intersectionWidth = Math.max(
      0,
      Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)
    );
    const intersectionHeight = Math.max(
      0,
      Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
    );
    const area = Math.max(1, rect.width * rect.height);
    const visibleRatio = (intersectionWidth * intersectionHeight) / area;

    return {
      src: video.currentSrc || video.querySelector("source")?.src || video.src,
      muted: video.muted,
      volume: video.volume,
      paused: video.paused,
      autoplay: video.autoplay,
      visibleRatio,
      inView: visibleRatio >= 0.2,
    };
  });
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(`${baseUrl}?lang=ru`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);

  const toggle = page.locator("[data-sound-toggle]");
  await toggle.waitFor({ state: "attached", timeout: 5000 });

  const initialPressed = await toggle.getAttribute("aria-pressed");
  if (initialPressed !== "false") {
    throw new Error(`Expected sound toggle to start off, got aria-pressed=${initialPressed}`);
  }

  const initialVideos = await page.evaluate(() =>
    Array.from(document.querySelectorAll("video")).map((video) => ({
      src: video.currentSrc || video.querySelector("source")?.src || video.src,
      autoplay: video.autoplay,
      muted: video.muted,
      controls: video.controls,
    }))
  );

  const autoplayVideos = initialVideos.filter((video) => video.autoplay);
  if (autoplayVideos.length < 4) {
    throw new Error(`Expected several autoplay videos on the landing page, found ${autoplayVideos.length}`);
  }

  const initiallyLoudAutoplay = autoplayVideos.filter((video) => !video.muted);
  if (initiallyLoudAutoplay.length > 0) {
    throw new Error(
      `Autoplay videos should start muted: ${initiallyLoudAutoplay.map((video) => video.src).join(", ")}`
    );
  }

  await toggle.click();
  await page.waitForTimeout(700);

  const enabledPressed = await toggle.getAttribute("aria-pressed");
  if (enabledPressed !== "true") {
    throw new Error(`Expected sound toggle to be on after click, got aria-pressed=${enabledPressed}`);
  }

  const enabledState = await page.evaluate(() => ({
    stored: window.localStorage.getItem("futurelab:sound-enabled"),
    youtubeSrcs: Array.from(
      document.querySelectorAll('iframe[src*="youtube.com/embed"]')
    ).map((iframe) => iframe.src),
  }));
  enabledState.videos = await page.evaluate(collectVideoState);

  if (enabledState.stored !== "1") {
    throw new Error(`Expected enabled sound preference to be persisted, got ${enabledState.stored}`);
  }

  const visibleMutedVideos = enabledState.videos.filter(
    (video) => video.inView && (video.muted || video.volume === 0)
  );
  if (visibleMutedVideos.length > 0) {
    throw new Error(
      `Expected visible local videos to be audible after click: ${visibleMutedVideos
        .map((video) => video.src)
        .join(", ")}`
    );
  }

  const audibleHiddenVideos = enabledState.videos.filter(
    (video) => !video.inView && (!video.muted || video.volume > 0)
  );
  if (audibleHiddenVideos.length > 0) {
    throw new Error(
      `Expected hidden videos to stay muted after click: ${audibleHiddenVideos
        .map((video) => video.src)
        .join(", ")}`
    );
  }

  const pausedAutoplay = enabledState.videos.filter(
    (video) => video.inView && video.autoplay && video.paused
  );
  if (pausedAutoplay.length > 0) {
    throw new Error(
      `Expected visible autoplay videos to keep playing after sound is enabled: ${pausedAutoplay
        .map((video) => video.src)
        .join(", ")}`
    );
  }

  if (enabledState.youtubeSrcs.length === 0) {
    throw new Error("Expected at least one YouTube embed on the landing page");
  }

  const apiDisabled = enabledState.youtubeSrcs.filter((src) => !src.includes("enablejsapi=1"));
  if (apiDisabled.length > 0) {
    throw new Error(`Expected YouTube embeds to opt into JS API control: ${apiDisabled.join(", ")}`);
  }

  await page.locator(".directions-section").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);

  const scrolledState = {
    videos: await page.evaluate(collectVideoState),
  };
  const scrolledHiddenAudibleVideos = scrolledState.videos.filter(
    (video) => !video.inView && (!video.muted || video.volume > 0)
  );
  if (scrolledHiddenAudibleVideos.length > 0) {
    throw new Error(
      `Expected videos outside the viewport to be muted after scrolling: ${scrolledHiddenAudibleVideos
        .map((video) => video.src)
        .join(", ")}`
    );
  }

  await toggle.click();
  await page.waitForTimeout(350);

  const disabledState = await page.evaluate(() => ({
    stored: window.localStorage.getItem("futurelab:sound-enabled"),
    mutedCount: Array.from(document.querySelectorAll("video")).filter((video) => video.muted).length,
    totalVideos: document.querySelectorAll("video").length,
  }));

  if (disabledState.stored !== "0") {
    throw new Error(`Expected disabled sound preference to be persisted, got ${disabledState.stored}`);
  }

  if (disabledState.mutedCount !== disabledState.totalVideos) {
    throw new Error(
      `Expected all videos to return to muted, got ${disabledState.mutedCount}/${disabledState.totalVideos}`
    );
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
