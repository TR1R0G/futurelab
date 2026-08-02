# Ecosystem Responsive Figma Design

## Objective

Match the existing Ecosystem card to the supplied Figma references at 360px,
720px, 960px, 1200px, and 1440px while preserving all current Russian and
English content, icons, colors, typography hierarchy, section order, and GSAP
horizontal-scroll behavior.

## Current Problem

The Ecosystem component already uses a semantic horizontal flex track, but
`app/globals.css` contains multiple generations of Ecosystem rules. Earlier
fixed widths and absolute-position overrides still participate in the cascade
alongside the newer semantic layout tokens. This makes card dimensions,
column positions, and responsive transitions difficult to predict and causes
the rendered composition to drift from the supplied designs.

## Chosen Approach

Keep the existing `Ecosystem` component structure and animation. Consolidate
the active layout into one final semantic CSS system based on responsive custom
properties. Neutralize obsolete Ecosystem positioning rules through the final
component-scoped cascade rather than adding per-text or per-language hacks.

The active layout will use:

- one card-height token per layout range;
- one shared inline and block padding system;
- explicit intro and feature column widths;
- one horizontal track gap token;
- semantic vertical offsets for the alternating feature columns;
- shared icon-to-title, title-to-description, and intro-description-to-icon
  spacing tokens;
- content-driven text blocks with no clipping or fixed text heights.

## Responsive Composition

### 1440px and above

Preserve the wide staggered composition. The intro column starts in the
upper-left. Feature columns alternate between lower and upper positions, with
the fourth visual column returning to the lower baseline. Gaps and widths are
bounded so the design remains centered and does not stretch excessively on
large displays.

### 1200px to 1439px

Use the same desktop composition with proportionally reduced card height,
padding, column widths, and gaps. All content remains in the same semantic
order and is revealed by the horizontal animation.

### 960px to 1199px

Retain the staggered horizontal track. Reduce column widths and spacing while
keeping readable typography and the same alternating vertical rhythm.

### 720px to 959px

Use a compact horizontal composition with smaller card padding and gaps. The
intro and each feature remain complete columns; no content is converted into a
grid or reordered.

### Below 720px

Keep the horizontal-scroll interaction and the Figma-inspired staggered
columns. The purple card uses narrow viewport gutters, compact padding, and
content-driven column widths. Titles and descriptions wrap naturally, every
column remains fully reachable, and no content is clipped by the rounded card.

## Content Protection

The following remain unchanged:

- `content/ecosystem.mdx`;
- `content/en/ecosystem.mdx`;
- every heading and description;
- icon sources and sizes unless responsively scaled by existing CSS;
- card color and corner radius;
- column order;
- localization behavior.

The screenshots are visual references only. Their older Russian copy will not
replace the approved current content.

## Animation

The existing GSAP match-media ranges and horizontal track translation remain
the animation source of truth. Geometry continues to use function-based
measurements with `invalidateOnRefresh: true`. The track width and card height
changes must be reflected by the existing refresh after `document.fonts.ready`.

No new timeline, pinning behavior, or scroll duration concept will be added.

## Verification

Add Ecosystem-focused Playwright coverage that verifies at representative
breakpoints:

- the card is visible and contained within the viewport;
- every heading and description has a non-zero rendered rectangle;
- no text is clipped within its semantic column;
- icons, titles, and descriptions do not overlap;
- the horizontal track reaches the last feature;
- forward and reverse scrolling remain stable;
- the page has no horizontal overflow;
- Russian and English content both remain renderable.

Capture comparison screenshots at 360px, 720px, 960px, 1200px, and 1440px.
Run the focused Playwright tests, `npm run lint`, and `npm run build` before
completion.

## Scope

Only Ecosystem component layout styles and Ecosystem regression tests are in
scope. Unrelated sections, content files, and existing user changes remain
untouched.
