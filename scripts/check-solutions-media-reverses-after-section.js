/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const SOLUTION_CARD_TOP = 555;
const SOLUTION_EXPANDED_IMAGE_TOP = 1598;
const SOLUTION_BLOCK_HEIGHT = 2020.92;

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const failures = [];

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const setup = await page.evaluate(() => {
    const section = document.querySelector(".solutions-section");
    const media = Array.from(document.querySelectorAll(".solutions-transition-media"));

    if (!section || media.length === 0) {
      return null;
    }

    const sectionRect = section.getBoundingClientRect();
    const visualWidth = 1436;
    const visualHeight = 809;
    const visualScale = Math.min(
      1,
      (window.innerWidth * 0.9) / visualWidth,
      (window.innerHeight * 0.92) / visualHeight
    );

    return {
      count: media.length,
      sectionTop: sectionRect.top + window.scrollY,
      sectionBottom: sectionRect.top + window.scrollY + section.scrollHeight,
      targetTop: Math.max(32, Math.round((window.innerHeight - Math.round(visualHeight * visualScale)) / 2)),
      targetWidth: Math.round(visualWidth * visualScale),
      sourceWidth: 694,
    };
  });

  if (!setup) {
    failures.push("solutions section or transition media was not found");
  } else {
    for (let index = 0; index < setup.count; index += 1) {
      const animationStart =
        setup.sectionTop + SOLUTION_CARD_TOP + index * SOLUTION_BLOCK_HEIGHT + 5;
      const releaseScroll =
        setup.sectionTop +
        SOLUTION_EXPANDED_IMAGE_TOP +
        index * SOLUTION_BLOCK_HEIGHT -
        setup.targetTop;
      const midpoint = animationStart + (releaseScroll - animationStart) * 0.45;

      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), animationStart - 80);
      await page.waitForTimeout(120);

      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), midpoint);
      await page.waitForTimeout(180);

      const directState = await page.evaluate((mediaIndex) => {
        const media = document.querySelectorAll(".solutions-transition-media")[mediaIndex];
        if (!media) return null;
        const rect = media.getBoundingClientRect();
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
      }, index);

      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), releaseScroll + 120);
      await page.waitForTimeout(160);

      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), setup.sectionBottom + 300);
      await page.waitForTimeout(120);

      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), midpoint);
      await page.waitForTimeout(180);

      const mediaState = await page.evaluate((mediaIndex) => {
        const media = document.querySelectorAll(".solutions-transition-media")[mediaIndex];
        if (!media) return null;
        const rect = media.getBoundingClientRect();
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          position: getComputedStyle(media).position,
          visibility: getComputedStyle(media).visibility,
        };
      }, index);

      if (!mediaState) {
        failures.push(`solutions media ${index + 1} was not found`);
        continue;
      }

      if (!directState) {
        failures.push(`solutions media ${index + 1} direct animation state was not found`);
        continue;
      }

      if (mediaState.visibility !== "visible") {
        failures.push(`solutions media ${index + 1} is ${mediaState.visibility} after scrolling back`);
      }

      if (mediaState.position !== "fixed") {
        failures.push(`solutions media ${index + 1} position is ${mediaState.position}, expected fixed during reverse animation`);
      }

      if (mediaState.width >= setup.targetWidth - 24) {
        failures.push(
          `solutions media ${index + 1} stayed full-size after scrolling back: width ${Math.round(
            mediaState.width
          )}, target ${setup.targetWidth}, source ${setup.sourceWidth}`
        );
      }

      if (mediaState.width <= setup.sourceWidth + 24) {
        failures.push(
          `solutions media ${index + 1} collapsed too far at midpoint: width ${Math.round(
            mediaState.width
          )}, source ${setup.sourceWidth}`
        );
      }

      for (const key of ["left", "top", "width", "height"]) {
        if (Math.abs(mediaState[key] - directState[key]) > 3) {
          failures.push(
            `solutions media ${index + 1} ${key} after return ${Math.round(
              mediaState[key]
            )} differs from direct animation ${Math.round(directState[key])}`
          );
        }
      }
    }
  }

  await browser.close();

  if (failures.length) {
    console.error("Solutions media reverse animation check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Solutions media reverse animation works after leaving the section.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
