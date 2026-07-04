/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

async function expectPlaying(videoLocator, label) {
  await videoLocator.waitFor({ state: "attached", timeout: 5000 });
  const state = await videoLocator.evaluate(async (video) => {
    if (video.paused) {
      await video.play().catch(() => undefined);
    }

    const before = video.currentTime;
    await new Promise((resolve) => setTimeout(resolve, 350));
    const rect = video.getBoundingClientRect();

    return {
      before,
      after: video.currentTime,
      autoplay: video.autoplay,
      muted: video.muted,
      loop: video.loop,
      playsInline: video.playsInline,
      paused: video.paused,
      width: rect.width,
      height: rect.height,
      src: video.currentSrc || video.src,
    };
  });

  if (!state.autoplay || !state.muted || !state.loop || !state.playsInline) {
    throw new Error(`${label} is missing autoplay-safe video attributes`);
  }

  if (state.paused || state.after <= state.before) {
    throw new Error(`${label} is not playing`);
  }

  if (state.width <= 0 || state.height <= 0) {
    throw new Error(`${label} is not visible`);
  }

  return state.src;
}

async function checkLanguage(page, lang, expectedFile) {
  await page.goto(`${baseUrl}?lang=${lang}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  const inlineSource = page.locator(".directions-inline-image video").first();
  const inlineSrc = await expectPlaying(inlineSource, `${lang} inline Academy video`);
  if (!decodeURIComponent(inlineSrc).endsWith(expectedFile)) {
    throw new Error(`Expected inline ${lang} Academy video ${expectedFile}, got ${inlineSrc}`);
  }

  const section = await page.locator(".expanded-image-section").evaluate((element) => ({
    top: element.getBoundingClientRect().top + window.scrollY,
    maxScroll: element.offsetHeight - window.innerHeight,
  }));

  for (const progress of [0.45, 0.85]) {
    await page.evaluate(
      ({ top, maxScroll, progress }) => window.scrollTo(0, top + maxScroll * progress),
      { ...section, progress }
    );
    await page.waitForTimeout(500);
    const frameVideo = page.locator(".expanded-image-section video");
    const frameSrc = await expectPlaying(
      frameVideo,
      `${lang} expanded Academy video at progress ${progress}`
    );

    if (!decodeURIComponent(frameSrc).endsWith(expectedFile)) {
      throw new Error(`Expected expanded ${lang} Academy video ${expectedFile}, got ${frameSrc}`);
    }
  }
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await checkLanguage(page, "ru", "/videos/academy/academy-ru.mp4");
  await checkLanguage(page, "en", "/videos/academy/academy-en.mp4");

  await browser.close();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
