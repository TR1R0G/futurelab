# Realized Projects Mobile Carousel Design

## Scope

Enhance only the `RealizedProjects` mobile experience below `720px`. The existing tablet and desktop layout, GSAP behavior, project content, media overlay, and card design remain unchanged.

## Mobile Layout

The existing `.realized-projects-viewport` remains the sole horizontal scroll container. Its track uses native horizontal scrolling with mandatory scroll snap, smooth scrolling, contained overscroll, momentum scrolling on iOS, and a hidden visual scrollbar.

Each mobile card is sized from the actual scroll-container width so the current card is fully visible while approximately `24px` of the next card remains visible after the inter-card gap. The section continues to protect the page from global horizontal overflow; only the track can scroll horizontally.

Navigation controls appear in a dedicated row below the carousel. Previous and next buttons flank centered pagination dots. This placement prevents controls from covering project text, media, the play control, or the `Watch video` action.

## State And Navigation

`RealizedProjects` keeps refs for the scroll container and each card. The active card is the card whose measured left edge is closest to the container's current `scrollLeft`. Scroll-state updates are throttled with `requestAnimationFrame`.

Arrow and pagination actions scroll to a card's measured `offsetLeft`, adjusted for the container's scroll padding. Smooth behavior is used unless `prefers-reduced-motion: reduce` is active. Previous and next availability is derived from the real scroll position, so dragging, touch swiping, arrow clicks, and pagination clicks remain synchronized.

Geometry is recalculated after font readiness and through `ResizeObserver`. Event listeners, animation frames, media-query listeners, and observers are removed during cleanup.

## Accessibility

Controls use semantic buttons with a minimum `44px` target, disabled states, and visible `:focus-visible` outlines. Labels are localized without changing existing section content:

- English: `Previous project`, `Next project`, `Go to project N`, `Project navigation`.
- Russian: `Предыдущий проект`, `Следующий проект`, `Перейти к проекту N`, `Навигация по проектам`.

Pagination exposes the active item with `aria-current="true"`. Chevron icons are CSS shapes because the project has no icon library dependency.

## Stable Identity

The current content model has no project IDs. Card refs and React keys use the existing stable media path (`video`, falling back to `image`) rather than localized titles or array indexes. No RU or EN content text is changed.

## Responsive Boundary

All carousel sizing, snap behavior, controls, and control visibility are scoped to `max-width: 719px`. At `720px` and above the controls are hidden and existing layout rules continue unchanged.

## Verification

Playwright coverage verifies at representative mobile widths that:

- the track scrolls while the page does not overflow horizontally;
- the next card is partially visible;
- cards snap and remain inside the scroll container;
- arrows and dots navigate using actual card positions;
- arrow state follows manual scrolling;
- controls are accessible and hidden at `720px`;
- reduced motion disables smooth navigation.

Run `npm run lint`, the focused Playwright spec, and `npm run build` before completion.
