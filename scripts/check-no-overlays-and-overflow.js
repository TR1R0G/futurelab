/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const viewports = [
  { name: "narrow-mobile", width: 320, height: 568 },
  { name: "compact-mobile", width: 360, height: 740 },
  { name: "mobile", width: 390, height: 844 },
  { name: "large-mobile", width: 430, height: 932 },
  { name: "small-tablet", width: 640, height: 900 },
  { name: "portrait-tablet", width: 768, height: 1024 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "small-desktop", width: 900, height: 768 },
  { name: "large-tablet", width: 1024, height: 768 },
  { name: "pre-laptop", width: 1199, height: 900 },
  { name: "small-laptop", width: 1280, height: 800 },
  { name: "mid-laptop", width: 1366, height: 768 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

function formatRect(rect) {
  return `left ${Math.round(rect.left)}, right ${Math.round(rect.right)}, top ${Math.round(rect.top)}, bottom ${Math.round(rect.bottom)}`;
}

function overlapArea(a, b) {
  if (!a || !b) return 0;
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function isMeaningfulRect(rect) {
  return rect && rect.width > 2 && rect.height > 2;
}

function intersectsViewport(rect, viewportWidth, viewportHeight) {
  return (
    isMeaningfulRect(rect) &&
    rect.right > 0 &&
    rect.bottom > 0 &&
    rect.left < viewportWidth &&
    rect.top < viewportHeight
  );
}

async function collectState(page) {
  return page.evaluate(() => {
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

    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) > 0.01 &&
        rect.width > 2 &&
        rect.height > 2
      );
    };

    const textTargets = Array.from(
      document.querySelectorAll(
        [
          ".hero-word",
          ".hero-description",
          ".solutions-heading",
          ".solutions-description",
          ".solutions-card-outline h3",
          ".solutions-card-outline p",
          ".experience-section h2",
          ".experience-section p",
          ".experience-stat-card-title",
          ".experience-stat-card-label",
          ".contact-section h2",
          ".contact-card",
          ".footer-section",
        ].join(",")
      )
    )
      .filter(isVisible)
      .map((element) => ({
        selector:
          element.className && typeof element.className === "string"
            ? `.${element.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".")}`
            : element.tagName.toLowerCase(),
        rect: rectOf(element),
        text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "",
      }));

    const fixedOverlays = Array.from(document.body.querySelectorAll("*"))
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.position !== "fixed") return false;
        if (!isVisible(element)) return false;
        if (style.pointerEvents === "none") return false;
        if (element.closest(".solutions-transition-media")) return false;
        if (element.matches(".realized-projects-section")) return false;
        return true;
      })
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === "string" ? element.className : "",
        id: element.id,
        rect: rectOf(element),
      }));

    const clippedText = textTargets.filter(({ rect }) => {
      if (!rect) return false;
      return rect.left < -1 || rect.right > window.innerWidth + 1;
    });

    const statClipping = Array.from(document.querySelectorAll(".experience-stat-card"))
      .map((card, index) => {
        const cardRect = rectOf(card);
        const labelRect = rectOf(card.querySelector(".experience-stat-card-label"));
        if (!cardRect || !labelRect || labelRect.bottom <= cardRect.bottom - 16) return null;
        return { index, card: cardRect, label: labelRect };
      })
      .filter(Boolean);

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
    ].map((selector) => ({ selector, rect: rectOf(document.querySelector(selector)) }));

    const pairTargets = [
      {
        name: "hero description/media",
        a: rectOf(document.querySelector(".hero-description")),
        b: rectOf(document.querySelector(".hero-image")),
      },
      {
        name: "hero actions/media",
        a: rectOf(document.querySelector(".hero-action-panel")),
        b: rectOf(document.querySelector(".hero-image")),
      },
      {
        name: "solutions copy/media",
        a: rectOf(document.querySelector(".solutions-card-outline p")),
        b: rectOf(document.querySelector(".solutions-transition-media")),
      },
    ];

    return {
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      fixedOverlays,
      clippedText,
      statClipping,
      sections,
      pairTargets,
    };
  });
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
    await page.waitForFunction(() => document.fonts?.ready ?? true);
    await page.waitForTimeout(1000);

    const pageMetrics = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
    }));
    const maxScroll = Math.max(0, pageMetrics.height - pageMetrics.viewportHeight);
    const scrollPositions = Array.from(
      new Set([0, 0.18, 0.34, 0.5, 0.66, 0.82, 1].map((ratio) => Math.round(maxScroll * ratio)))
    );

    for (const scrollY of scrollPositions) {
      await page.evaluate((nextY) => window.scrollTo(0, nextY), scrollY);
      await page.waitForTimeout(200);
      const state = await collectState(page);

      if (state.scrollWidth > state.viewportWidth + 1) {
        failures.push(
          `${viewport.name} horizontal overflow at scroll ${state.scrollY}: scrollWidth ${state.scrollWidth}, viewport ${state.viewportWidth}`
        );
      }

      for (const overlay of state.fixedOverlays) {
        if (!isMeaningfulRect(overlay.rect)) continue;
        failures.push(
          `${viewport.name} visible fixed overlay at scroll ${state.scrollY}: ${overlay.tag} ${overlay.id || overlay.className} ${formatRect(overlay.rect)}`
        );
      }

      for (const item of state.clippedText) {
        failures.push(
          `${viewport.name} text overflows viewport at scroll ${state.scrollY}: ${item.selector} ${formatRect(item.rect)} "${item.text}"`
        );
      }

      for (const item of state.statClipping) {
        failures.push(
          `${viewport.name} experience stat ${item.index} label clipped at scroll ${state.scrollY}: label ${formatRect(item.label)}, card ${formatRect(item.card)}`
        );
      }

      for (const pair of state.pairTargets) {
        if (
          !intersectsViewport(pair.a, state.viewportWidth, state.viewportHeight) ||
          !intersectsViewport(pair.b, state.viewportWidth, state.viewportHeight)
        ) {
          continue;
        }

        const area = overlapArea(pair.a, pair.b);
        if (area > 64) {
          failures.push(
            `${viewport.name} ${pair.name} overlap at scroll ${state.scrollY}: area ${Math.round(area)}, a ${formatRect(pair.a)}, b ${formatRect(pair.b)}`
          );
        }
      }
    }

    const sectionState = await collectState(page);
    for (let index = 0; index < sectionState.sections.length - 1; index += 1) {
      const current = sectionState.sections[index];
      const next = sectionState.sections[index + 1];
      if (current.rect && next.rect && current.rect.bottom > next.rect.top + 1) {
        failures.push(
          `${viewport.name} sections overlap: ${current.selector} bottom ${Math.round(
            current.rect.bottom
          )}, ${next.selector} top ${Math.round(next.rect.top)}`
        );
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
