/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "laptop", width: 1440, height: 900 },
];

function formatMetric(metric) {
  return `${metric.label}: x delta ${metric.deltaX.toFixed(1)}, y delta ${metric.deltaY.toFixed(1)}`;
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });

  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${baseUrl}?lang=ru`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    const metrics = await page.evaluate(() => {
      const targets = Array.from(
        document.querySelectorAll("button, a")
      ).filter((element) => element.textContent?.trim() === "Обсудить проект");

      return targets.map((element, index) => {
        const buttonRect = element.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(element);
        const textRect = range.getBoundingClientRect();
        range.detach();

        return {
          label: `${element.tagName.toLowerCase()}#${index}`,
          deltaX:
            Math.abs(buttonRect.left + buttonRect.width / 2 - (textRect.left + textRect.width / 2)),
          deltaY:
            Math.abs(buttonRect.top + buttonRect.height / 2 - (textRect.top + textRect.height / 2)),
          buttonHeight: buttonRect.height,
          textHeight: textRect.height,
        };
      });
    });

    if (metrics.length < 2) {
      failures.push(`${viewport.name}: expected at least two "Обсудить проект" controls, found ${metrics.length}`);
    }

    for (const metric of metrics) {
      if (metric.deltaX > 1 || metric.deltaY > 2) {
        failures.push(`${viewport.name} ${formatMetric(metric)}`);
      }

      if (metric.textHeight <= 0 || metric.buttonHeight <= 0) {
        failures.push(`${viewport.name} ${metric.label}: invalid button/text dimensions`);
      }
    }

    await page.close();
  }

  await browser.close();

  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
