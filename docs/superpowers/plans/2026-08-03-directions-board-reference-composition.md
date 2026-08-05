# Directions Board Reference Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the supplied Directions board chip composition at every viewport width from 720px upward while preserving the approved mobile grid and all localized content.

**Architecture:** Keep the existing stable direction IDs and variants, but replace the competing desktop/tablet positioning rules with one percentage-based canonical board composition. The board, title, chip dimensions, padding, and typography scale through shared CSS custom properties; the existing below-720px grid remains the final mobile override.

**Tech Stack:** Next.js 16, React 19, Tailwind/CSS, Playwright.

## Global Constraints

- Do not change Russian or English direction text, chip order, stable IDs, or visual variants.
- Apply the reference composition only at `min-width: 720px`.
- Preserve the existing mobile two-column design below 720px.
- Do not introduce page-level horizontal overflow or chip intersections.
- Do not use subagents.

---

### Task 1: Lock the reference geometry in browser tests

**Files:**
- Modify: `tests/directions-board-mobile.spec.ts`

**Interfaces:**
- Consumes: `.directions-board-card`, `.directions-board-title`, `.directions-chip-slot--<id>`, `.directions-chip`.
- Produces: regression coverage for rotations, containment, ordering, non-overlap, chip sizing, and reference-relative placement at 720, 1000, 1200, 1400, and 1600px.

- [x] **Step 1: Update expected reference rotations**

Set the expected angles to `-16`, `0`, `-5`, `-15`, `8`, and `-2` degrees for AR/VR, 3D, GenAI, Holography, Gamification, and Digital Tourism respectively.

- [x] **Step 2: Add composition assertions**

Assert that the title remains in the upper-left, Gamification is the uppermost chip, AR/VR is left of the lower cluster, all chips have positive board insets, and chip heights/padding remain content-safe.

- [x] **Step 3: Run the focused test and verify failure**

Run: `npx playwright test tests/directions-board-mobile.spec.ts --project=chromium`

Expected: the existing rules fail rotation and reference-position assertions.

### Task 2: Replace the competing 720px+ layout with the canonical composition

**Files:**
- Modify: `components/directions/Directions.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: the six existing stable IDs and `gradient`, `light`, and `outline` variants.
- Produces: a single responsive reference composition above 720px and unchanged mobile behavior below 720px.

- [x] **Step 1: Decouple the 720px+ layout from obsolete canvas calculations**

Make the canonical percentage layout authoritative above 720px so legacy canvas properties cannot alter it. Preserve cleanup and ScrollTrigger refresh behavior.

- [x] **Step 2: Define shared board and chip tokens**

Define responsive board height, title size, chip font size, chip minimum height, and chip padding once within the `min-width: 720px` layout.

- [x] **Step 3: Apply the six reference positions and rotations**

Use stable ID selectors and percentage positions corresponding to the supplied image. Keep chip widths content-appropriate and preserve all existing variants.

- [x] **Step 4: Preserve the mobile grid**

Ensure the `max-width: 719px` rules remain later in the cascade and continue removing rotations and variant backgrounds as approved.

- [x] **Step 5: Run the focused test and verify it passes**

Run: `npx playwright test tests/directions-board-mobile.spec.ts --project=chromium`

Expected: all Directions board tests pass.

### Task 3: Visual and project verification

**Files:**
- No production files beyond Task 2.

**Interfaces:**
- Consumes: the completed responsive board.
- Produces: screenshots and final validation evidence.

- [x] **Step 1: Capture viewport screenshots**

Capture the board at 720, 1000, 1200, 1400, and 1600px and compare the relative chip geometry with the supplied reference.

- [x] **Step 2: Verify both locales**

Confirm all six Russian and English labels fit without collision and that no content files changed.

- [x] **Step 3: Run lint and production build**

Run: `npm run lint`

Run: `npm run build`

Expected: both commands exit successfully.
