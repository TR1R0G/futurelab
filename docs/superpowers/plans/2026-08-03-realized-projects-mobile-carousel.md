# Realized Projects Mobile Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Realized Projects carousel discoverable and keyboard-accessible below `720px` without changing tablet or desktop behavior.

**Architecture:** Reuse `.realized-projects-viewport` as the native horizontal scroll container and `.realized-projects-track` as its flex content. `RealizedProjects` owns card refs and derives active/arrow state from measured scroll geometry, while CSS controls the partial next-card preview, scroll snap, and mobile-only controls.

**Tech Stack:** React 19, TypeScript, Next.js 16, CSS/Tailwind utilities, Playwright.

## Global Constraints

- Apply new layout and controls only at viewport widths below `720px`.
- Preserve existing project text, media, video behavior, card design, order, and all behavior at `720px` and above.
- Use native horizontal scrolling and CSS scroll snap; do not add GSAP navigation or a new icon dependency.
- Keep touch swiping, reduced-motion support, keyboard access, and page-level overflow protection.
- Do not include the untracked `playwright.local.config.ts` file in any commit.

---

### Task 1: Mobile carousel behavior test

**Files:**
- Create: `tests/realized-projects-mobile.spec.ts`

**Interfaces:**
- Consumes: `.realized-projects-viewport`, `.realized-projects-track`, `.realized-project-card`.
- Produces: regression coverage for preview geometry, scroll snap, controls, real-scroll synchronization, localization, breakpoint isolation, and page overflow.

- [ ] **Step 1: Write the failing Playwright tests**

Add tests at `360`, `390`, `430`, `667x375`, and `719` that assert the viewport scrolls, the page does not overflow, the first card is fully visible, `20–28px` of the next card is visible after the gap, and computed `scrollSnapType` is `x mandatory`. Add interaction coverage that clicks next/previous arrows and dots, manually scrolls to the final card, and verifies `aria-current` and disabled states. Add a `720px` test asserting controls are hidden and mobile snap is absent.

- [ ] **Step 2: Run the focused spec and verify RED**

Run: `npx playwright test tests/realized-projects-mobile.spec.ts`

Expected: FAIL because `.realized-projects-navigation`, arrow buttons, pagination dots, and mobile scroll-snap rules do not exist.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/realized-projects-mobile.spec.ts
git commit -m "test: cover realized projects mobile carousel"
```

### Task 2: Scroll-derived React navigation

**Files:**
- Modify: `components/realized-projects/RealizedProjects.tsx`
- Test: `tests/realized-projects-mobile.spec.ts`

**Interfaces:**
- Consumes: `projects: RealizedProject[]`, `wrapperRef`, `trackRef`, and per-card element refs.
- Produces: `activeIndex`, `canScrollPrevious`, `canScrollNext`, `scrollToCard(index)`, localized navigation labels, and `.realized-projects-navigation` markup.

- [ ] **Step 1: Add stable card identity and refs**

Define `getProjectKey(project)` using `project.video ?? project.image ?? project.imageAlt`, store `cardRefs.current[index]`, and pass an `articleRef` prop into `ProjectCard`. Replace the localized title React key with the stable media key.

- [ ] **Step 2: Add measured navigation state**

Attach one scroll listener to `wrapperRef`, throttle updates through `requestAnimationFrame`, and calculate the nearest card from each card's real rectangle relative to the scroll container. Derive previous/next availability from `scrollLeft` and `scrollWidth - clientWidth` using a `4px` threshold.

- [ ] **Step 3: Add resilient geometry updates**

Observe the container and cards with `ResizeObserver`, update after `document.fonts.ready`, listen to reduced-motion preference changes, and clean up the observer, listeners, and pending animation frame.

- [ ] **Step 4: Add navigation actions and accessible markup**

Implement `scrollToCard(index)` from the measured card/container rectangles and computed scroll padding. Render previous/next semantic buttons and one dot per project after the viewport. Use localized labels based on the existing RU/EN content, `aria-current` on the active dot, and CSS chevron spans marked `aria-hidden`.

- [ ] **Step 5: Run the focused spec**

Run: `npx playwright test tests/realized-projects-mobile.spec.ts`

Expected: tests still fail on missing mobile CSS geometry while the new controls and state assertions begin passing.

### Task 3: Mobile-only scroll snap and controls styling

**Files:**
- Modify: `app/globals.css`
- Test: `tests/realized-projects-mobile.spec.ts`

**Interfaces:**
- Consumes: navigation class names and ARIA states from Task 2.
- Produces: partial-card preview, snap behavior, hidden scrollbar, 44px controls, focus states, and a strict `719px/720px` boundary.

- [ ] **Step 1: Add base hidden navigation styles**

Outside mobile media queries, set `.realized-projects-navigation` to `display: none` so tablet and desktop layouts remain unchanged.

- [ ] **Step 2: Add mobile scroll-container rules**

Inside `@media (max-width: 719px)`, make `.realized-projects-viewport` an inline-size query container with `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`, contained horizontal overscroll, momentum scrolling, hidden scrollbar, and horizontal touch panning. Set the track gap to `16px` and add trailing space so the final card can align to the start edge.

- [ ] **Step 3: Add partial-preview card geometry**

Set each mobile card to `max(240px, calc(100cqw - 44px))`, with `scroll-snap-align: start` and `scroll-snap-stop: always`. This leaves `16px` gap plus approximately `28px` of the next card visible.

- [ ] **Step 4: Style arrows and pagination**

Display the controls as a centered row below the carousel. Give arrow buttons `44px` targets, translucent dark backgrounds, CSS chevrons, disabled opacity, and focus-visible outlines. Style dots as keyboard-accessible buttons with a larger active state. Disable smooth behavior under `prefers-reduced-motion: reduce`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npx playwright test tests/realized-projects-mobile.spec.ts`

Expected: PASS at all requested mobile widths and at the `720px` boundary.

- [ ] **Step 6: Commit implementation**

```bash
git add components/realized-projects/RealizedProjects.tsx app/globals.css tests/realized-projects-mobile.spec.ts
git commit -m "feat: add realized projects mobile carousel navigation"
```

### Task 4: Full verification

**Files:**
- Verify only; no planned production edits.

**Interfaces:**
- Consumes: completed carousel implementation.
- Produces: evidence that mobile behavior works and desktop/tablet remain stable.

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: PASS with no warnings or errors.

- [ ] **Step 2: Run relevant Playwright suites**

Run: `npx playwright test tests/realized-projects-mobile.spec.ts tests/shared-horizontal-gutters.spec.ts tests/typography-responsive.spec.ts`

Expected: PASS.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: PASS and production routes generated successfully.

- [ ] **Step 4: Inspect final worktree**

Run: `git status --short --branch && git diff --check`

Expected: only the pre-existing untracked `playwright.local.config.ts` remains; no whitespace errors.
