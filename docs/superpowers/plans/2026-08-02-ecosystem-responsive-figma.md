# Ecosystem Responsive Figma Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the Ecosystem card to the supplied 360px, 720px, 960px, 1200px, and 1440px Figma compositions while keeping all current RU/EN content and horizontal-scroll behavior intact.

**Architecture:** Keep the current semantic `Ecosystem` flex track and GSAP timeline. Add browser-level geometry regression coverage, then replace the final active Ecosystem CSS token block with one complete responsive cascade that explicitly resets legacy track geometry and controls all column dimensions and offsets.

**Tech Stack:** Next.js 16, React 19, CSS custom properties, GSAP/ScrollTrigger, Playwright.

## Global Constraints

- Preserve every current Russian and English Ecosystem string.
- Preserve the existing icon sources, purple background, rounded card, column order, and typography hierarchy.
- Preserve the existing horizontal GSAP animation and its match-media ranges.
- Use the supplied screenshots only as visual layout references.
- Do not modify unrelated sections or the existing local `hero-language` width change.
- Do not use subagents.

---

### Task 1: Add Ecosystem Geometry Regression Coverage

**Files:**
- Create: `tests/ecosystem-responsive.spec.ts`

**Interfaces:**
- Consumes: `.ecosystem-section`, `.ecosystem-wrapper`, `.ecosystem-track`, `.ecosystem-column`, `.ecosystem-title`, `.ecosystem-description`, `.ecosystem-feature-icon`, `.ecosystem-feature-title`, and `.ecosystem-feature-description` rendered by `components/ecosystem/Ecosystem.tsx`.
- Produces: Playwright assertions for containment, semantic spacing, scroll reachability, and horizontal page overflow at the five reference widths.

- [ ] **Step 1: Write the failing geometry test**

Create `tests/ecosystem-responsive.spec.ts` with helpers that navigate to `/ru`, wait for fonts, scroll the Ecosystem wrapper into view, and collect untransformed local geometry by subtracting the track rectangle from each child rectangle. Test these literal viewport cases:

```ts
const references = [
  { width: 360, height: 800 },
  { width: 720, height: 900 },
  { width: 960, height: 900 },
  { width: 1200, height: 900 },
  { width: 1440, height: 900 },
] as const
```

For each viewport, assert:

```ts
expect(layout.wrapper.left).toBeGreaterThanOrEqual(0)
expect(layout.wrapper.right).toBeLessThanOrEqual(viewport.width)
expect(layout.track.left).toBeCloseTo(layout.wrapper.left, 0)
expect(layout.columns).toHaveLength(4)
expect(layout.pageHasHorizontalOverflow).toBe(false)

for (const column of layout.columns) {
  expect(column.width).toBeGreaterThan(0)
  expect(column.height).toBeGreaterThan(0)
}

for (const feature of layout.features) {
  expect(feature.icon.bottom).toBeLessThanOrEqual(feature.title.top)
  expect(feature.title.bottom).toBeLessThanOrEqual(feature.description.top)
  expect(feature.description.bottom).toBeLessThanOrEqual(layout.wrapper.bottom)
}
```

Also assert that feature columns 1 and 3 share the lower visual band and feature column 2 starts higher:

```ts
expect(Math.abs(layout.features[0].top - layout.features[2].top)).toBeLessThan(2)
expect(layout.features[1].top).toBeLessThan(layout.features[0].top)
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npx playwright test tests/ecosystem-responsive.spec.ts
```

Expected: FAIL against the current CSS because at least the 720px track retains legacy negative inline offset and the active card geometry does not meet the new containment/spacing contract.

- [ ] **Step 3: Add scroll reachability and locale coverage**

Add a test that uses the Ecosystem ScrollTrigger range to scroll from start to end and asserts the final feature intersects the wrapper at the end. Repeat the content-visibility test for `/en` at 360px and 1200px, asserting all four headings and descriptions have non-zero rectangles and non-empty text.

- [ ] **Step 4: Re-run and confirm the tests fail for layout reasons**

Run:

```bash
npx playwright test tests/ecosystem-responsive.spec.ts
```

Expected: FAIL with geometry assertions, not missing selectors, navigation errors, or test setup errors.

---

### Task 2: Consolidate the Ecosystem Responsive Layout

**Files:**
- Modify: `app/globals.css:3592-3918`
- Test: `tests/ecosystem-responsive.spec.ts`

**Interfaces:**
- Consumes: the unchanged semantic markup and GSAP transform in `components/ecosystem/Ecosystem.tsx`.
- Produces: one final active Ecosystem layout cascade whose custom properties determine card size, track padding, column width, gaps, and vertical rhythm.

- [ ] **Step 1: Reset legacy geometry in the final base rules**

Update the final `.ecosystem-track` rule to explicitly own its geometry:

```css
.ecosystem-track {
  display: flex;
  width: max-content;
  min-width: 100%;
  height: var(--ecosystem-card-height);
  margin: 0;
  padding: var(--ecosystem-track-padding-block)
    var(--ecosystem-track-padding-inline);
  gap: var(--ecosystem-track-gap);
  box-sizing: border-box;
  overflow: visible;
  will-change: transform;
}
```

