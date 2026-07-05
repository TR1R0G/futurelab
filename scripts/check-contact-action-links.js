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

  const contacts = page.locator("#contacts");
  await contacts.waitFor({ state: "attached", timeout: 5000 });

  const discussLinks = page.locator('a:has-text("Обсудить проект")');
  const discussCount = await discussLinks.count();
  if (discussCount < 2) {
    throw new Error(`Expected at least two "Обсудить проект" links, got ${discussCount}`);
  }

  for (let index = 0; index < discussCount; index += 1) {
    const href = await discussLinks.nth(index).getAttribute("href");
    if (href !== "#contacts") {
      throw new Error(`Expected "Обсудить проект" link ${index} to use #contacts, got ${href}`);
    }
  }

  const experienceHref = await page.locator('a:has-text("Перейти")').first().getAttribute("href");
  if (experienceHref !== "https://www.nazzar.group/") {
    throw new Error(`Expected "Перейти" href https://www.nazzar.group/, got ${experienceHref}`);
  }

  const contactEmailHref = await page
    .locator('.contact-item-mail a:has-text("contact@future-lab.uz")')
    .first()
    .getAttribute("href");
  if (contactEmailHref !== "mailto:contact@future-lab.uz") {
    throw new Error(`Expected contact email mailto link, got ${contactEmailHref}`);
  }

  const footerEmailHref = await page
    .locator('footer a:has-text("pr@nazzar.tech")')
    .first()
    .getAttribute("href");
  if (footerEmailHref !== "mailto:pr@nazzar.tech") {
    throw new Error(`Expected footer email mailto link, got ${footerEmailHref}`);
  }

  const telegramHref = await page
    .locator('.contact-item-telegram a:has-text("@nazzar_group")')
    .first()
    .getAttribute("href");
  if (telegramHref !== "https://t.me/nazzar_group") {
    throw new Error(`Expected Telegram link https://t.me/nazzar_group, got ${telegramHref}`);
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
