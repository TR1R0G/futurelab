# Solutions Card Horizontal Alignment

## Goal

Remove the additional desktop horizontal inset from the Solutions cards so their outer left and right edges align with the shared `section-shell` used by the Solutions title and description.

## Current Cause

At viewport widths of 1370px and above, the final CSS override limits `.solutions-card-outline` to `1170px`, positions it at `left: 50%`, and applies `translateX(-50%)`. The title and description instead begin at the left edge of `.solutions-inner.section-shell`, so the cards have visibly larger horizontal margins.

## Approved Layout

- Keep `.solutions-inner` as the shared horizontal container.
- At 1370px and above, make every `.solutions-card-outline` span `100%` of `.solutions-inner`.
- Align cards to `left: 0` and remove the centering transform.
- Preserve all card content, internal padding, typography, heights, radii, media, links, and GSAP behavior.
- Preserve the existing behavior below 1370px, where cards already use the full available shell width.

## Verification

Extend the horizontal-gutter regression test to assert that the Solutions title, description, and card outer edges align at 1370, 1400, 1440, 1600, and 1920px.

Also verify:

- no horizontal page overflow;
- Russian and English content remains unchanged;
- Solutions animations and media geometry are unaffected;
- `npm run lint` passes;
- `npm run build` passes.

## Scope

Only the Solutions card outer horizontal alignment and its regression coverage are in scope. No other section spacing is changed by this specification.
