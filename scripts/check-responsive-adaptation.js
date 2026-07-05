/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "small-desktop", width: 900, height: 768 },
  { name: "laptop", width: 1440, height: 900 },
];

function formatRect(rect) {
  return `left ${Math.round(rect.left)}, right ${Math.round(rect.right)}, top ${Math.round(rect.top)}, bottom ${Math.round(rect.bottom)}`;
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });

  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3500);

    const state = await page.evaluate(() => {
      const rectOf = (element) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
      };

      const wordRects = Array.from(document.querySelectorAll(".hero-word")).map(rectOf);
      const statStates = Array.from(document.querySelectorAll(".experience-stat-card")).map(
        (card) => ({
          card: rectOf(card),
          title: rectOf(card.querySelector(".experience-stat-card-title")),
          label: rectOf(card.querySelector(".experience-stat-card-label")),
        })
      );

      return {
        viewportWidth: window.innerWidth,
        heroHeader: rectOf(document.querySelector(".hero-header")),
        heroHeaderButton: rectOf(document.querySelector(".hero-header-button")),
        heroLanguage: rectOf(document.querySelector(".hero-language")),
        heroCopy: rectOf(document.querySelector(".hero-copy")),
        heroActionPanel: rectOf(document.querySelector(".hero-action-panel")),
        wordRects,
        statStates,
        contactCard: rectOf(document.querySelector(".contact-card")),
        footer: rectOf(document.querySelector(".footer-section")),
      };
    });

    if (viewport.name === "laptop") {
      if (Math.round(state.heroCopy.left) !== 136 || Math.round(state.heroCopy.width) !== 1025) {
        failures.push(
          `Laptop hero baseline changed: ${formatRect(state.heroCopy)}, width ${Math.round(
            state.heroCopy.width
          )}`
        );
      }
      await page.close();
      continue;
    }

    for (const [index, rect] of state.wordRects.entries()) {
      if (rect.left < -1 || rect.right > state.viewportWidth + 1) {
        failures.push(
          `${viewport.name} hero word ${index} overflows viewport: ${formatRect(rect)} of width ${state.viewportWidth}`
        );
      }
    }

    for (const [name, rect] of [
      ["header", state.heroHeader],
      ["actions", state.heroActionPanel],
    ]) {
      if (rect.left < -1 || rect.right > state.viewportWidth + 1) {
        failures.push(
          `${viewport.name} hero ${name} overflows viewport: ${formatRect(rect)} of width ${state.viewportWidth}`
        );
      }
    }

    if (
      state.heroHeaderButton &&
      state.heroLanguage &&
      state.heroHeaderButton.right > state.heroLanguage.left - 12
    ) {
      failures.push(
        `${viewport.name} hero header CTA overlaps language switcher: CTA ${formatRect(
          state.heroHeaderButton
        )}, language ${formatRect(state.heroLanguage)}`
      );
    }

    for (const [index, stat] of state.statStates.entries()) {
      if (stat.label && stat.card && stat.label.bottom > stat.card.bottom - 16) {
        failures.push(
          `${viewport.name} experience stat ${index} label is clipped: label ${formatRect(
            stat.label
          )}, card ${formatRect(stat.card)}`
        );
      }
    }

    if (state.contactCard && state.footer && state.footer.top < state.contactCard.bottom + 40) {
      failures.push(
        `${viewport.name} footer overlaps contact card: footer top ${Math.round(
          state.footer.top
        )}, card bottom ${Math.round(state.contactCard.bottom)}`
      );
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
