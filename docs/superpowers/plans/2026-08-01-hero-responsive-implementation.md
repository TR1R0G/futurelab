# Hero Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing FutureLab Hero fully responsive from 360px mobile screens through 2560px large desktops without changing approved content, links, media, branding, or desktop design.

**Architecture:** Replace the overlapping Hero breakpoint overrides with one Hero-specific layout system that has mobile/short-landscape, tablet, laptop, desktop, and large-desktop states. Keep one component and one `h1`, use normal flow where the viewport cannot contain the absolute composition, and refactor the scroll transition to measure real element boxes inside `gsap.matchMedia()` contexts. Protect the behavior with Playwright geometry tests that exercise the real rendered page in both languages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 CSS, GSAP 3.15, ScrollTrigger, Playwright.

## Global Constraints

- Do not change approved RU or EN text.
- Do not change CTA destinations or behavior.
- Do not change image or video sources.
- Do not change component order, colors, branding, or typography hierarchy.
- Preserve the approved desktop composition at 1600px and above.
- Keep one Hero component and one semantic `h1`.
- Do not add negative margins, viewport-specific transforms, clipping fixes, or per-device hacks.
- Use test-first development: each production change follows a failing browser test.

---

### Task 1: Add a Real Hero Geometry Regression Harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `playwright.config.ts`
- Create: `tests/hero-responsive.spec.ts`

**Interfaces:**
- Consumes: `/ru` and `/en` application routes, `.hero-section`, `.hero-stage`, `.hero-header`, `.hero-title`, `.hero-description`, `.hero-action-panel`, `.hero-image`, and `.hero-button`.
- Produces: `npm run test:hero`, a browser-level contract that later tasks must satisfy.

- [ ] **Step 1: Install the test runner and add the script**

Run:

```bash
npm install --save-dev @playwright/test
```

Add this script to `package.json`:

```json
"test:hero": "playwright test tests/hero-responsive.spec.ts"
```

