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
    throw new Error(`${label} is missing autoplay-safe attributes`);
  }

  if (state.paused || state.after <= state.before) {
    throw new Error(`${label} is not playing`);
  }

  if (state.width <= 0 || state.height <= 0) {
    throw new Error(`${label} is not visible`);
  }

  if (!decodeURIComponent(state.src).endsWith("/videos/museum/museum.mp4")) {
    throw new Error(`${label} uses unexpected source: ${state.src}`);
  }
}

async function checkMuseumFlow(page, lang, expectedPdf) {
  await page.goto(`${baseUrl}?lang=${lang}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);

  const section = await page.locator(".solutions-section").evaluate((element) => ({
    top: element.getBoundingClientRect().top + window.scrollY,
  }));

  for (const offset of [1120, 1450, 1850]) {
    await page.evaluate(
      ({ top, offset }) => window.scrollTo(0, top + offset),
      { ...section, offset }
    );
    await page.waitForTimeout(500);
    await expectPlaying(
      page.locator(".solutions-transition-media").first().locator("video"),
      `${lang} museum video at offset ${offset}`
    );
  }

  await page.locator(".solutions-card-outline").first().click({ position: { x: 1040, y: 170 } });
  await page.waitForURL(`**/museum?lang=${lang}`, { timeout: 5000 });

  const pdfSrc = await page.locator("[data-museum-pdf]").getAttribute("src");
  if (!pdfSrc?.endsWith(expectedPdf)) {
    throw new Error(`Expected ${lang} museum PDF ${expectedPdf}, got ${pdfSrc}`);
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

  await checkMuseumFlow(page, "ru", "/documents/museum/AR-rus.pdf");
  await checkMuseumFlow(page, "en", "/documents/museum/AR-eng.pdf");

  await browser.close();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
