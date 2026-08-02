# Shared Horizontal Gutters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all approved landing-page content blocks one fluid horizontal gutter from 20px to 82px while preserving their existing internal layouts and animation behavior.

**Architecture:** Define a single `--page-inline-gutter` and `--page-content-max` pair in `app/globals.css`, then expose them through a reusable `.section-shell` class. Apply that class to existing semantic wrappers and animated tracks; narrower component-specific max widths stay intact.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS utilities, global CSS custom properties, GSAP/ScrollTrigger, Playwright.

## Global Constraints

- Preserve all Russian and English content files.
- Preserve internal card dimensions, typography, media, vertical spacing, and section order.
- Preserve Hero and Ecosystem layouts.
- Preserve GSAP timelines and animation concepts.
- Use one responsive gutter: `clamp(20px, 5vw, 82px)`.
- Keep the shared content maximum at `1436px`.
- Do not create nested duplicate page gutters.

---

### Task 1: Add horizontal-gutter regression coverage

**Files:**
- Create: `tests/shared-horizontal-gutters.spec.ts`

**Interfaces:**
- Consumes: semantic section selectors already rendered by `/ru` and `/en`.
- Produces: regression coverage for `.section-shell`, shared edge alignment, containment, and page overflow.

- [ ] **Step 1: Write the failing Playwright test**

Create a test with viewports 360, 720, 960, 1200, 1440, and 1600. For each width, open `/ru`, wait for fonts, and assert that every `.section-shell` has a left and right inset no smaller than `min(max(20, width * 0.05), 82)` within 2px tolerance. Assert that `.infrastructure-heading`, `.infrastructure-cards`, `.academy-heading`, `.academy-programs-stage`, `.directions-board`, `.directions-statement`, `.directions-post-image-divider`, `.solutions-inner`, `.realized-title-frame`, `.realized-projects-track`, `.experience-content`, `.contact-content`, and `.footer-inner` are contained by the shared shell geometry or carry the shared class themselves. Assert no horizontal page overflow.

Add one English-route smoke check at 720px confirming all shell elements have non-zero width and the document has no horizontal overflow.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npx playwright test tests/shared-horizontal-gutters.spec.ts
```

Expected: FAIL because `.section-shell` is not yet present and existing 1440px containers have less than the approved gutter.

- [ ] **Step 3: Commit the failing regression test with the implementation task**

Do not commit while RED. Continue directly to Task 2 so the commit contains a passing test and its production change.

---

### Task 2: Introduce and apply the shared section shell

**Files:**
- Modify: `app/globals.css`
- Modify: `components/infrastructure/Infrastructure.tsx`
- Modify: `components/academy/Academy.tsx`
- Modify: `components/directions/Directions.tsx`
- Modify: `components/solutions/Solutions.tsx`
- Modify: `components/realized-projects/RealizedProjects.tsx`
- Modify: `components/experience/Experience.tsx`
- Modify: `components/contact/ContactBlock.tsx`
- Modify: `components/footer/Footer.tsx`
- Test: `tests/shared-horizontal-gutters.spec.ts`

**Interfaces:**
- Consumes: CSS variables `--page-inline-gutter` and `--page-content-max`.
- Produces: `.section-shell`, a reusable centered container that reserves the approved responsive gutter.

- [ ] **Step 1: Add the shared CSS contract**

Add to `app/globals.css`:

```css
:root {
  --page-content-max: 1436px;
  --page-inline-gutter: clamp(20px, 5vw, 82px);
}

.section-shell {
  width: min(
    calc(100% - (2 * var(--page-inline-gutter))),
    var(--page-content-max)
  );
  max-width: var(--page-content-max);
  min-width: 0;
  margin-inline: auto;
  box-sizing: border-box;
}
```

- [ ] **Step 2: Apply `.section-shell` to semantic wrappers**

Apply the shared class to:

```text
Infrastructure: infrastructure-heading, infrastructure-cards, infrastructure-separator
Academy: academy-heading, academy-programs-stage
Directions: directions-board, directions-statement, directions-post-image-divider
Solutions: solutions-inner
Realized Projects: realized-title-frame and the desktop track start calculation
Experience: experience-content
Contact: contact-content
Footer: footer-inner
```

Remove only utility padding/width rules that duplicate the new outer gutter. Keep component-specific max widths and internal card padding.

For the Realized Projects track, replace its hardcoded `40/64px` and `calc((100vw-1436px)/2)` leading spacing with `var(--page-inline-gutter)` and the same `1436px` shell centering formula, so the title and first card share the page edge.

- [ ] **Step 3: Run focused tests and verify GREEN**

Run:

```bash
npx playwright test tests/shared-horizontal-gutters.spec.ts tests/ecosystem-responsive.spec.ts
```

Expected: all tests PASS, including no page overflow and the unchanged Ecosystem behavior.

- [ ] **Step 4: Commit the implementation**

```bash
git add app/globals.css components/infrastructure/Infrastructure.tsx components/academy/Academy.tsx components/directions/Directions.tsx components/solutions/Solutions.tsx components/realized-projects/RealizedProjects.tsx components/experience/Experience.tsx components/contact/ContactBlock.tsx components/footer/Footer.tsx tests/shared-horizontal-gutters.spec.ts
git commit -m "fix: standardize section horizontal gutters"
```

---

### Task 3: Full verification

**Files:**
- Verify only; no planned production edits.

**Interfaces:**
- Consumes: completed shared-shell implementation.
- Produces: fresh evidence that the change is safe to hand off.

- [ ] **Step 1: Run the focused responsive suites**

```bash
npx playwright test tests/shared-horizontal-gutters.spec.ts tests/ecosystem-responsive.spec.ts tests/hero-responsive.spec.ts
```

Expected: all tests PASS.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: exit code 0.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: exit code 0 with `/ru` and `/en` generated successfully.

- [ ] **Step 4: Inspect final diff and repository status**

```bash
git diff HEAD~1 --stat
git status --short
```

Confirm only the planned components, shared CSS, regression test, and plan documentation changed, with no locale/content edits.
