/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "pre-laptop", width: 1199, height: 900 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

function formatGap(value) {
  return `${Math.round(value)}px`;
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });

  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.locator(".directions-post-image").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    const state = await page.evaluate(() => {
      const rectOf = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          paddingBottom: parseFloat(style.paddingBottom),
        };
      };

      const directions = rectOf(".directions-section");
      const post = rectOf(".directions-post-image");
      const divider = rectOf(".directions-post-image > *:last-child");
      const solutions = rectOf(".solutions-section");

      return {
        directions,
        post,
        divider,
        solutions,
        lineToPostBottom: post && divider ? post.bottom - divider.bottom : null,
        postToSectionBottom: directions && post ? directions.bottom - post.bottom : null,
        sectionToSolutionsTop: directions && solutions ? solutions.top - directions.bottom : null,
      };
    });

    if (!state.post || !state.divider || !state.directions) {
      failures.push(`${viewport.name}: could not find directions post image layout elements`);
      await page.close();
      continue;
    }

    if (state.post.paddingBottom > 1) {
      failures.push(
        `${viewport.name}: directions-post-image still has bottom padding ${formatGap(
          state.post.paddingBottom
        )}`
      );
    }

    if (state.lineToPostBottom > 16) {
      failures.push(
        `${viewport.name}: decorative line leaves ${formatGap(
          state.lineToPostBottom
        )} blank space inside directions-post-image`
      );
    }

    if (state.postToSectionBottom > 16) {
      failures.push(
        `${viewport.name}: directions section leaves ${formatGap(
          state.postToSectionBottom
        )} blank space after directions-post-image`
      );
    }

    if (state.sectionToSolutionsTop < -1) {
      failures.push(
        `${viewport.name}: solutions section overlaps directions section by ${formatGap(
          -state.sectionToSolutionsTop
        )}`
      );
    }

    await page.close();
  }

  await browser.close();

  if (failures.length) {
    console.error("Directions post-image spacing check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Directions post-image spacing is tight.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
