# Hero Video Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Hero video expand smoothly and remain fully visible below 1200px, then release the complete Hero before Ecosystem enters.

**Architecture:** Keep the existing Hero DOM and single ScrollTrigger. Calculate animation endpoints in stable viewport coordinates, convert them to stage-local transforms per frame, and stop the extra global scroll updates after the ScrollTrigger range so final transforms leave with the Hero stage.

**Tech Stack:** Next.js 16, React 19, TypeScript, GSAP 3.15, ScrollTrigger, Playwright.

## Global Constraints

- Preserve all approved Hero text, links, video sources, controls, initial responsive layout, and desktop composition.
- Below 960px, description and actions fade out during video expansion.
- From 960px through 1199px, description and actions retain the existing visible-column behavior.
- The expanded video must fit within the viewport and available Hero content width.
- The video must follow a monotonic path toward the viewport center.
- Hero content must scroll away before Ecosystem appears.
- Keep one `hero-scroll` ScrollTrigger with `invalidateOnRefresh: true`.
- Do not add a pin spacer, cloned video, fixed overlay, or parallel animation system.

---

## File Structure

- Modify `tests/hero-responsive.spec.ts`: add behavior-level regression coverage for expansion containment, monotonic motion, responsive fading, and the Hero-to-Ecosystem release.
- Modify `components/hero/Hero.tsx`: calculate stable viewport-space animation centers, change the below-960 fade condition, and let ScrollTrigger exclusively drive updates within its active range.

### Task 1: Capture the Broken Expansion and Release Behavior

**Files:**
- Test: `tests/hero-responsive.spec.ts`

**Interfaces:**
- Consumes: existing `.hero-section`, `.hero-stage`, `.hero-image`, `.hero-description`, `.hero-action-panel`, and `.ecosystem-section` DOM contracts.
- Produces: regression tests that constrain the Hero expansion and release behavior without exposing implementation details.

- [ ] **Step 1: Add a helper that reads expansion geometry**

Add a helper near `readAnimatedHeroBoxes()` that returns viewport rectangles, opacity, and the Hero trigger end:

```ts
async function readHeroExpansionState(page: Page) {
  return page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector)!
      const rect = element.getBoundingClientRect()
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        centerY: rect.top + rect.height / 2,
        opacity: Number(getComputedStyle(element).opacity),
      }
    }

    const section = document.querySelector<HTMLElement>('.hero-section')!
    const sectionRect = section.getBoundingClientRect()

    return {
      image: read('.hero-image'),
      description: read('.hero-description'),
      actions: read('.hero-action-panel'),
      ecosystem: read('.ecosystem-section'),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      heroEnd:
        sectionRect.top + window.scrollY +
        Math.max(1, sectionRect.height - window.innerHeight),
    }
  })
}
```

- [ ] **Step 2: Add failing tests for fit, fading, and monotonic movement**

For English at `360x800`, `720x900`, `959x900`, `960x900`, `1024x768`, and `1199x900`:

1. Navigate to `/en` and call `waitForHero(page)`.
2. Read the Hero section height and scroll through progress points `0`, `0.2`, `0.4`, `0.6`, `0.82`, and `1`.
3. At each point, assert that the image stays horizontally within the viewport.
4. At progress `1`, assert that the image top is at least `0`, image bottom is at most `viewportHeight`, and its center is within `1px` of the viewport center.
5. Assert that the absolute distance from the image center to the viewport center never increases by more than `1px` as progress advances.
6. At progress `1`, assert description and actions opacity are at most `0.01` below `960px`, and greater than `0.99` from `960px` upward.

Name the test group `Hero video expansion below desktop`.

- [ ] **Step 3: Add a failing Hero-to-Ecosystem release test**

For `720x900`, `959x900`, `1024x768`, and `1199x900`:

1. Scroll to the Hero trigger end and capture the expanded state.
2. Scroll an additional `0.6 * viewportHeight` so Ecosystem enters.
3. Assert that the Hero image center moved upward by at least `0.5 * viewportHeight`.
4. If the Ecosystem panel is visible, assert that the Hero image, description, and actions do not intersect its rectangle.
5. Scroll back to `0` and assert the original image rectangle is restored within `1px`.

Use rectangle intersection logic already present in the test file.

- [ ] **Step 4: Run the focused tests and confirm the expected failures**

Run:

```bash
npm run test:hero -- --grep "Hero video expansion below desktop|Hero releases before Ecosystem" --reporter=line
```

Expected: FAIL because the current 720-959 support content remains visible, at least one sub-1200 trajectory is not monotonic or fully contained, and Hero transforms continue compensating after the trigger end.

- [ ] **Step 5: Commit the failing regression tests**

```bash
git add tests/hero-responsive.spec.ts
git commit -m "test: cover hero video expansion release"
```

### Task 2: Stabilize the Expansion Target and Hero Release

**Files:**
- Modify: `components/hero/Hero.tsx:90-530`
- Test: `tests/hero-responsive.spec.ts`

