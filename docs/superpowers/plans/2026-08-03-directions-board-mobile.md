# Directions Board Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the approved two-column Directions board below `720px` and keep the staggered composition overlap-free at `720px` and above.

**Architecture:** Keep the existing `Directions` markup, localized content, stable chip IDs, and JavaScript canvas measurements. Add a final mobile-only CSS reset after the existing responsive canvas rules so the cascade converts the canvas to normal flow, lays the six slots out as a two-column grid, and gives every chip the approved light appearance. Protect the breakpoint with a real-browser regression test.

**Tech Stack:** Next.js 16, React 19, Tailwind/CSS in `app/globals.css`, Playwright.

## Global Constraints

- Preserve all Russian and English content.
- Preserve chip variants, typography, stable IDs, order, and rotation angles at `720px` and above.
- Expand center spacing responsively without changing the staggered topology at `720px`, `1000px`, `1200px`, `1400px`, and `1600px`.
- Use two equal chip columns at every width below `720px`, including `360px`.
- Allow labels to wrap without clipping, overlap, or horizontal overflow.
- Keep the board background, radius, title, bottom gradient, statement, and animation behavior unchanged.

## File Structure

- Create `tests/directions-board-mobile.spec.ts`: browser-level breakpoint, containment, visual-variant, and overlap regression coverage.
- Modify `app/globals.css`: final sub-720 cascade override that switches the existing canvas and slots into the approved normal-flow grid.

---

### Task 1: Protect the Sub-720 Directions Board Contract

**Files:**
- Create: `tests/directions-board-mobile.spec.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: existing `.directions-board-card`, `.directions-board-gradient`, `.directions-chip-viewport`, `.directions-chip-canvas`, `.directions-chip-layer`, `.directions-chip-slot`, and `.directions-chip` elements.
- Produces: a two-column normal-flow grid below `720px`; no component API changes.

- [x] **Step 1: Write the failing mobile regression test**

Create `tests/directions-board-mobile.spec.ts` with literal expectations for `360px`, `390px`, and `719px`. For each width, open `/ru`, wait for fonts and two animation frames, then assert:

```ts
import { expect, test } from '@playwright/test'

const mobileWidths = [360, 390, 719] as const

