# Hero Responsive Design

## Goal

Make the existing Hero section responsive from 360px mobile screens through 2560px large desktops while preserving approved content, branding, media, links, typography hierarchy, and the desktop animation concept.

## Confirmed Problems

The current Hero is controlled by overlapping absolute-position rules and viewport-specific constants rather than the rendered content:

- `.hero-header`, `.hero-copy`, `.hero-description`, `.hero-image`, and `.hero-action-panel` are absolutely positioned.
- `.hero-stage` defaults to `120svh`, although its pinned behavior is calculated against the actual viewport height.
- `.hero-section` switches among fixed values such as `1900px`, `2570px`, and `calc(100svh + 1800px)`.
- Several media queries override the same `top`, `left`, width, font-size, and media dimensions.
- Hero animation targets use hard-coded width and height ranges and do not share a single source of truth with the CSS layout.
- Short landscape viewports cannot display content positioned below the clipped sticky stage.
- The layout is measured before all fonts and media are guaranteed to be ready, and it is not rebuilt explicitly when the language changes.

The failures were reproduced at `360x800`, `667x375`, `720x900`, `960x900`, `1024x768`, and `1366x768`. The approved desktop composition is visually sound at `1600x900` and larger.

## Responsive Layout Strategy

### Shared principles

- Keep one Hero component and one semantic `h1`.
- Keep the approved content, links, video sources, colors, and element order unchanged.
- Use a centered responsive frame with bounded inline padding.
- Use content-driven dimensions for text and CTA groups.
- Use `min-width: 0`, natural wrapping, and content-based heights.
- Keep the video aspect ratio stable and prevent it from exceeding its assigned visual region.
- Keep buttons at least 44px high with labels fully visible.
- Remove obsolete Hero overrides after the new rules replace them; do not layer another set of conflicting media queries on top.

### Mobile: below 720px

- Use normal document flow for the header, title, description, actions, and initial video.
- Stack the content in reading order with responsive spacing and inline padding.
- Keep the language switch and outlined brand header at the top.
- Hide the header contact CTA only where the existing mobile design already hides it.
- Allow all text and CTA labels to wrap naturally without clipping.
- Keep the initial video centered below the CTA group.
- Preserve the scroll-driven video expansion, but derive its start from the video's real rendered box.

### Short mobile landscape

- Apply the mobile flow whenever the viewport height is too short for the tablet/desktop composition, including `667x375`.
- Do not pin a clipped first viewport containing off-screen text.
- Use reduced vertical gaps while retaining readable typography and touch targets.
- Begin the video transition only after the complete copy and actions have been available in normal flow.

### Tablet: 720px to 959px

- Keep the heading across the available frame width.
- Arrange description, video, and actions as a three-part responsive composition only when each region has sufficient width.
- Fall back to a two-row composition when text height or available width makes the three-part row unsafe.
- Derive widths from the container instead of fixed `210px` columns.
- Let the Hero's initial content height grow beyond one viewport when necessary.

### Laptop: 960px to 1199px

- Retain the approved heading-first composition.
- Use a bounded three-column lower region for description, video, and actions.
- Size the side columns and video from available container width and height.
- For short laptop heights, reduce vertical spacing and media size through shared tokens, not independent top offsets.

### Desktop: 1200px to 1599px

- Preserve the current approved visual composition.
- Express positions relative to the centered desktop frame instead of the 1920px canvas.
- Bound text width and spacing so the composition remains stable through breakpoint boundaries and browser zoom.
- Keep the existing animation sequence and final expanded-video layout.

### Large desktop: 1600px and above

- Preserve the approved 1600px and 1920px composition.
- Center the content in a maximum-width frame so it does not stretch indefinitely at 2560px.
- Keep readable line lengths and cap media and gap growth.

## Typography

- Preserve the existing heading and body font families and weights.
- Use fluid sizes within each layout state, with explicit minimum and maximum values.
- Keep controlled desktop title lines where they are part of the approved composition.
- On mobile and tablet, allow the title to wrap naturally; no non-wrapping line may exceed its container.
- Use `text-wrap: balance` for the title and normal wrapping for the description.

## Animation Design

- Continue using the existing scroll-driven sequence: header and title leave, video expands, gradient follows, and supporting copy/actions transition.
- Use `gsap.matchMedia()` for mobile/short landscape, tablet, laptop, desktop, and large desktop animation contexts.
- Read initial and target boxes from actual elements and containers after layout rather than duplicating CSS coordinates in JavaScript.
- Use function-based geometry, `invalidateOnRefresh: true`, and context cleanup.
- Recalculate after `document.fonts.ready`, video metadata readiness, resize, orientation change, and language changes.
- Run one controlled `ScrollTrigger.refresh()` after geometry settles.
- Remove listeners and inline styles on cleanup so breakpoint and language changes do not retain stale geometry.
- Preserve forward and reverse scrolling without duplicate triggers or refresh loops.

## Testing Strategy

Add an automated browser geometry audit for the Hero that checks:

- the title, description, actions, and initial video remain inside the intended Hero layout;
- text and CTA regions do not overlap;
- no Hero element creates horizontal page overflow;
- button height remains at least 44px;
- media preserves its expected aspect ratio;
- breakpoint transitions do not retain stale inline geometry;
- both `/ru` and `/en` render without clipping;
- the initial, intermediate, and final scroll states remain valid in forward and reverse directions.

Validate the requested viewport matrix:

`360x800`, `390x844`, `430x932`, `667x375`, `720x900`, `768x1024`, `960x900`, `1024x768`, `1200x900`, `1366x768`, `1400x900`, `1600x900`, `1920x1080`, and `2560x1440`.

Also validate both sides of the requested boundaries: `359/360`, `719/720`, `767/768`, `959/960`, `1023/1024`, `1199/1200`, `1279/1280`, `1399/1400`, and `1599/1600`.

Perform targeted checks at 80%, 100%, 125%, and 200% browser zoom, direct load, refresh, language switching, resize, and orientation change.

## Scope Protection

This work must not change:

- approved RU or EN text;
- CTA destinations or behavior;
- image or video sources;
- component order;
- colors, branding, or typography hierarchy;
- the approved desktop composition;
- sections outside Hero.

The implementation may change only Hero structure where required for flow, Hero-specific CSS, Hero animation measurement logic, and Hero-focused tests.