**Interfaces:**
- Consumes: existing responsive conditions and element refs inside `Hero`.
- Produces: a single ScrollTrigger-driven animation whose viewport-space center targets remain stable and whose transformed elements leave with the section after the trigger end.

- [ ] **Step 1: Expand the below-960 fade condition**

Inside the `gsap.matchMedia()` callback, change:

```ts
const hideSupportingText = conditions.mobile || conditions.short
```

to:

```ts
const hideSupportingText =
  conditions.mobile || conditions.tablet || conditions.short
```

This keeps the existing 960-1199 laptop behavior while fading support content at every width below 960px.

- [ ] **Step 2: Store stable viewport centers during measurement**

In `measure()`, read the stage positioning mode and derive where each element naturally sits when animation progress begins:

```ts
const stagePosition = getComputedStyle(stage).position
const stageIsSticky = stagePosition === 'sticky'
const flowTransitionStart = Math.max(
  0,
  stageBox.top + window.scrollY +
    start.actions.top + start.actions.height - sectionTop,
)
const transitionStageTop = stageIsSticky ? 0 : -flowTransitionStart
const startViewportCenter = {
  desc: transitionStageTop + start.desc.top + start.desc.height / 2,
  image: transitionStageTop + start.image.top + start.image.height / 2,
  actions:
    transitionStageTop + start.actions.top + start.actions.height / 2,
}
```

Return `flowTransitionStart` and `startViewportCenter` as part of the measured geometry. Reuse the existing function-based refresh path so these values update after fonts, media, resize, and orientation changes.

- [ ] **Step 3: Interpolate centers in viewport space**

In `update()`, continue reading the current `stageBox` only to convert a stable viewport-space destination into stage-local coordinates:

```ts
const viewportCenterY = window.innerHeight / 2
const imageViewportCenterY = lerp(
  geometry.startViewportCenter.image,
  viewportCenterY,
  eased,
)
const imageTop = imageViewportCenterY - imageHeight / 2 - stageBox.top
```

Apply the same pattern to description and actions with their existing progress curves:

```ts
const descriptionViewportCenterY = lerp(
  geometry.startViewportCenter.desc,
  viewportCenterY,
  supportSettleEased,
)
const actionsViewportCenterY = lerp(
  geometry.startViewportCenter.actions,
  viewportCenterY,
  supportSettleEased,
)
```

Pass `centerY - height / 2 - stageBox.top` to `positionElement()` for each supporting element. Preserve all existing width, horizontal-position, opacity, radius, and glow interpolation.

- [ ] **Step 4: Let ScrollTrigger own updates only within its range**

Remove the global listener:

```ts
window.addEventListener('scroll', requestUpdate, { passive: true })
```

and its cleanup:

```ts
window.removeEventListener('scroll', requestUpdate)
```

Keep `onUpdate: requestUpdate` on the existing ScrollTrigger. At progress `1`, the final local transforms are retained. Once the ScrollTrigger stops updating beyond its end, those transforms move with the Hero stage and leave the viewport naturally. Reverse scrolling invokes `onUpdate` again and uses the same geometry in reverse.

- [ ] **Step 5: Run the focused tests and confirm they pass**

Run:

```bash
npm run test:hero -- --grep "Hero video expansion below desktop|Hero releases before Ecosystem" --reporter=line
```

Expected: PASS.

- [ ] **Step 6: Run the complete Hero regression suite**

Run:

```bash
npm run test:hero -- --reporter=line
```

Expected: all Hero tests pass with one ScrollTrigger, no geometry regressions, and correct forward/reverse behavior.

- [ ] **Step 7: Commit the implementation**

```bash
git add components/hero/Hero.tsx tests/hero-responsive.spec.ts
git commit -m "fix: stabilize hero video expansion"
```

### Task 3: Production and Visual Verification

**Files:**
- Verify: `components/hero/Hero.tsx`
- Verify: `tests/hero-responsive.spec.ts`

**Interfaces:**
- Consumes: completed Hero animation implementation.
- Produces: evidence that the focused fix does not regress the wider application.

- [ ] **Step 1: Run static validation**

```bash
npm run lint
npm run build
```

Expected: both commands exit successfully with no warnings introduced by this change.

- [ ] **Step 2: Verify representative responsive states**

Capture and inspect the expanded Hero and Hero-to-Ecosystem transition for English and Russian at:

- `360x800`
- `720x900`
- `959x900`
- `960x900`
- `1024x768`
- `1199x900`
- `1200x900`
- `1600x900`

Confirm the complete video is visible during expansion, motion does not reverse, below-960 support content fades, and no Hero content remains over Ecosystem.

- [ ] **Step 3: Verify runtime health**

Confirm:

- no horizontal document overflow;
- no duplicate Hero ScrollTriggers;
- no hydration, React-key, or ScrollTrigger console errors;
- language switching recalculates geometry;
- forward and reverse scrolling restore the expected states.

- [ ] **Step 4: Commit any verification-only test adjustment**

Only if a test assertion requires a tolerance correction that does not weaken behavior:

```bash
git add tests/hero-responsive.spec.ts
git commit -m "test: refine hero expansion tolerances"
```

Otherwise, do not create an empty commit.
