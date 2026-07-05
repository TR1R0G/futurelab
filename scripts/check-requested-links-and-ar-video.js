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

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  const firstProgramCta = page.locator(".program-card").first().locator("a");
  await firstProgramCta.waitFor({ state: "attached", timeout: 5000 });
  const programHref = await firstProgramCta.getAttribute("href");
  if (programHref !== "https://creativetech.uz/") {
    throw new Error(`Expected first program CTA to use https://creativetech.uz/, got ${programHref}`);
  }

  await page.locator(".solutions-section").scrollIntoViewIfNeeded();
  const arCard = page.locator(".solutions-card-outline").nth(1);
  await arCard.waitFor({ state: "attached", timeout: 5000 });

  const arHref = await arCard.getAttribute("href");
  if (arHref !== "https://ar.nazzar.group/") {
    throw new Error(`Expected AR experts card href https://ar.nazzar.group/, got ${arHref}`);
  }

  const arFrame = page.locator(".solutions-transition-media").nth(1).locator("iframe");
  await arFrame.waitFor({ state: "attached", timeout: 5000 });
  const frameSrc = await arFrame.getAttribute("src");
  if (!frameSrc || !frameSrc.includes("youtube.com/embed/h1uy9G9y8lY")) {
    throw new Error(`Expected AR experts iframe to use YouTube video h1uy9G9y8lY, got ${frameSrc}`);
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
