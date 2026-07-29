# Academy to Directions Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent the Academy ProgramCards from overlapping the "Ключевые направления FutureLab" board at every responsive width.

**Architecture:** Add one responsive normal-flow spacing token between the Academy section and Directions. Verify the visible rendered gap after the Academy sticky animation releases, rather than relying only on static section offsets.

**Tech Stack:** Next.js 16, Tailwind CSS v4, CSS custom properties, GSAP ScrollTrigger, Playwright.

## Global Constraints

- Do not change ProgramCard dimensions, Directions board geometry, or GSAP timelines.
- Use normal document-flow spacing.
- Preserve the existing rounded gradient edge.
- The rendered ProgramCards-to-board gap must be positive on mobile, tablet, and desktop.

---

### Task 1: Add and verify the responsive section gap

**Files:**
- Modify: `app/globals.css`
- Test: Playwright geometry check against the local development server

**Interfaces:**
- Consumes: `.academy-programs-stage .programs-grid`, `.academy-section`, `.directions-section`, and `.directions-board`
- Produces: `--academy-to-directions-gap` applied as the Directions section's normal-flow `margin-top`

- [x] **Step 1: Run the failing geometry check**

Scroll the Directions board into view at `390`, `720`, `960`, `1440`, and `1600` pixel widths. Measure:

```js
const gap =
  directionsBoard.getBoundingClientRect().top -
  programsGrid.getBoundingClientRect().bottom
```

Expected before implementation: at least one desktop width reports `gap <= 0`.

- [x] **Step 2: Add the responsive spacing token**

Add the token without changing GSAP transforms:

```css
.directions-section {
  --academy-to-directions-gap: 128px;
  margin-top: var(--academy-to-directions-gap);
}

@media (max-width: 959px) {
  .directions-section {
    --academy-to-directions-gap: 96px;
  }
}

@media (max-width: 719px) {
  .directions-section {
    --academy-to-directions-gap: 64px;
  }
}

@media (min-width: 1600px) {
  .directions-section {
    --academy-to-directions-gap: 192px;
  }
}
```

- [x] **Step 3: Re-run the geometry check**

Expected after implementation: every tested width reports `gap > 0`. If the sticky release geometry requires more room, increase only the affected responsive token and re-run the same check.

- [x] **Step 4: Verify the project**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected: all commands exit successfully.