Reset all semantic children to normal flex flow with `position: relative`, natural text height, and no inherited absolute `left`, `top`, fixed width, or transform.

- [ ] **Step 2: Define the five responsive token ranges**

Use these layout ranges as the initial Figma-derived geometry:

```css
/* Base / 1440 design */
--ecosystem-card-height: clamp(528px, 36.8vw, 600px);
--ecosystem-track-padding-inline: clamp(84px, 8.7vw, 126px);
--ecosystem-track-padding-block: clamp(56px, 5.6vw, 80px);
--ecosystem-intro-width: clamp(330px, 28vw, 404px);
--ecosystem-feature-width: clamp(260px, 22vw, 320px);
--ecosystem-track-gap: clamp(92px, 8vw, 116px);

/* 1200-1439 */
--ecosystem-card-height: clamp(510px, 42.8vw, 616px);
--ecosystem-track-padding-inline: clamp(72px, 6.1vw, 88px);
--ecosystem-track-padding-block: 58px;
--ecosystem-intro-width: 360px;
--ecosystem-feature-width: 300px;
--ecosystem-track-gap: 88px;

/* 960-1199 */
--ecosystem-card-height: clamp(500px, 52vw, 624px);
--ecosystem-track-padding-inline: clamp(56px, 6vw, 72px);
--ecosystem-track-padding-block: 54px;
--ecosystem-intro-width: 330px;
--ecosystem-feature-width: 280px;
--ecosystem-track-gap: 76px;

/* 720-959 */
--ecosystem-card-height: clamp(500px, 69vw, 600px);
--ecosystem-track-padding-inline: 44px;
--ecosystem-track-padding-block: 48px;
--ecosystem-intro-width: 310px;
--ecosystem-feature-width: 270px;
--ecosystem-track-gap: 68px;

/* Below 720 */
--ecosystem-card-height: clamp(500px, 146vw, 600px);
--ecosystem-track-padding-inline: clamp(28px, 8vw, 44px);
--ecosystem-track-padding-block: clamp(32px, 9vw, 48px);
--ecosystem-intro-width: clamp(250px, 78vw, 310px);
--ecosystem-feature-width: clamp(244px, 76vw, 286px);
--ecosystem-track-gap: clamp(52px, 15vw, 72px);
```

Use semantic offset tokens for the alternating feature bands instead of child-specific absolute positions.

- [ ] **Step 3: Make all copy content-driven and visible**

Keep title and body blocks in normal flow. Apply `min-width: 0`, `max-width: 100%`, `height: auto`, `overflow-wrap: break-word`, and balanced heading wrapping. Preserve the current font families and weights. Use responsive sizes bounded to the current hierarchy; do not introduce text clipping, `white-space: nowrap` on the complete title, or fixed text heights.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npx playwright test tests/ecosystem-responsive.spec.ts
```

Expected: PASS at all five reference widths in RU and the sampled EN widths.

- [ ] **Step 5: Check the existing hero regression suite**

Run:

```bash
npm run test:hero
```

Expected: PASS, confirming the Ecosystem card still appears after the Hero without overlap and the Hero release behavior remains intact.

---

### Task 3: Visual Tuning and Production Verification

**Files:**
- Modify if measurements require tuning: `app/globals.css:3592-3918`
- Test: `tests/ecosystem-responsive.spec.ts`
- Create test artifacts only: `test-results/ecosystem-*.png` (not committed)

**Interfaces:**
- Consumes: the completed tokenized Ecosystem layout.
- Produces: verified screenshots and final lint/build evidence.

- [ ] **Step 1: Start or reuse the local development server**

Run the project at `http://127.0.0.1:3100` using the Playwright web server or a standalone `npm run dev -- --hostname 127.0.0.1 --port 3100` process.

- [ ] **Step 2: Capture the five comparison screenshots**

At 360x800, 720x900, 960x900, 1200x900, and 1440x900, load `/ru`, scroll to the initial Ecosystem card state, and capture the `.ecosystem-wrapper`. Compare card proportions, intro placement, staggered feature bands, icon/text gaps, and safe bottom inset against the supplied references.

- [ ] **Step 3: Tune only shared layout tokens if needed**

Adjust card height, padding, column widths, track gaps, and semantic feature offsets. Do not add per-language selectors, text-dependent rules, transforms for base positioning, or one-off exact-width hacks.

- [ ] **Step 4: Re-run focused tests after visual tuning**

Run:

```bash
npx playwright test tests/ecosystem-responsive.spec.ts
npm run test:hero
```

Expected: both commands PASS.

- [ ] **Step 5: Run lint and production build**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit 0 with no lint or build errors.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git diff --check
git diff -- app/globals.css tests/ecosystem-responsive.spec.ts
git status --short
```

Confirm that Ecosystem content files are unchanged and the pre-existing `.hero-language` width edit remains preserved but logically separate from the Ecosystem changes.
