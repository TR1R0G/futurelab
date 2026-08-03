# Directions Board Mobile Design

## Scope

Update only the `Directions` board. Use the compact two-column grid below `720px`, and preserve the staggered decorative composition at `720px` and above without chip overlap.

## Mobile Composition

- Keep the board title in normal flow at the upper-left.
- Render the six existing direction chips as a two-column, three-row grid in their existing content order.
- Use equal-width columns and content-driven row heights.
- Use the light chip appearance for all six chips below `720px`, matching the approved reference.
- Remove chip rotation below `720px` while preserving every desktop and tablet rotation.
- Allow labels to wrap within a chip; do not truncate, clip, or reduce the text below the established responsive typography token.
- Keep the board height content-driven so wrapped labels remain inside the card.
- Preserve the board background, corner radius, bottom gradient, title, chip text, statement, animation behavior, and surrounding section order.

## Responsive Boundaries

- `0px` through `719px`: mobile two-column light-chip grid.
- `720px` and above: existing visual variants, rotation angles, typography, chip order, and staggered topology remain unchanged. Distances between chip centers and board height may expand responsively to prevent overlap.
- At narrow widths such as `360px`, both columns remain visible and labels wrap naturally.

## Non-Mobile Composition

- Keep the six existing rotation angles unchanged.
- Keep the existing relative order: `gamification` is highest, followed by `digital-tourism`, `genai-animation`, `ar-vr-webar`, `holography`, and `3d-gamedev`.
- Keep `ar-vr-webar` left of `3d-gamedev`, which remains left of `holography`.
- Keep `digital-tourism` left of `gamification`.
- Increase the distances between chip centers as one coherent composition; do not independently rearrange or reassign chips.
- Use responsive board height to contain the expanded composition at `720px`, `1000px`, `1200px`, `1400px`, and `1600px`.
- Preserve the approved responsive chip font sizes.

## Implementation Strategy

Use the existing markup and stable chip IDs. In the mobile media query, reset the responsive canvas to normal flow, replace absolute chip positioning with CSS Grid, neutralize rotations, and override chip variants to the shared light appearance. Do not duplicate components or create language-specific positioning.

The current JavaScript canvas measurement is unnecessary for the mobile grid and must not determine mobile board height. It may continue serving the existing responsive decorative composition at widths where that composition remains active.

## Verification

Add a browser regression test that verifies at `360px`, `390px`, and `719px`:

- the board contains two chip columns and three rows;
- all six chips remain inside the board;
- chip rectangles do not overlap;
- all chips use the light appearance;
- chip transforms are neutral;
- the gradient remains below the final row;
- the page has no horizontal overflow.

At `720px`, verify that the mobile-only light two-column override is no longer applied.

At `720px`, `1000px`, `1200px`, `1400px`, and `1600px`, verify that:

- all six chip rectangles are disjoint;
- each chip remains inside the board;
- rotation angles remain `-16deg`, `0deg`, `-5deg`, `-15deg`, `18deg`, and `2deg` for the six stable IDs;
- vertical and horizontal ordering matches the approved staggered topology;
- the page has no horizontal overflow.

Run the focused responsive test, existing Directions-related tests, `npm run lint`, and `npm run build`.
