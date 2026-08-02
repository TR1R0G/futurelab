# Shared Horizontal Gutters Design

## Objective

Introduce one responsive horizontal-spacing standard for the main FutureLab
landing-page sections while preserving all approved content, component order,
internal card layouts, typography, animation concepts, and the current wide
desktop composition.

## Current Problem

The affected sections use a mixture of `px-5`, `md:px-8`, breakpoint-specific
padding removal, `calc(100% - ...)` widths, and containers capped at `1436px`.
At intermediate and desktop widths this produces inconsistent page edges. Near
1440px, a `1436px` container can leave almost no visible outer margin.

## Shared Container Standard

Add a single component-scoped page-shell system:

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
  margin-inline: auto;
  min-width: 0;
}
```

The fluid gutter produces approximately:

- 20px at 360px;
- 36px at 720px;
- 48px at 960px;
- 60px at 1200px;
- 72px at 1440px;
- 80px at 1600px, after which the `1436px` content maximum remains the main
  width constraint.

The exact implementation may use an equivalent project-specific class or CSS
custom-property name, but there must be one source of truth.

## Elements In Scope

Apply the shared outer alignment to:

- Infrastructure title and body;
- Infrastructure cards;
- Academy title and body;
- Academy benefit cards;
- Academy ProgramCards;
- Directions board card;
- Directions statement;
- `.directions-post-image-divider`;
- Solutions heading and description;
- Solutions cards;
- Realized Projects title and project cards;
- Experience/Trust title and body;
- Experience/Trust stat cards;
- Experience/Trust additional copy;
- Contact page content;
- Footer page content.

## Layout Rules

The shared shell controls only the outer horizontal safe area. Existing
component-specific `max-width` values remain valid inside that shell. Narrower
elements such as the Academy benefit-card stage, descriptions, CTA cards, and
text measures stay centered or left-aligned according to their existing
design.

Do not change:

- card dimensions or internal padding;
- text, localization, wrapping rules, or typography;
- media dimensions or sources;
- section order;
- vertical spacing;
- GSAP timelines, sticky behavior, or animation concepts;
- the Ecosystem track composition;
- the Hero layout.

Avoid nested outer gutters. Each relationship should be controlled by either
the section shell or a deliberately narrower inner container, never by both
section padding and child padding that represent the same page edge.

## Responsive Behavior

The gutter changes continuously below wide desktop rather than jumping at
every breakpoint. The existing breakpoint-specific internal layouts continue
to determine grid columns, card stacking, and animation geometry.

At all widths:

- all scoped content shares the same visible left and right page edges where
  its own narrower max-width does not intentionally center it;
- no section creates horizontal page overflow;
- centered narrow components remain centered;
- full-width decorative backgrounds remain full width;
- dividers align with the shared content shell.

## Animation Safety

Where GSAP or ScrollTrigger reads container geometry, retain function-based
measurements and existing `invalidateOnRefresh` behavior. If shell width
changes affect measurements, rely on the existing controlled refresh after
fonts load and on resize. Do not add refresh loops or viewport-specific
JavaScript layout calculations.

## Verification

Add a focused Playwright regression test that measures the scoped containers
at representative widths and confirms:

- expected responsive gutter size within a small tolerance;
- matching left/right alignment for elements intended to share the page edge;
- intentional narrower components remain inside the shell;
- no horizontal page overflow;
- Russian and English routes render without missing content;
- forward and reverse animated scrolling remains usable.

Verify at 360px, 720px, 960px, 1200px, 1440px, and 1600px, including the
719/720px, 959/960px, 1199/1200px, and 1439/1440px boundaries. Run the focused
Playwright tests, `npm run lint`, and `npm run build` before completion.

## Scope Protection

No content or locale files are part of this change. Existing unrelated work in
the repository must be preserved.
