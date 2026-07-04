/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const failedImages = [];
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/images/block4/carousel/") && response.status() >= 400) {
      failedImages.push(`${response.status()} ${url}`);
    }
  });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.locator(".infrastructure-gallery").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);

  const state = await page.evaluate(() => {
    const images = Array.from(
      document.querySelectorAll(".infrastructure-gallery img")
    );
    const originalSet = document.querySelector("[data-gallery-set='original']");
    const track = document.querySelector(".infrastructure-gallery-track");

    return {
      count: images.length,
      broken: images
        .filter(
          (image) =>
            image.complete &&
            (image.naturalWidth === 0 || image.naturalHeight === 0)
        )
        .map((image) => image.getAttribute("src")),
      originalSetWidth: originalSet?.getBoundingClientRect().width ?? 0,
      trackTransform: track ? getComputedStyle(track).transform : "none",
    };
  });

  await browser.close();

  if (failedImages.length > 0) {
    throw new Error(`Carousel image requests failed:\n${failedImages.join("\n")}`);
  }

  if (state.count < 20) {
    throw new Error(`Expected duplicated carousel to render at least 20 images, got ${state.count}`);
  }

  if (state.broken.length > 0) {
    throw new Error(`Carousel contains broken images:\n${state.broken.join("\n")}`);
  }

  if (state.originalSetWidth < 4000) {
    throw new Error(`Carousel original set is unexpectedly narrow: ${state.originalSetWidth}`);
  }

  if (!state.trackTransform || state.trackTransform === "none") {
    throw new Error("Carousel track is not animating");
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
