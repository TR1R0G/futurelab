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
    deviceScaleFactor: 1,
  });
  const failures = [];

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const setup = await page.evaluate(() => {
    const section = document.querySelector(".expanded-image-section");
    if (!section) return null;
    const rect = section.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      maxScroll: Math.max(1, section.scrollHeight - window.innerHeight),
    };
  });

  if (!setup) {
    failures.push("expanded image section was not found");
  } else {
    const samples = [];

    for (const progress of [0.45, 0.96]) {
      await page.evaluate(
        ({ top, maxScroll, progress }) => window.scrollTo(0, top + maxScroll * progress),
        { ...setup, progress }
      );
      await page.waitForTimeout(180);

      const state = await page.evaluate((progress) => {
        const gradient = document.querySelector(".expanded-image-stage .video-gradient-field");
        const light = document.querySelector(".expanded-image-stage .hero-light-video");
        const frame = document.querySelector(".expanded-image-stage [aria-label]");
        const frameContainer = frame?.closest("div");

        if (!gradient || !light || !frameContainer) return null;

        const lightRect = light.getBoundingClientRect();
        const frameRect = frameContainer.getBoundingClientRect();
        const gradientStyles = getComputedStyle(gradient);
        const lightStyles = getComputedStyle(light);

        return {
          progress,
          gradientOpacity: Number(gradientStyles.opacity),
          gradientScale: gradientStyles.scale,
          lightOpacity: Number(lightStyles.opacity),
          lightCssLeft: parseFloat(lightStyles.left),
          lightCssTop: parseFloat(lightStyles.top),
          lightCssWidth: parseFloat(lightStyles.width),
          lightCssHeight: parseFloat(lightStyles.height),
          lightCenter: (lightRect.left + lightRect.right) / 2,
          lightWidth: lightRect.width,
          frameHeight: frameRect.height,
          frameTop: frameRect.top,
          frameCenter: (frameRect.left + frameRect.right) / 2,
          viewportHeight: window.innerHeight,
          viewportCenter: window.innerWidth / 2,
        };
      }, progress);

      samples.push(state);
    }

    for (const state of samples) {
      if (!state) {
        failures.push("expanded image gradient, light, or frame was not found");
        continue;
      }

      if (state.progress > 0.9 && state.frameHeight < state.viewportHeight * 0.75) {
          failures.push(
            `expanded frame height ${Math.round(state.frameHeight)}px is not in the full-height state`
          );
        }

        if (state.gradientOpacity < 0.95) {
          failures.push(
            `expanded image gradient opacity at progress ${state.progress} is ${state.gradientOpacity}, expected it to stay visible`
          );
        }

        if (state.gradientScale !== "1" && state.gradientScale !== "none") {
          failures.push(
            `expanded image gradient scale at progress ${state.progress} is ${state.gradientScale}, expected 1 so it matches the statement gradient`
          );
        }

        const expectedLightLeft = state.viewportCenter - 872.67 / 2 - 70.66;
        const expectedLightTop = state.viewportHeight / 2 - 451.305;

        if (Math.abs(state.lightCssLeft - expectedLightLeft) > 2) {
          failures.push(
            `expanded image light left at progress ${state.progress} is ${state.lightCssLeft}, expected ${expectedLightLeft}`
          );
        }

        if (Math.abs(state.lightCssTop - expectedLightTop) > 3) {
          failures.push(
            `expanded image light top at progress ${state.progress} is ${state.lightCssTop}, expected about ${expectedLightTop}`
          );
        }

        if (Math.abs(state.lightCssWidth - 872.67) > 1) {
          failures.push(
            `expanded image light width at progress ${state.progress} is ${state.lightCssWidth}, expected 872.67`
          );
        }

        if (Math.abs(state.lightCssHeight - 755.68) > 1) {
          failures.push(
            `expanded image light height at progress ${state.progress} is ${state.lightCssHeight}, expected 755.68`
          );
        }

        if (state.lightOpacity < 0.75) {
          failures.push(
            `expanded image light opacity at progress ${state.progress} is ${state.lightOpacity}, expected it to stay visible behind the video`
          );
        }
    }
  }

  await browser.close();

  if (failures.length) {
    console.error("Expanded image gradient check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Expanded image gradient stays visible behind the full-height video.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