- [ ] **Step 2: Configure the production-like browser test server**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/en',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
```

- [ ] **Step 3: Write the failing initial-layout geometry test**

Create `tests/hero-responsive.spec.ts` with literal viewport expectations:

```ts
import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 667, height: 375 },
  { width: 720, height: 900 },
  { width: 768, height: 1024 },
  { width: 960, height: 900 },
  { width: 1024, height: 768 },
  { width: 1200, height: 900 },
  { width: 1366, height: 768 },
  { width: 1400, height: 900 },
  { width: 1600, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

async function waitForHero(page: Page) {
  await page.locator('.hero-section').waitFor({ state: 'visible' })
  await page.waitForFunction(() =>
    !document.documentElement.classList.contains('is-preloading'),
  )
  await page.evaluate(() => document.fonts.ready)
}

function intersects(a: DOMRect, b: DOMRect) {
  return !(
    a.right <= b.left ||
    b.right <= a.left ||
    a.bottom <= b.top ||
    b.bottom <= a.top
  )
}

for (const language of ['en', 'ru'] as const) {
  for (const viewport of viewports) {
    test(`${language} Hero fits at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto(`/${language}`)
      await waitForHero(page)

      const result = await page.evaluate(() => {
        const section = document.querySelector<HTMLElement>('.hero-section')!
        const title = document.querySelector<HTMLElement>('.hero-title')!
        const description = document.querySelector<HTMLElement>('.hero-description')!
        const actions = document.querySelector<HTMLElement>('.hero-action-panel')!
        const image = document.querySelector<HTMLElement>('.hero-image')!
        const buttons = [...document.querySelectorAll<HTMLElement>('.hero-button')]
        const sectionRect = section.getBoundingClientRect()
        const rects = [title, description, actions, image].map((element) =>
          element.getBoundingClientRect(),
        )

        return {
          horizontalOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          sectionWidth: sectionRect.width,
          viewportWidth: window.innerWidth,
          rects: rects.map(({ left, right, top, bottom, width, height }) => ({
            left,
            right,
            top,
            bottom,
            width,
            height,
          })),
          buttonHeights: buttons.map((button) =>
            button.getBoundingClientRect().height,
          ),
        }
      })

      expect(result.horizontalOverflow).toBe(false)
      expect(result.sectionWidth).toBeLessThanOrEqual(result.viewportWidth + 0.5)
      for (const rect of result.rects) {
        expect(rect.left).toBeGreaterThanOrEqual(-0.5)
        expect(rect.right).toBeLessThanOrEqual(result.viewportWidth + 0.5)
        expect(rect.width).toBeGreaterThan(0)
        expect(rect.height).toBeGreaterThan(0)
      }
      for (const height of result.buttonHeights) {
        expect(height).toBeGreaterThanOrEqual(44)
      }
    })
  }
}
```

- [ ] **Step 4: Run the test and verify the current Hero fails for the reproduced defects**

Run:

```bash
npx playwright install chromium
npm run test:hero
```

Expected: FAIL at mobile and tablet widths because the video or text is clipped, the existing mobile buttons are 40px high, and short landscape content lies outside the usable Hero layout.

- [ ] **Step 5: Commit the regression harness**

```bash
git add package.json package-lock.json playwright.config.ts tests/hero-responsive.spec.ts
git commit -m "test: add responsive hero geometry checks"
```

---

### Task 2: Replace Conflicting Hero CSS With Responsive Layout States

**Files:**
- Modify: `components/hero/Hero.tsx:403-450`
- Modify: `components/hero/HeroTitle.tsx:109-145`
- Modify: `app/globals.css:136-377`
- Modify: `app/globals.css:1531-1898`
- Modify: `app/globals.css:2347-2774`
- Modify: `app/globals.css:2925-2952`
- Test: `tests/hero-responsive.spec.ts`

**Interfaces:**
- Consumes: existing Hero props and the selectors established in Task 1.
- Produces: `.hero-content` and `.hero-support` wrappers, CSS layout states at `<720`, `720-959`, `960-1199`, `1200-1599`, and `>=1600`, plus a short-landscape state at `max-height: 600px` below 1200px.

- [ ] **Step 1: Strengthen the failing test with overlap and media-ratio assertions**

Extend the page-evaluated result in `tests/hero-responsive.spec.ts` with:

```ts
const titleRect = title.getBoundingClientRect()
const descriptionRect = description.getBoundingClientRect()
const actionsRect = actions.getBoundingClientRect()
const imageRect = image.getBoundingClientRect()

const overlap = (a: DOMRect, b: DOMRect) =>
  !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top)

return {
  // existing fields
  titleDescriptionOverlap: overlap(titleRect, descriptionRect),
  descriptionActionsOverlap: overlap(descriptionRect, actionsRect),
  actionsImageOverlap: overlap(actionsRect, imageRect),
  imageAspect: imageRect.width / imageRect.height,
}
```

Add assertions:

```ts
expect(result.titleDescriptionOverlap).toBe(false)
expect(result.descriptionActionsOverlap).toBe(false)
expect(result.actionsImageOverlap).toBe(false)
expect(result.imageAspect).toBeCloseTo(530 / 928, 2)
```

- [ ] **Step 2: Run the focused cases and verify they fail for overlap or clipping**

Run:

```bash
npm run test:hero -- --grep "360x800|667x375|720x900|1024x768|1366x768"
```

Expected: FAIL because current absolute coordinates clip or overlap the initial Hero content.

- [ ] **Step 3: Add flow wrappers without changing semantic order**

Change the Hero body in `components/hero/Hero.tsx` to this structural shape while retaining existing refs, classes, props, media attributes, and child components:

```tsx
<section ref={sectionRef} className='hero-section relative w-full bg-black'>
  <div className='hero-stage sticky top-0 w-full bg-black'>
    <div className='absolute inset-0 z-0'>
      <GradientOrb />
    </div>
    <HeroHeader cta={headerCta} headerRef={headerRef} language={language} />
    <div className='hero-content'>
      <div ref={copyRef} className='hero-copy relative z-10'>
        <HeroTitle title={title} />
      </div>
      <div className='hero-support'>
        <p ref={descRef} className='hero-description relative z-10'>
          {description}
        </p>
        <div ref={imageRef} className='hero-image relative z-10'>
          {/* existing hero-image-frame and video */}
        </div>
        <div ref={actionsRef} className='hero-action-panel relative z-10'>
          {/* existing HeroActions */}
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Allow compact title lines to wrap safely**

In `HeroTitle.tsx`, replace the compact line class `whitespace-nowrap` with `whitespace-normal` and keep desktop line control on the desktop line set. Do not change `TITLE_LINE_MAP` content.

- [ ] **Step 5: Consolidate Hero CSS into five states**

Replace the old Hero-specific rules with shared tokens and the following behavior:

```css
.hero-section {
  --hero-inline: clamp(20px, 4vw, 64px);
  --hero-content-gap: clamp(32px, 5vw, 72px);
  --hero-scroll-distance: clamp(1100px, 150svh, 1800px);
  min-width: 0;
  min-height: calc(100svh + var(--hero-scroll-distance));
  height: auto;
}

.hero-stage {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 100svh;
  min-height: 0;
  overflow: hidden;
}

.hero-content {
  box-sizing: border-box;
  width: min(100% - (2 * var(--hero-inline)), 1440px);
  min-width: 0;
  margin-inline: auto;
}

.hero-title {
  max-width: 100%;
  letter-spacing: 0;
  text-wrap: balance;
  overflow-wrap: break-word;
}

.hero-description,
.hero-action-panel,
.hero-image {
  min-width: 0;
}

.hero-button {
  min-height: 44px;
  height: auto;
  padding: 10px clamp(16px, 3vw, 32px);
  text-align: center;
}
```

For `<720px` and for `(max-width: 1199px) and (max-height: 600px)`, make `.hero-stage` relative, non-sticky, `height: auto`, and `overflow: visible`; make `.hero-content` and `.hero-support` normal-flow grid containers; stack title, description, actions, and video with responsive gaps; set `.hero-image` to an aspect-ratio-based width; and reserve the animation tail on `.hero-section` rather than using a fixed stage height.

For `720-959px`, use a responsive heading followed by a safe grid whose columns are `minmax(0, 1fr) auto minmax(0, 1fr)` only when the lower group fits. Use a stacked support grid in shorter viewports.

For `960-1199px`, use the same three-region support grid with bounded columns and a video size derived from `clamp()`.

For `1200-1599px`, preserve the approved centered composition using the existing 1400px frame and convert fixed coordinates into frame-relative custom properties.

For `>=1600px`, cap the frame at 1440px while retaining the current title, lower-row alignment, and video dimensions at `1600x900` and `1920x1080`.

Delete all superseded Hero-specific blocks, including the base `120svh` stage height and repeated fixed `top` overrides. Do not alter rules for other sections that happen to share the same media queries.

- [ ] **Step 6: Run the initial-layout suite and make only CSS/markup adjustments until it passes**

Run:

```bash
npm run test:hero
```

Expected: PASS for initial layout in RU and EN at the 14 primary viewports.

- [ ] **Step 7: Run lint before committing the layout change**

Run:

```bash
npm run lint
```

Expected: PASS with no new warnings.

- [ ] **Step 8: Commit the responsive base layout**

```bash
git add components/hero/Hero.tsx components/hero/HeroTitle.tsx app/globals.css tests/hero-responsive.spec.ts
git commit -m "fix: make hero base layout responsive"
```

---

### Task 3: Rebuild the Hero Scroll Transition From Real Geometry

**Files:**
- Modify: `components/hero/Hero.tsx:58-401`
- Test: `tests/hero-responsive.spec.ts`

**Interfaces:**
- Consumes: rendered boxes from `.hero-stage`, `.hero-content`, `.hero-description`, `.hero-image`, `.hero-action-panel`, and `.hero-light`.
- Produces: one cleaned-up GSAP context with `gsap.matchMedia()`, responsive measurement functions, media/font refresh handling, and stable forward/reverse transitions.

- [ ] **Step 1: Add failing forward/reverse scroll-state tests**

Add a second test group that uses the representative viewports `360x800`, `720x900`, `1024x768`, `1600x900`, and `2560x1440`. For each language and viewport:

```ts
test(`${language} Hero scroll geometry at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  await page.setViewportSize(viewport)
  await page.goto(`/${language}`)
  await waitForHero(page)

  const sectionHeight = await page.locator('.hero-section').evaluate(
    (section) => section.getBoundingClientRect().height,
  )
  const finalScroll = Math.max(0, sectionHeight - viewport.height - 2)

  for (const progress of [0, 0.5, 1, 0.5, 0]) {
    await page.evaluate(
      ({ y }) => window.scrollTo({ top: y, behavior: 'instant' }),
      { y: finalScroll * progress },
    )
    await page.waitForTimeout(100)

    const state = await page.evaluate(() => {
      const image = document.querySelector<HTMLElement>('.hero-image')!
      const rect = image.getBoundingClientRect()
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      }
    })

    expect(state.horizontalOverflow).toBe(false)
    expect(state.left).toBeGreaterThanOrEqual(-0.5)
    expect(state.right).toBeLessThanOrEqual(state.viewportWidth + 0.5)
    expect(state.width).toBeGreaterThan(0)
    expect(state.height).toBeGreaterThan(0)
  }
})
```

Store the initial image box before scrolling and assert that the final return to progress `0` matches it within 1px.

- [ ] **Step 2: Run the scroll tests and verify the old measurement logic fails**

Run:

```bash
npm run test:hero -- --grep "scroll geometry"
```

Expected: FAIL because the old code uses stale computed `top/left` values and does not rebuild per responsive layout or language.

- [ ] **Step 3: Replace manual breakpoint branches with GSAP media contexts**

Inside the existing `useEffect`, create one `gsap.matchMedia()` instance and add these contexts:

```ts
const media = gsap.matchMedia()

media.add(
  {
    mobile: '(max-width: 719px)',
    short: '(max-width: 1199px) and (max-height: 600px)',
    tablet: '(min-width: 720px) and (max-width: 959px) and (min-height: 601px)',
    laptop: '(min-width: 960px) and (max-width: 1199px) and (min-height: 601px)',
    desktop: '(min-width: 1200px) and (max-width: 1599px)',
    largeDesktop: '(min-width: 1600px)',
  },
  (context) => {
    const conditions = context.conditions!
    // create the mode-specific measured transition and return cleanup
  },
)
```

Use the conditions to choose behavior, not to duplicate coordinate tables.

- [ ] **Step 4: Measure targets from the rendered frame**

Replace `readRect()` based on parsed CSS values and the hard-coded `getTarget()` branches with functions that call `getBoundingClientRect()` after clearing only animation-owned inline styles. Compute:

- expanded video width from the stage's available width and height;
- expanded video height from the fixed `530 / 928` ratio;
- centered image position from stage dimensions;
- description and actions target columns from `.hero-content` bounds;
- gradient center and scale from the expanded image box;
- animation progress from the measured section start and scrollable distance.

Retain `requestAnimationFrame` throttling and the existing easing curve.

- [ ] **Step 5: Add controlled refresh lifecycle**

Import `ScrollTrigger` from `@/lib/gsap`, add `language` and `heroVideoSrc` to the effect dependencies, and use one refresh scheduler:

```ts
let refreshFrame = 0
const refresh = () => {
  window.cancelAnimationFrame(refreshFrame)
  refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
}

void document.fonts.ready.then(refresh)
video.addEventListener('loadedmetadata', refresh, { once: true })
window.addEventListener('orientationchange', refresh)
```

Use `invalidateOnRefresh: true` on any created ScrollTrigger. In cleanup, cancel frames, remove listeners, call `media.revert()`, and clear only animation-owned inline properties with `gsap.set(elements, { clearProps: 'opacity,transform,left,right,top,width,height' })`.

- [ ] **Step 6: Run scroll-state tests until forward and reverse geometry passes**

Run:

```bash
npm run test:hero -- --grep "scroll geometry"
```

Expected: PASS for both languages at all five animation representative viewports.

- [ ] **Step 7: Run the full Hero suite and lint**

Run:

```bash
npm run test:hero
npm run lint
```

Expected: both commands PASS.

- [ ] **Step 8: Commit measured animation behavior**

```bash
git add components/hero/Hero.tsx tests/hero-responsive.spec.ts
git commit -m "fix: measure responsive hero animation geometry"
```

---

### Task 4: Verify Breakpoint Boundaries, Zoom, Production Build, and Visual Fidelity

**Files:**
- Modify only if a failing check identifies a Hero-specific defect: `components/hero/Hero.tsx`, `components/hero/HeroTitle.tsx`, `app/globals.css`, `tests/hero-responsive.spec.ts`
- Create: `artifacts/hero-responsive/` screenshots, excluded from commits unless the repository already tracks verification artifacts.

**Interfaces:**
- Consumes: completed responsive Hero and test suite.
- Produces: evidence for every required viewport, breakpoint boundary, language, scroll direction, and production check.

- [ ] **Step 1: Add breakpoint-boundary cases to the test data**

Add these widths using a 900px height unless a paired height is specified:

```ts
const boundaryWidths = [
  359, 360, 719, 720, 767, 768, 959, 960, 1023, 1024,
  1199, 1200, 1279, 1280, 1399, 1400, 1599, 1600,
] as const
```

Run the same initial geometry assertions for each boundary in both languages.

- [ ] **Step 2: Run the boundary suite and correct only demonstrated Hero defects**

Run:

```bash
npm run test:hero -- --grep "boundary"
```

Expected: PASS with no horizontal overflow, clipping, overlap, or undersized buttons.

- [ ] **Step 3: Capture visual verification screenshots**

Using the in-app browser, capture `/en` and `/ru` at:

```text
360x800
390x844
430x932
667x375
720x900
768x1024
960x900
1024x768
1200x900
1366x768
1400x900
1600x900
1920x1080
2560x1440
```

At `1600x900` and `1920x1080`, compare the initial Hero against the pre-change screenshots to confirm the approved desktop composition remains intact.

- [ ] **Step 4: Verify zoom and resize behavior**

Use browser zoom at 80%, 100%, 125%, and 200% for representative mobile, tablet, laptop, and desktop sizes. At each zoom, run this page evaluation:

```js
({
  viewport: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  hasHorizontalOverflow:
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth,
})
```

Resize across `719/720`, `959/960`, `1199/1200`, and `1599/1600`, then switch `/en` to `/ru` and back. Confirm no stale inline transforms, duplicate ScrollTriggers, console warnings, or jumps remain.

- [ ] **Step 5: Run final automated verification**

Run:

```bash
npm run test:hero
npm run lint
npm run build
```

Expected: all commands PASS with no warnings attributable to the Hero.

- [ ] **Step 6: Inspect the production build**

Run:

```bash
npm run start -- --hostname 127.0.0.1 --port 3101
```

Open `http://127.0.0.1:3101/en` and `http://127.0.0.1:3101/ru`, repeat the 360px, 720px, 1024px, 1600px, and 2560px geometry checks, and inspect console logs for hydration, key, media, and ScrollTrigger errors.

- [ ] **Step 7: Commit any final Hero-only correction and test updates**

If Step 2 through Step 6 required changes:

```bash
git add components/hero/Hero.tsx components/hero/HeroTitle.tsx app/globals.css tests/hero-responsive.spec.ts
git commit -m "test: verify hero across responsive boundaries"
```

If no files changed, do not create an empty commit.