for (const width of mobileWidths) {
  test(`directions board uses the approved mobile grid at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ru', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    }))

    const layout = await page.evaluate(() => {
      const board = document.querySelector<HTMLElement>('.directions-board-card')!
      const gradient = document.querySelector<HTMLElement>('.directions-board-gradient')!
      const layer = document.querySelector<HTMLElement>('.directions-chip-layer')!
      const chips = [...document.querySelectorAll<HTMLElement>('.directions-chip')]
      const rects = chips.map(chip => chip.getBoundingClientRect())
      const boardRect = board.getBoundingClientRect()
      const gradientRect = gradient.getBoundingClientRect()

      return {
        columnCount: getComputedStyle(layer).gridTemplateColumns.split(' ').length,
        chipCount: chips.length,
        chipStyles: chips.map(chip => {
          const style = getComputedStyle(chip)
          return {
            transform: style.transform,
            backgroundImage: style.backgroundImage,
            backgroundColor: style.backgroundColor,
            borderWidth: style.borderTopWidth,
          }
        }),
        rects: rects.map(rect => ({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        })),
        board: {
          left: boardRect.left,
          right: boardRect.right,
          top: boardRect.top,
          bottom: boardRect.bottom,
        },
        gradientBottom: gradientRect.bottom,
        pageOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      }
    })

    expect(layout.columnCount).toBe(2)
    expect(layout.chipCount).toBe(6)
    expect(layout.pageOverflow).toBe(false)

    for (const style of layout.chipStyles) {
      expect(style.transform).toBe('none')
      expect(style.backgroundImage).toBe('none')
      expect(style.backgroundColor).toBe('rgb(242, 243, 247)')
      expect(style.borderWidth).toBe('0px')
    }

    for (const rect of layout.rects) {
      expect(rect.left).toBeGreaterThanOrEqual(layout.board.left - 1)
      expect(rect.right).toBeLessThanOrEqual(layout.board.right + 1)
      expect(rect.top).toBeGreaterThan(layout.board.top)
      expect(rect.bottom).toBeLessThan(layout.board.bottom - 3)
    }

    for (let first = 0; first < layout.rects.length; first += 1) {
      for (let second = first + 1; second < layout.rects.length; second += 1) {
        const a = layout.rects[first]
        const b = layout.rects[second]
        const overlaps =
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
        expect(overlaps, `chips ${first} and ${second} overlap`).toBe(false)
      }
    }

    expect(layout.gradientBottom).toBeGreaterThan(layout.board.bottom)
  })
}

test('720px retains the existing non-mobile directions composition', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 })
  await page.goto('/ru', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => document.fonts.ready)

  const layout = await page.evaluate(() => {
    const layer = document.querySelector<HTMLElement>('.directions-chip-layer')!
    const chips = [...document.querySelectorAll<HTMLElement>('.directions-chip')]
    return {
      display: getComputedStyle(layer).display,
      hasVariant:
        chips.some(chip => getComputedStyle(chip).backgroundImage !== 'none') ||
        chips.some(chip => getComputedStyle(chip).borderTopWidth !== '0px'),
    }
  })

  expect(layout.display).not.toBe('grid')
  expect(layout.hasVariant).toBe(true)
})
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx playwright test tests/directions-board-mobile.spec.ts --reporter=line
```

Expected: the sub-720 cases fail because the later `max-width: 1279px`, `844px`, `456px`, and `319px` rules leave chips absolutely positioned, rotated, and variant-colored instead of using the approved grid.

- [x] **Step 3: Implement the final mobile cascade reset**

Append a final `@media (max-width: 719px)` block after the existing narrow-canvas rules in `app/globals.css`. It must:

```css
@media (max-width: 719px) {
  .directions-board-card {
    height: auto !important;
    min-height: 0 !important;
    padding: clamp(20px, 4.25vw, 30px) !important;
  }

  .directions-chip-viewport,
  .directions-chip-canvas {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    transform: none !important;
  }

  .directions-chip-viewport {
    margin-top: clamp(22px, 4vw, 28px) !important;
  }

  .directions-chip-layer {
    position: relative !important;
    inset: auto !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: clamp(8px, 2vw, 14px) clamp(10px, 2.5vw, 18px) !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
  }

  .directions-chip-slot,
  .directions-chip-slot--ar-vr-webar,
  .directions-chip-slot--3d-gamedev,
  .directions-chip-slot--genai-animation,
  .directions-chip-slot--holography,
  .directions-chip-slot--gamification,
  .directions-chip-slot--digital-tourism {
    position: relative !important;
    inset: auto !important;
    z-index: auto !important;
    display: flex !important;
    width: 100% !important;
    height: auto !important;
    min-width: 0 !important;
    align-items: stretch !important;
  }

  .directions-chip-slot .directions-chip {
    width: 100% !important;
    height: 100% !important;
    min-height: 44px !important;
    padding: clamp(8px, 2vw, 11px) clamp(10px, 2.5vw, 18px) !important;
    border: 0 !important;
    background-color: #f2f3f7 !important;
    background-image: none !important;
    color: #4c4c4c !important;
    transform: none !important;
    white-space: normal !important;
    overflow-wrap: anywhere;
  }
}
```

Keep this block after the `max-width: 319px` rules so it is the single authoritative mobile layout reset.

- [x] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npx playwright test tests/directions-board-mobile.spec.ts --reporter=line
```

Expected: all four tests pass.

- [x] **Step 5: Run related responsive regression tests**

Run:

```bash
npx playwright test tests/directions-board-mobile.spec.ts tests/shared-horizontal-gutters.spec.ts tests/typography-responsive.spec.ts --reporter=line
```

Expected: all tests pass with no page overflow and the existing `720px+` typography/gutter contracts intact.

- [x] **Step 6: Verify lint and production build**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0`.

- [x] **Step 7: Commit the implementation**

```bash
git add app/globals.css tests/directions-board-mobile.spec.ts docs/superpowers/plans/2026-08-03-directions-board-mobile.md
git commit -m "fix: match mobile directions board design"
```

---

### Task 2: Remove Non-Mobile Chip Intersections

**Files:**
- Modify: `tests/directions-board-mobile.spec.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: the same six stable chip IDs and existing variant/rotation rules.
- Produces: one expanded staggered composition with responsive board heights and no pairwise chip intersections from `720px` upward.

- [ ] **Step 1: Add a failing non-overlap regression test**

Extend `tests/directions-board-mobile.spec.ts` with tests at `720px`, `1000px`, `1200px`, `1400px`, and `1600px`. Read each chip rectangle and computed transform, assert every rectangle stays inside `.directions-board-card`, and reject every pairwise intersection. Derive rotation from the transform matrix using `Math.atan2(matrix.b, matrix.a)` and compare against these literal values:

```ts
const desktopRotationById = {
  'ar-vr-webar': -16,
  '3d-gamedev': 0,
  'genai-animation': -5,
  holography: -15,
  gamification: 18,
  'digital-tourism': 2,
} as const
```

Also assert the approved topology:

```ts
expect(centerX['ar-vr-webar']).toBeLessThan(centerX['3d-gamedev'])
expect(centerX['3d-gamedev']).toBeLessThan(centerX.holography)
expect(centerX['digital-tourism']).toBeLessThan(centerX.gamification)
expect(centerY.gamification).toBeLessThan(centerY['digital-tourism'])
expect(centerY['digital-tourism']).toBeLessThan(centerY['genai-animation'])
expect(centerY['genai-animation']).toBeLessThan(centerY['ar-vr-webar'])
expect(centerY['ar-vr-webar']).toBeLessThan(centerY.holography)
expect(centerY.holography).toBeLessThan(centerY['3d-gamedev'])
```

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```bash
npx playwright test tests/directions-board-mobile.spec.ts --reporter=line
```

Expected: all five non-mobile cases fail on pairwise intersections while the existing mobile cases remain green.

- [ ] **Step 3: Implement the expanded composition**

Add an authoritative `@media (min-width: 720px)` block after the existing Directions responsive rules. Reset the scaled canvas wrappers to `display: contents`, keep the chip layer absolute relative to the board, and assign the six stable slots these percentages:

```css
.directions-chip-slot--gamification {
  left: 72% !important;
  top: 7% !important;
  width: 24% !important;
}

.directions-chip-slot--digital-tourism {
  left: 42% !important;
  top: 25% !important;
  width: 27% !important;
}

.directions-chip-slot--genai-animation {
  left: 65% !important;
  top: 42% !important;
  width: 27% !important;
}

.directions-chip-slot--ar-vr-webar {
  left: 36% !important;
  top: 58% !important;
  width: 26% !important;
}

.directions-chip-slot--holography {
  left: 74% !important;
  top: 65% !important;
  width: 24% !important;
}

.directions-chip-slot--3d-gamedev {
  left: 48% !important;
  top: 82% !important;
  width: 28% !important;
}
```

Use board heights of `620px` for `720–959px`, `540px` for `960–1279px`, and `460px` at `1280px+`. Do not override any chip transform or font-size rule.

- [ ] **Step 4: Run the focused tests and adjust only shared geometry if needed**

Run:

```bash
npx playwright test tests/directions-board-mobile.spec.ts --reporter=line
```

If a rotated bounding box still intersects, adjust the shared board height or the proportional center spacing while preserving the literal rotation values and topology assertions.

- [ ] **Step 5: Run responsive regressions, lint, and build**

Run:

```bash
npx playwright test tests/directions-board-mobile.spec.ts tests/shared-horizontal-gutters.spec.ts tests/typography-responsive.spec.ts --reporter=line
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0` and no target width has horizontal overflow.
