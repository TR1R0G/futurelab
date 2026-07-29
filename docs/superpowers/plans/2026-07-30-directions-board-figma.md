# Directions Board Figma Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the Directions board into a compact Figma-inspired layout while preserving all six approved direction labels and existing behavior.

**Architecture:** Keep the existing semantic JSX and stable `chip.id` classes in `Directions.tsx`. Replace the final winning Directions CSS block with responsive board tokens: ID-based absolute positioning at `960px+`, a two-column natural-flow grid at `720px–959px`, and a one-column natural-flow grid below `720px`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS utilities, CSS media queries, Playwright browser verification.

## Global Constraints

- Do not change any approved text, locale data, chip order, or chip variant.
- Preserve ProgramCard design, statement text, inline video, section order, and animation behavior.
- Do not shrink the board with `transform: scale(...)`.
- Keep the existing gradient colors, board background, and rounded border treatment.
- All six chips must remain inside the board without overlap or browser-level horizontal overflow.

---

### Task 1: Compact Directions Board Geometry

**Files:**
- Modify: `app/globals.css:4820-5042`

**Interfaces:**
- Consumes: `.directions-chip-slot--<chip.id>` classes rendered by `Directions.tsx`.
- Produces: responsive board sizing tokens and six stable desktop slot positions.

- [ ] **Step 1: Capture the current board geometry**

Run the local site and evaluate the following at Russian `1440x900`:

```js
const board = document.querySelector('.directions-board-card')
const title = document.querySelector('.directions-board-title')
const chips = [...document.querySelectorAll('.directions-chip')]
const boardRect = board.getBoundingClientRect()
const titleRect = title.getBoundingClientRect()
const chipRects = chips.map((chip) => chip.getBoundingClientRect())

({
  boardWidth: boardRect.width,
  boardHeight: boardRect.height,
  titleBottom: titleRect.bottom - boardRect.top,
  chipClusterWidth:
    Math.max(...chipRects.map((rect) => rect.right)) -
    Math.min(...chipRects.map((rect) => rect.left)),
  chipClusterHeight:
    Math.max(...chipRects.map((rect) => rect.bottom)) -
    Math.min(...chipRects.map((rect) => rect.top)),
})
```

Expected: the board is approximately `560px` tall and the chips occupy a large regular two-column grid.

- [ ] **Step 2: Replace desktop grid geometry with ID-based positions**

In the final semantic Directions CSS block, define shared tokens and compact desktop geometry:

```css
.directions-section {
  --academy-to-directions-gap: clamp(88px, 7vw, 112px);
  --directions-board-statement-gap: clamp(112px, 10vw, 160px);
}

.directions-board {
  --directions-board-height: clamp(300px, 22vw, 330px);
  --directions-board-radius: 35px;
}

.directions-board-card {
  min-height: var(--directions-board-height) !important;
  height: var(--directions-board-height) !important;
  padding: clamp(28px, 2.5vw, 40px) !important;
}

.directions-chip-layer {
  position: absolute !important;
  inset: 0 !important;
  display: block !important;
}

.directions-chip-slot {
  position: absolute !important;
  min-height: 0 !important;
}
```

Add one rule for each stable ID so the six chips form a compact lower-right cluster. Use percentage `left`/`top` positions and bounded widths so the composition scales with the board:

```css
.directions-chip-slot--ar-vr-webar {
  left: 45%;
  top: 34%;
  width: 31%;
}

.directions-chip-slot--3d-gamedev {
  left: 72%;
  top: 31%;
  width: 25%;
}

.directions-chip-slot--genai-animation {
  left: 51%;
  top: 56%;
  width: 29%;
}

.directions-chip-slot--holography {
  left: 75%;
  top: 54%;
  width: 22%;
}

.directions-chip-slot--gamification {
  left: 54%;
  top: 76%;
  width: 27%;
}

.directions-chip-slot--digital-tourism {
  left: 76%;
  top: 74%;
  width: 21%;
}
```

Tune the final percentages visually while keeping every transformed rectangle inside the board and above the gradient border.

