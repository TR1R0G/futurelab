# Solutions Card Horizontal Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align every desktop Solutions card with the same shared horizontal shell edges used by the Solutions title and description.

**Architecture:** Keep `.solutions-inner.section-shell` as the sole outer-width owner. Replace the desktop-only centered `1170px` card override with full shell width and protect the relationship through a browser-level geometry assertion.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4/CSS, Playwright.

## Global Constraints

- Preserve all Solutions content, typography, card heights, radii, internal padding, media, links, and GSAP behavior.
- Preserve the existing layout below 1370px.
- Do not change other section spacing.
- Do not introduce horizontal page overflow.

---

### Task 1: Align Solutions cards to the shared shell

**Files:**
- Modify: `tests/shared-horizontal-gutters.spec.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `.solutions-inner.section-shell`, `.solutions-card-outline`, and the existing `readLayout()` Playwright geometry helper.
- Produces: Solutions card rectangles whose left and right edges equal the calculated shared shell edges at desktop widths.

- [ ] **Step 1: Write the failing desktop alignment assertion**

Extend the viewport list with `1370` and `1920`. In the existing viewport test, add exact card-edge assertions for widths at or above 1370px:

```ts
if (width >= 1370) {
	const card = layout.contained.find(
		box => box.selector === '.solutions-card-outline',
	)

	expect(card, '.solutions-card-outline').toBeDefined()
	expect(card?.left, '.solutions-card-outline left edge').toBeCloseTo(
		shellLeft,
		0,
	)
	expect(card?.right, '.solutions-card-outline right edge').toBeCloseTo(
		shellRight,
		0,
	)
}
```

- [ ] **Step 2: Run the targeted test and verify it fails for the current 1170px cards**

Run:

```bash
npx playwright test tests/shared-horizontal-gutters.spec.ts
```

Expected: FAIL at one or more widths at or above 1370px because `.solutions-card-outline` is narrower than the shell.

- [ ] **Step 3: Apply the minimal desktop CSS fix**

Replace the final desktop override with:

```css
@media (min-width: 1370px) {
	.solutions-inner.section-shell .solutions-heading,
	.solutions-inner.section-shell .solutions-description {
		left: 0 !important;
	}

	.solutions-inner.section-shell .solutions-card-outline {
		left: 0 !important;
		width: 100% !important;
		transform: none;
	}
}
```

- [ ] **Step 4: Run the targeted test and verify it passes**

Run:

```bash
npx playwright test tests/shared-horizontal-gutters.spec.ts
```

Expected: PASS at 360, 720, 960, 1200, 1370, 1400, 1440, 1600, and 1920px with no horizontal overflow.

- [ ] **Step 5: Run project verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit with code 0.

- [ ] **Step 6: Commit implementation**

```bash
git add app/globals.css tests/shared-horizontal-gutters.spec.ts docs/superpowers/plans/2026-08-03-solutions-card-horizontal-alignment.md
git commit -m "fix: align solutions cards with section gutters"
```
