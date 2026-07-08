/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

function closeEnough(actual, expected, tolerance = 1) {
  return Math.abs(actual - expected) <= tolerance;
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
  await page.locator(".directions-statement").scrollIntoViewIfNeeded();

  const state = await page.evaluate(() => {
    const light = document.querySelector(".directions-statement-light");
    const ellipses = light ? Array.from(light.querySelectorAll("span")) : [];

    if (!light || ellipses.length !== 3) return null;

    const read = (element) => {
      const rect = element.getBoundingClientRect();
      const styles = getComputedStyle(element);
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        cssLeft: parseFloat(styles.left),
        cssTop: parseFloat(styles.top),
        cssWidth: parseFloat(styles.width),
        cssHeight: parseFloat(styles.height),
        filter: styles.filter,
        transform: styles.transform,
        background: styles.backgroundColor,
      };
    };

    return {
      viewportWidth: window.innerWidth,
      light: read(light),
      ellipses: ellipses.map(read),
    };
  });

  if (!state) {
    failures.push("directions statement light or its ellipses were not found");
  } else {
    const visualCenter = (state.light.left + state.light.right) / 2;
    const pageCenter = state.viewportWidth / 2;

    if (!closeEnough(visualCenter, pageCenter, 3)) {
      failures.push(`light visual center ${visualCenter}, expected page center ${pageCenter}`);
    }
    if (!closeEnough(state.light.cssWidth, 872.67, 1)) {
      failures.push(`light width ${state.light.cssWidth}, expected 872.67`);
    }
    if (!closeEnough(state.light.cssHeight, 755.68, 1)) {
      failures.push(`light height ${state.light.cssHeight}, expected 755.68`);
    }
    if (state.light.filter !== "blur(175px)") {
      failures.push(`light filter ${state.light.filter}, expected blur(175px)`);
    }
    if (state.light.transform === "none") {
      failures.push("light transform is missing");
    }

    const expectedEllipses = [
      { left: 225.23, top: 183.61, width: 231.6, height: 700.62, background: "rgb(63, 161, 252)" },
      { left: 107.48, top: 449.7, width: 231.6, height: 674.38, background: "rgb(252, 204, 1)" },
      { left: 107.48, top: 117.86, width: 293.53, height: 578.17, background: "rgb(218, 127, 206)" },
    ];

    state.ellipses.forEach((ellipse, index) => {
      const expected = expectedEllipses[index];
      if (!closeEnough(ellipse.cssLeft, expected.left, 1)) {
        failures.push(`ellipse ${index + 1} left ${ellipse.cssLeft}, expected ${expected.left}`);
      }
      if (!closeEnough(ellipse.cssTop, expected.top, 1)) {
        failures.push(`ellipse ${index + 1} top ${ellipse.cssTop}, expected ${expected.top}`);
      }
      if (!closeEnough(ellipse.cssWidth, expected.width, 1)) {
        failures.push(`ellipse ${index + 1} width ${ellipse.cssWidth}, expected ${expected.width}`);
      }
      if (!closeEnough(ellipse.cssHeight, expected.height, 1)) {
        failures.push(`ellipse ${index + 1} height ${ellipse.cssHeight}, expected ${expected.height}`);
      }
      if (ellipse.background !== expected.background) {
        failures.push(`ellipse ${index + 1} background ${ellipse.background}, expected ${expected.background}`);
      }
    });
  }

  await browser.close();

  if (failures.length) {
    console.error("Directions statement light check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Directions statement light is centered and matches the provided gradient design.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
