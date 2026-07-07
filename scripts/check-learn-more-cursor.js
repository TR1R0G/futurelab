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
    deviceScaleFactor: 1,
  });

  const failures = [];

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.locator(".solutions-section").scrollIntoViewIfNeeded();

  const state = await page.evaluate(async () => {
    const card = document.querySelector(".solutions-card-outline");
    const cursor = document.querySelector(".learn-more-cursor");

    if (!card || !cursor) {
      return { missing: true };
    }

    const nextFrame = () =>
      new Promise((resolve) => requestAnimationFrame(() => resolve()));

    const initial = {
      visible: cursor.getAttribute("data-visible"),
      transform: getComputedStyle(cursor).transform,
      inlineTransform: cursor.style.transform,
      scale: getComputedStyle(cursor).scale,
    };

    card.dispatchEvent(
      new PointerEvent("pointerenter", {
        bubbles: true,
        pointerType: "mouse",
        clientX: 640,
        clientY: 420,
      })
    );

    await nextFrame();

    const afterEnter = {
      visible: cursor.getAttribute("data-visible"),
      transform: getComputedStyle(cursor).transform,
      inlineTransform: cursor.style.transform,
      scale: getComputedStyle(cursor).scale,
      rect: cursor.getBoundingClientRect().toJSON(),
    };

    card.dispatchEvent(
      new PointerEvent("pointerleave", {
        bubbles: true,
        pointerType: "mouse",
        clientX: 0,
        clientY: 0,
      })
    );

    await nextFrame();

    const afterLeave = {
      visible: cursor.getAttribute("data-visible"),
      transform: getComputedStyle(cursor).transform,
      inlineTransform: cursor.style.transform,
      scale: getComputedStyle(cursor).scale,
      rect: cursor.getBoundingClientRect().toJSON(),
    };

    await new Promise((resolve) => setTimeout(resolve, 240));

    const afterFade = {
      visible: cursor.getAttribute("data-visible"),
      transform: getComputedStyle(cursor).transform,
      inlineTransform: cursor.style.transform,
      scale: getComputedStyle(cursor).scale,
      rect: cursor.getBoundingClientRect().toJSON(),
    };

    return {
      missing: false,
      initial,
      afterEnter,
      afterLeave,
      afterFade,
    };
  });

  if (state.missing) {
    failures.push("solutions card or learn-more cursor was not found");
  } else {
    if (state.initial.visible !== "false") {
      failures.push(`initial cursor visible state is ${state.initial.visible}, expected false`);
    }

    if (state.afterEnter.visible !== "true") {
      failures.push(`cursor visible state after pointerenter is ${state.afterEnter.visible}, expected true`);
    }

    if (!state.afterEnter.inlineTransform.includes("640px") || !state.afterEnter.inlineTransform.includes("420px")) {
      failures.push(
        `cursor transform after pointerenter is "${state.afterEnter.inlineTransform}", expected event coordinates 640px/420px`
      );
    }

    if (state.afterEnter.inlineTransform.includes("translate3d(0px, 0px")) {
      failures.push(`cursor moved through top-left after pointerenter: ${state.afterEnter.inlineTransform}`);
    }

    if (state.afterLeave.visible !== "false") {
      failures.push(`cursor visible state after pointerleave is ${state.afterLeave.visible}, expected false`);
    }

    if (state.afterLeave.inlineTransform !== state.afterEnter.inlineTransform) {
      failures.push(
        `cursor transform changed on pointerleave from "${state.afterEnter.inlineTransform}" to "${state.afterLeave.inlineTransform}"`
      );
    }

    if (state.afterFade.inlineTransform !== state.afterEnter.inlineTransform) {
      failures.push(
        `cursor transform changed after fade from "${state.afterEnter.inlineTransform}" to "${state.afterFade.inlineTransform}"`
      );
    }

    if (state.afterFade.scale !== "1") {
      failures.push(`cursor scale after fade is ${state.afterFade.scale}, expected 1 so it does not drift while disappearing`);
    }
  }

  await browser.close();

  if (failures.length) {
    console.error("LearnMoreCursor check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("LearnMoreCursor stays anchored to the pointer and hides without drifting.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
