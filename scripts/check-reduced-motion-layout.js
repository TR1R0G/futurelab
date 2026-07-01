/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

function overlaps(a, b) {
  if (!a || !b) return false;
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });

  const failures = [];

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({
      viewport,
      reducedMotion: "reduce",
    });

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);

    const state = await page.evaluate(({ viewport }) => {
      const rectOf = (element) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
      };

      const galleryTrack = document.querySelector(".infrastructure-gallery-track");
      const academyCard = document.querySelector(".academy-card");
      const academyPrograms = document.querySelector(".academy-programs-stage");
      const firstProgramCard = document.querySelector(".academy-programs-stage .program-card");
      const realizedSection = document.querySelector(".realized-projects-section");
      const realizedCard = document.querySelector(".realized-project-card");

      return {
        viewport,
        galleryTransform: galleryTrack ? getComputedStyle(galleryTrack).transform : null,
        academyProgramVisibility: academyPrograms
          ? getComputedStyle(academyPrograms).visibility
          : null,
        academyCardRect: rectOf(academyCard),
        programCardRect: rectOf(firstProgramCard),
        realizedSectionRect: rectOf(realizedSection),
        realizedCardRect: rectOf(realizedCard),
      };
    }, { viewport });

    if (viewport.width >= 1024 && (!state.galleryTransform || state.galleryTransform === "none")) {
      failures.push(
        `Carousel is static in reduced-motion mode at ${viewport.width}x${viewport.height}`
      );
    }

    if (
      state.academyProgramVisibility !== "hidden" &&
      overlaps(state.academyCardRect, state.programCardRect)
    ) {
      failures.push(
        `Academy cards overlap program cards at ${viewport.width}x${viewport.height}`
      );
    }

    if (
      state.realizedSectionRect &&
      state.realizedCardRect &&
      state.realizedCardRect.bottom > state.realizedSectionRect.bottom + 1
    ) {
      failures.push(
        `Realized card is clipped at ${viewport.width}x${viewport.height}: card bottom ${Math.round(
          state.realizedCardRect.bottom
        )}, section bottom ${Math.round(state.realizedSectionRect.bottom)}`
      );
    }

    if (viewport.width >= 1024) {
      const expandedState = await page.evaluate(async () => {
        const section = document.querySelector(".expanded-image-section");
        if (!section) return null;

        const top = section.getBoundingClientRect().top + window.scrollY;
        const maxScroll = Math.max(1, section.scrollHeight - window.innerHeight);
        window.scrollTo(0, top + maxScroll * 0.85);
        await new Promise((resolve) => window.setTimeout(resolve, 700));

        const frame = document.querySelector(".expanded-image-section [class*='shadow-2xl']");
        const text = document.querySelector(".directions-statement-copy");
        const source = document.querySelector(".directions-inline-image");

        return {
          frameOpacity: frame ? Number(getComputedStyle(frame).opacity) : 0,
          textOpacity: text ? Number(getComputedStyle(text).opacity) : 1,
          textTransform: text ? getComputedStyle(text).transform : "none",
          sourceOpacity: source ? Number(getComputedStyle(source).opacity) : 1,
        };
      });

      if (!expandedState || expandedState.frameOpacity < 0.9) {
        failures.push(
          `Expanded statement image stays hidden in reduced-motion mode at ${viewport.width}x${viewport.height}`
        );
      }

      if (
        expandedState &&
        expandedState.textOpacity > 0.4 &&
        expandedState.textTransform === "none"
      ) {
        failures.push(
          `Statement text does not exit during reduced-motion scroll at ${viewport.width}x${viewport.height}`
        );
      }

      if (expandedState && expandedState.sourceOpacity > 0.1) {
        failures.push(
          `Inline statement image remains visible over expanded frame at ${viewport.width}x${viewport.height}`
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
