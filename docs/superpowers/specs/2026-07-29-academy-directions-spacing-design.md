# Academy to Directions Spacing

## Goal

Create a clear visual separation between the completed Academy ProgramCards and
the "Ключевые направления FutureLab" board at every responsive breakpoint.

## Design

Use one semantic `--academy-to-directions-gap` token on the Directions section.
Apply the gap through normal document flow rather than GSAP transforms, negative
margins, or positioning offsets.

Responsive values:

- Below 720px: `64px`
- 720px through 959px: `96px`
- 960px and above: `128px`

The gap must not change ProgramCard dimensions, Directions board geometry,
animation timelines, or the existing rounded gradient edge.

## Verification

Measure the rendered distance between the bottom of the ProgramCards grid and
the top of the Directions board after the Academy animation reaches its final
state. The result must be positive at mobile, tablet, and desktop widths, with
no overlap and no stale geometry after resizing.

Run `npm run lint` and `npm run build` after implementation.
