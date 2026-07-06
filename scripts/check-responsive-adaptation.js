/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const viewports = [
  { name: "narrow-mobile", width: 320, height: 568 },
  { name: "mobile", width: 390, height: 844 },
  { name: "large-mobile", width: 430, height: 932 },
  { name: "small-tablet", width: 640, height: 900 },
  { name: "portrait-tablet", width: 768, height: 1024 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "small-desktop", width: 900, height: 768 },
  { name: "large-tablet", width: 1024, height: 768 },
  { name: "pre-laptop", width: 1199, height: 900 },
  { name: "laptop", width: 1440, height: 900 },
];

function formatRect(rect) {
  return `left ${Math.round(rect.left)}, right ${Math.round(rect.right)}, top ${Math.round(rect.top)}, bottom ${Math.round(rect.bottom)}`;
}

function overlaps(a, b, gap = 0) {
  if (!a || !b) return false;
  return (
    a.left < b.right + gap &&
    a.right + gap > b.left &&
    a.top < b.bottom + gap &&
    a.bottom + gap > b.top
  );
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
    await page.waitForTimeout(1000);

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
      const firstSolutionCard = document.querySelector(".solutions-card-outline");
      const firstSolutionDescription = firstSolutionCard?.querySelector("p");
      const firstSolutionMedia = document.querySelector(".solutions-transition-media");
      const sections = [
        ".hero-section",
        ".ecosystem-section",
        ".infrastructure-section",
        ".academy-section",
        ".directions-section",
        ".solutions-section",
        ".realized-projects-section",
        ".experience-section",
        ".contact-section",
        ".footer-section",
      ].map((selector) => ({
        selector,
        rect: rectOf(document.querySelector(selector)),
      }));

      return {
        viewportWidth: window.innerWidth,
        heroHeader: rectOf(document.querySelector(".hero-header")),
        heroHeaderButton: rectOf(document.querySelector(".hero-header-button")),
        heroLanguage: rectOf(document.querySelector(".hero-language")),
        heroCopy: rectOf(document.querySelector(".hero-copy")),
        heroDescription: rectOf(document.querySelector(".hero-description")),
        heroActionPanel: rectOf(document.querySelector(".hero-action-panel")),
        heroImage: rectOf(document.querySelector(".hero-image")),
        experienceTitle: rectOf(document.querySelector(".experience-section h2")),
        wordRects,
        statStates,
        firstSolutionCard: rectOf(firstSolutionCard),
        firstSolutionDescription: rectOf(firstSolutionDescription),
        firstSolutionMedia: rectOf(firstSolutionMedia),
        solutionsDescription: rectOf(document.querySelector(".solutions-description")),
        sections,
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

    for (let index = 0; index < state.sections.length - 1; index += 1) {
      const current = state.sections[index];
      const next = state.sections[index + 1];
      if (current.rect && next.rect && current.rect.bottom > next.rect.top + 1) {
        failures.push(
          `${viewport.name} sections overlap: ${current.selector} bottom ${Math.round(
            current.rect.bottom
          )}, ${next.selector} top ${Math.round(next.rect.top)}`
        );
      }
    }

    for (const [index, rect] of state.wordRects.entries()) {
      if (rect.left < -1 || rect.right > state.viewportWidth + 1) {
        failures.push(
          `${viewport.name} hero word ${index} overflows viewport: ${formatRect(rect)} of width ${state.viewportWidth}`
        );
      }
    }

    for (const [name, rect] of [
      ["hero header", state.heroHeader],
      ["hero actions", state.heroActionPanel],
      ["experience title", state.experienceTitle],
    ]) {
      if (rect.left < -1 || rect.right > state.viewportWidth + 1) {
        failures.push(
          `${viewport.name} ${name} overflows viewport: ${formatRect(rect)} of width ${state.viewportWidth}`
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

    if (overlaps(state.heroDescription, state.heroImage, 8)) {
      failures.push(
        `${viewport.name} hero description overlaps media: description ${formatRect(
          state.heroDescription
        )}, media ${formatRect(state.heroImage)}`
      );
    }

    if (overlaps(state.heroActionPanel, state.heroImage, 8)) {
      failures.push(
        `${viewport.name} hero CTA overlaps media: CTA ${formatRect(
          state.heroActionPanel
        )}, media ${formatRect(state.heroImage)}`
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

    if (
      state.solutionsDescription &&
      state.firstSolutionCard &&
      state.firstSolutionCard.top > state.solutionsDescription.bottom + 140
    ) {
      failures.push(
        `${viewport.name} solutions card spacing is not adaptive: description bottom ${Math.round(
          state.solutionsDescription.bottom
        )}, card top ${Math.round(state.firstSolutionCard.top)}`
      );
    }

    if (
      state.firstSolutionDescription &&
      state.firstSolutionMedia &&
      state.firstSolutionDescription.bottom > state.firstSolutionMedia.top - 24
    ) {
      failures.push(
        `${viewport.name} solutions media overlaps copy: copy ${formatRect(
          state.firstSolutionDescription
        )}, media ${formatRect(state.firstSolutionMedia)}`
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
