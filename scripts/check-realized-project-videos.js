/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const expectedVideos = [
  "/videos/solutions/interactive-exposition.mp4",
  "/videos/solutions/behbudi.mp4",
  "/videos/solutions/webar.mp4",
];

async function assertClickToPlay(page, index, expectedSrc) {
  const card = page.locator(".realized-project-card").nth(index);
  const video = card.locator("video");

  await card.scrollIntoViewIfNeeded();
  await video.waitFor({ state: "attached", timeout: 5000 });

  const initial = await video.evaluate((element) => ({
    paused: element.paused,
    currentTime: element.currentTime,
    controls: element.controls,
    playsInline: element.playsInline,
    src: element.currentSrc || element.src,
  }));

  if (!initial.paused || initial.currentTime !== 0) {
    throw new Error(`Video ${index} should be paused before click`);
  }

  if (!initial.controls) {
    throw new Error(`Video ${index} should expose native controls`);
  }

  if (!initial.playsInline) {
    throw new Error(`Video ${index} is missing inline playback attributes`);
  }

  if (!decodeURIComponent(initial.src).endsWith(expectedSrc)) {
    throw new Error(`Video ${index} expected ${expectedSrc}, got ${initial.src}`);
  }

  await card.locator("button").click();
  await page.waitForTimeout(450);

  const playing = await video.evaluate((element) => ({
    paused: element.paused,
    currentTime: element.currentTime,
  }));

  if (playing.paused || playing.currentTime <= initial.currentTime) {
    throw new Error(`Video ${index} did not start playing after click`);
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

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.locator(".realized-projects-section").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  for (const [index, expectedSrc] of expectedVideos.entries()) {
    await assertClickToPlay(page, index, expectedSrc);
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
