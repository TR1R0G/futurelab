/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";
const expectedPdf =
  "/documents/temurids/Интерактивная_музейная_экспозиция_Эпоха_Темуридов_2_для_сайта.pdf";

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

  if (!decodeURIComponent(state.src).endsWith("/videos/temurids/temurids.mp4")) {
    throw new Error(`${label} uses unexpected source: ${state.src}`);
  }
}

async function checkTemuridsFlow(page, lang) {
  await page.goto(`${baseUrl}?lang=${lang}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);

  const section = await page.locator(".solutions-section").evaluate((element) => ({
    top: element.getBoundingClientRect().top + window.scrollY,
  }));
  const solutionBlockHeight = 2020.92;
  const temuridsBlockOffset = solutionBlockHeight * 2;

  for (const offset of [1120, 1450, 1850]) {
    await page.evaluate(
      ({ top, offset }) => window.scrollTo(0, top + offset),
      { top: section.top + temuridsBlockOffset, offset }
    );
    await page.waitForTimeout(500);
    await expectPlaying(
      page.locator(".solutions-transition-media").nth(2).locator("video"),
      `${lang} temurids video at offset ${offset}`
    );
  }

  await page
    .locator(".solutions-card-outline")
    .nth(2)
    .click({ position: { x: 1040, y: 170 } });
  await page.waitForURL(`**/temurids?lang=${lang}`, { timeout: 5000 });

  const pdfSrc = await page.locator("[data-temurids-pdf]").getAttribute("src");
  if (pdfSrc !== expectedPdf) {
    throw new Error(`Expected ${lang} temurids PDF ${expectedPdf}, got ${pdfSrc}`);
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

  await checkTemuridsFlow(page, "ru");
  await checkTemuridsFlow(page, "en");

  await browser.close();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
