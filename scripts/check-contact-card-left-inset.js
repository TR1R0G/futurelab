/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const viewports = [
  { name: "mobile", width: 390, height: 844, maxInset: 18 },
  { name: "tablet", width: 820, height: 1180, maxInset: 28 },
  { name: "desktop", width: 1280, height: 800, maxInset: 45 },
  { name: "large-desktop", width: 1440, height: 900, maxInset: 45 },
];

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });

  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.locator("#contacts").scrollIntoViewIfNeeded();

    const state = await page.evaluate(() => {
      const card = document.querySelector(".contact-card");
      const title = card?.querySelector("h3");
      const text = card?.querySelector("h3 + p");

      if (!card || !title || !text) return null;

      const rectOf = (element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
        };
      };

      return {
        card: rectOf(card),
        title: rectOf(title),
        text: rectOf(text),
      };
    });

    if (!state) {
      failures.push(`${viewport.name}: contact card title/text was not found`);
      await page.close();
      continue;
    }

    const titleInset = state.title.left - state.card.left;
    const textInset = state.text.left - state.card.left;

    if (titleInset > viewport.maxInset) {
      failures.push(
        `${viewport.name}: contact card title inset ${Math.round(titleInset)}px, expected <= ${viewport.maxInset}px`
      );
    }

    if (textInset > viewport.maxInset) {
      failures.push(
        `${viewport.name}: contact card text inset ${Math.round(textInset)}px, expected <= ${viewport.maxInset}px`
      );
    }

    await page.close();
  }

  await browser.close();

  if (failures.length) {
    console.error("Contact card left inset check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Contact card title and text start close to the left edge.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
