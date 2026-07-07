/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const chromeExecutable = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.TEST_URL || "http://localhost:3000";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });

  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const state = await page.evaluate(() => {
      const heading = document.querySelector(".infrastructure-heading");
      const title = document.querySelector(".infrastructure-heading h2");
      const grid = document.querySelector(".infrastructure-cards");
      const cards = Array.from(document.querySelectorAll(".infrastructure-card"));

      const rectOf = (element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
        };
      };

      const lineRects = title
        ? (() => {
            const range = document.createRange();
            range.selectNodeContents(title);
            return Array.from(range.getClientRects()).map((rect) => ({
              width: rect.width,
              top: rect.top,
            }));
          })()
        : [];

      return {
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        heading: heading ? rectOf(heading) : null,
        headingComputedWidth: heading ? parseFloat(getComputedStyle(heading).width) : null,
        title: title ? rectOf(title) : null,
        titleComputedWidth: title ? parseFloat(getComputedStyle(title).width) : null,
        titleLineRects: lineRects,
        grid: grid ? rectOf(grid) : null,
        gridComputedWidth: grid ? parseFloat(getComputedStyle(grid).width) : null,
        cardWidths: cards.map((card) => parseFloat(getComputedStyle(card).width)),
        cardHeights: cards.map((card) => parseFloat(getComputedStyle(card).height)),
        cardText: cards.map((card) => {
          const title = card.querySelector("h3");
          const body = card.querySelector("p");
          const cardStyles = getComputedStyle(card);
          const titleStyles = title ? getComputedStyle(title) : null;
          const bodyStyles = body ? getComputedStyle(body) : null;

          return {
            cardContentWidth:
              parseFloat(cardStyles.width) -
              parseFloat(cardStyles.paddingLeft) -
              parseFloat(cardStyles.paddingRight),
            titleWidth: title ? parseFloat(titleStyles.width) : null,
            titleFontSize: titleStyles ? parseFloat(titleStyles.fontSize) : null,
            titleFontWeight: titleStyles ? Number(titleStyles.fontWeight) : null,
            bodyWidth: body ? parseFloat(bodyStyles.width) : null,
            bodyFontSize: bodyStyles ? parseFloat(bodyStyles.fontSize) : null,
            bodyFontWeight: bodyStyles ? Number(bodyStyles.fontWeight) : null,
          };
        }),
      };
    });

    if (!state.heading || !state.title || !state.grid) {
      failures.push(`${viewport.name}: infrastructure heading, title, or card grid was not found`);
      await page.close();
      continue;
    }

    if (state.scrollWidth > state.viewportWidth + 1) {
      failures.push(
        `${viewport.name}: horizontal overflow ${state.scrollWidth}px for viewport ${state.viewportWidth}px`
      );
    }

    if (viewport.width < 1440 && state.gridComputedWidth > state.viewportWidth + 1) {
      failures.push(
        `${viewport.name}: infrastructure grid width ${state.gridComputedWidth}px exceeds viewport ${state.viewportWidth}px`
      );
    }

    if (Math.abs(state.heading.left - state.grid.left) > 1) {
      failures.push(
        `${viewport.name}: infrastructure heading left ${state.heading.left}px does not align with cards left ${state.grid.left}px`
      );
    }

    if (viewport.width >= 1440) {
      const widthDelta = Math.abs(state.gridComputedWidth - 1436);
      const headingWidthDelta = Math.abs(state.headingComputedWidth - 1436);

      if (widthDelta > 2) {
        failures.push(
          `${viewport.name}: infrastructure grid width ${state.gridComputedWidth}px, expected about 1436px`
        );
      }

      if (headingWidthDelta > 2) {
        failures.push(
          `${viewport.name}: infrastructure heading width ${state.headingComputedWidth}px, expected about 1436px`
        );
      }

      if (Math.abs(state.titleComputedWidth - 800) > 3) {
        failures.push(
          `${viewport.name}: infrastructure title width ${state.titleComputedWidth}px, expected about 800px`
        );
      }

      if (state.titleLineRects.length !== 2) {
        failures.push(
          `${viewport.name}: infrastructure title should render on 2 lines, got ${state.titleLineRects.length}`
        );
      } else {
        const [firstLine, secondLine] = state.titleLineRects;

        if (firstLine.width < 740) {
          failures.push(
            `${viewport.name}: first infrastructure title line is too short (${firstLine.width}px)`
          );
        }

        if (secondLine.width > 430) {
          failures.push(
            `${viewport.name}: second infrastructure title line is too long (${secondLine.width}px)`
          );
        }
      }

      for (const [index, width] of state.cardWidths.entries()) {
        if (Math.abs(width - 452) > 3) {
          failures.push(
            `${viewport.name}: infrastructure card ${index + 1} width ${width}px, expected about 452px`
          );
        }
      }

      for (const [index, height] of state.cardHeights.entries()) {
        if (Math.abs(height - 636) > 4) {
          failures.push(
            `${viewport.name}: infrastructure card ${index + 1} height ${height}px, expected about 636px`
          );
        }
      }

      for (const [index, text] of state.cardText.entries()) {
        const expectedTitleWidth = state.cardWidths[index] * (2 / 3);
        const expectedBodyWidth = state.cardWidths[index] * 0.8;

        if (Math.abs(text.titleWidth - expectedTitleWidth) > 2) {
          failures.push(
            `${viewport.name}: infrastructure card ${index + 1} title width ${text.titleWidth}px, expected about ${expectedTitleWidth}px`
          );
        }

        if (Math.abs(text.titleFontSize - 33) > 0.5) {
          failures.push(
            `${viewport.name}: infrastructure card ${index + 1} title font size ${text.titleFontSize}px, expected 33px`
          );
        }

        if (text.titleFontWeight !== 600) {
          failures.push(
            `${viewport.name}: infrastructure card ${index + 1} title font weight ${text.titleFontWeight}, expected 600`
          );
        }

        if (Math.abs(text.bodyWidth - expectedBodyWidth) > 2) {
          failures.push(
            `${viewport.name}: infrastructure card ${index + 1} body width ${text.bodyWidth}px, expected about ${expectedBodyWidth}px`
          );
        }

        if (Math.abs(text.bodyFontSize - 23) > 0.5) {
          failures.push(
            `${viewport.name}: infrastructure card ${index + 1} body font size ${text.bodyFontSize}px, expected 23px`
          );
        }

        if (text.bodyFontWeight !== 500) {
          failures.push(
            `${viewport.name}: infrastructure card ${index + 1} body font weight ${text.bodyFontWeight}, expected 500`
          );
        }
      }
    }

    await page.close();
  }

  await browser.close();

  if (failures.length) {
    console.error("Infrastructure card width check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Infrastructure card widths match the shared section width.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
