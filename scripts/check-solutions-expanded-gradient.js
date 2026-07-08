/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const SOLUTION_CARD_TOP = 555;
const SOLUTION_EXPANDED_IMAGE_TOP = 1598;
const SOLUTION_BLOCK_HEIGHT = 2020.92;

async function readTransitionState(page, index) {
  return page.evaluate((mediaIndex) => {
    const media = document.querySelectorAll(".solutions-transition-media")[mediaIndex];
    const glow = document.querySelectorAll(".solutions-transition-glow")[mediaIndex];
    const reusedLight = glow?.querySelector(".solutions-glow-collapsed");
    const oldExpandedLight = glow?.querySelector(".solutions-glow-expanded");

    if (!media || !glow || !reusedLight) return null;

    const mediaStyles = getComputedStyle(media);
    const glowStyles = getComputedStyle(glow);
    const reusedStyles = getComputedStyle(reusedLight);

    return {
      mediaPosition: mediaStyles.position,
      mediaZIndex: Number(mediaStyles.zIndex),
      glowPosition: glowStyles.position,
      glowVisibility: glowStyles.visibility,
      glowOpacity: Number(glowStyles.opacity),
      glowZIndex: Number(glowStyles.zIndex),
      glowTransform: glowStyles.transform,
      hasOldExpandedLight: Boolean(oldExpandedLight),
      reusedFilter: reusedStyles.filter,
      reusedWidth: parseFloat(reusedStyles.width),
      reusedHeight: parseFloat(reusedStyles.height),
      ellipseColors: Array.from(reusedLight.querySelectorAll("span")).map(
        (ellipse) => getComputedStyle(ellipse).backgroundColor
      ),
    };
  }, index);
}

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
    const glows = Array.from(document.querySelectorAll(".solutions-transition-glow"));

    if (!section || media.length === 0) return null;

    const sectionRect = section.getBoundingClientRect();
    const visualWidth = 1436;
    const visualHeight = 809;
    const visualScale = Math.min(
      1,
      (window.innerWidth * 0.9) / visualWidth,
      (window.innerHeight * 0.92) / visualHeight
    );
    const targetTop = Math.max(
      32,
      Math.round((window.innerHeight - Math.round(visualHeight * visualScale)) / 2)
    );

    return {
      sectionTop: sectionRect.top + window.scrollY,
      count: media.length,
      glowCount: glows.length,
      targetTop,
    };
  });

  if (!setup) {
    failures.push("solutions section or transition media was not found");
  } else {
    if (setup.glowCount !== setup.count) {
      failures.push(
        `found ${setup.glowCount} transition glows for ${setup.count} transition media elements`
      );
    }

    for (let index = 0; index < setup.count; index += 1) {
      const animationStart =
        setup.sectionTop + SOLUTION_CARD_TOP + index * SOLUTION_BLOCK_HEIGHT + 5;
      const releaseScroll =
        setup.sectionTop +
        SOLUTION_EXPANDED_IMAGE_TOP +
        index * SOLUTION_BLOCK_HEIGHT -
        setup.targetTop;
      const midpoint = animationStart + (releaseScroll - animationStart) * 0.55;

      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), midpoint);
      await page.waitForTimeout(180);

      const fixedState = await readTransitionState(page, index);

      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), releaseScroll + 120);
      await page.waitForTimeout(180);

      const releasedState = await readTransitionState(page, index);

      if (!fixedState || !releasedState) {
        failures.push(`solutions reused gradient ${index + 1} was not found in both states`);
        continue;
      }

      if (fixedState.mediaPosition !== "fixed") {
        failures.push(`solutions media ${index + 1} is ${fixedState.mediaPosition}, expected fixed mid-expansion`);
      }

      if (fixedState.glowPosition !== "fixed") {
        failures.push(`solutions glow ${index + 1} is ${fixedState.glowPosition}, expected fixed mid-expansion`);
      }

      if (releasedState.glowPosition !== "absolute") {
        failures.push(`solutions glow ${index + 1} is ${releasedState.glowPosition}, expected absolute after release`);
      }

      for (const [label, state] of [
        ["mid-expansion", fixedState],
        ["released", releasedState],
      ]) {
        if (state.hasOldExpandedLight) {
          failures.push(`solutions glow ${index + 1} still renders the old expanded gradient in ${label}`);
        }

        if (state.glowTransform !== "none") {
          failures.push(
            `solutions glow ${index + 1} wrapper transform is ${state.glowTransform} in ${label}, expected none so the gradient is reused without resizing`
          );
        }

        if (state.glowVisibility !== "visible" || state.glowOpacity < 0.95) {
          failures.push(
            `solutions glow ${index + 1} is not visible in ${label}: visibility ${state.glowVisibility}, opacity ${state.glowOpacity}`
          );
        }

        if (state.glowZIndex >= state.mediaZIndex) {
          failures.push(
            `solutions glow ${index + 1} z-index ${state.glowZIndex} is not behind media z-index ${state.mediaZIndex} in ${label}`
          );
        }

        if (state.reusedFilter !== "blur(125px)") {
          failures.push(`solutions glow ${index + 1} filter is ${state.reusedFilter}, expected blur(125px)`);
        }

        if (Math.abs(state.reusedWidth - 820.87) > 1) {
          failures.push(`solutions glow ${index + 1} width is ${state.reusedWidth}, expected 820.87`);
        }

        if (Math.abs(state.reusedHeight - 710.82) > 1) {
          failures.push(`solutions glow ${index + 1} height is ${state.reusedHeight}, expected 710.82`);
        }

        const expectedColors = ["rgb(63, 161, 252)", "rgb(252, 204, 1)", "rgb(218, 127, 206)"];
        expectedColors.forEach((expected, colorIndex) => {
          if (state.ellipseColors[colorIndex] !== expected) {
            failures.push(
              `solutions glow ${index + 1} ellipse ${colorIndex + 1} is ${state.ellipseColors[colorIndex]}, expected ${expected}`
            );
          }
        });
      }
    }
  }

  await browser.close();

  if (failures.length) {
    console.error("Solutions expanded gradient check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Solutions expanded image reuses the same gradient as the collapsed image.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