- [ ] **Step 3: Make chips use compact real dimensions**

Replace the oversized winning chip rules with content-driven dimensions:

```css
.directions-chip {
  width: 100% !important;
  min-height: 44px !important;
  padding: 9px 18px !important;
  font-size: clamp(13px, 1.05vw, 17px) !important;
  line-height: 1.12 !important;
  text-wrap: balance;
}
```

Keep the existing per-ID rotations and variant styles unchanged.

- [ ] **Step 4: Preserve compact responsive natural flow**

At `720px–959px`, use:

```css
.directions-chip-layer {
  position: relative !important;
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 18px 20px !important;
  margin-top: 32px !important;
}
```

At `<720px`, use:

```css
.directions-chip-layer {
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 16px !important;
}
```

Reset every slot to `position: relative`, `inset: auto`, and `width: 100%` in both ranges so desktop coordinates cannot leak across breakpoints.

- [ ] **Step 5: Run static verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit with status `0`.

- [ ] **Step 6: Commit the geometry change**

```bash
git add app/globals.css
git commit -m "fix: compact directions board layout"
```

---

### Task 2: Visual and Responsive Verification

**Files:**
- Modify only if verification exposes a board-specific defect: `app/globals.css:4820-5042`
- Create screenshots under: `artifacts/directions-board/`

**Interfaces:**
- Consumes: the responsive board tokens and stable ID positions from Task 1.
- Produces: verified RU/EN layout and viewport screenshots.

- [ ] **Step 1: Verify desktop board bounds**

At `960`, `1200`, `1440`, `1600`, and `1920` pixel widths, evaluate:

```js
const board = document.querySelector('.directions-board-card')
const title = document.querySelector('.directions-board-title')
const chips = [...document.querySelectorAll('.directions-chip')]
const boardRect = board.getBoundingClientRect()
const titleRect = title.getBoundingClientRect()
const chipRects = chips.map((chip) => chip.getBoundingClientRect())

const overlaps = chipRects.flatMap((rect, index) =>
  chipRects.slice(index + 1).map((other, offset) => ({
    pair: [index, index + offset + 1],
    overlaps:
      rect.left < other.right &&
      rect.right > other.left &&
      rect.top < other.bottom &&
      rect.bottom > other.top,
  })),
)

({
  titleIntersectsCluster: chipRects.some(
    (rect) =>
      titleRect.left < rect.right &&
      titleRect.right > rect.left &&
      titleRect.top < rect.bottom &&
      titleRect.bottom > rect.top,
  ),
  chipsOutsideBoard: chipRects.map((rect, index) => ({
    index,
    outside:
      rect.left < boardRect.left ||
      rect.right > boardRect.right ||
      rect.top < boardRect.top ||
      rect.bottom > boardRect.bottom,
  })),
  overlaps,
})
```

Expected: `titleIntersectsCluster` is false, every `outside` value is false, and every chip-pair `overlaps` value is false.

- [ ] **Step 2: Verify tablet and mobile layout**

At `390`, `658`, `719`, `720`, and `768` pixel widths, confirm:

- all six labels are present;
- chip text is fully visible;
- no chip rectangle crosses the board rectangle;
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`;
- the gradient line remains visible below the final chip.

- [ ] **Step 3: Verify both locales**

Repeat bounds checks on Russian and English pages. Confirm stable IDs preserve the same visual variants and positions while localized text wraps naturally.

- [ ] **Step 4: Capture required screenshots**

Capture full-page or section screenshots at:

```text
360x800
720x900
1440x900
1600x900
```

Store them as:

```text
artifacts/directions-board/360.png
artifacts/directions-board/720.png
artifacts/directions-board/1440.png
artifacts/directions-board/1600.png
```

- [ ] **Step 5: Re-run final verification**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected: all commands exit with status `0`, and `git diff --check` reports no whitespace errors.

- [ ] **Step 6: Commit screenshot-supported refinements**

If CSS changed during visual tuning:

```bash
git add app/globals.css
git commit -m "fix: tune directions board responsive spacing"
```

