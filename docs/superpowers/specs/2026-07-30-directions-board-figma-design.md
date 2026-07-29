# Directions Board Figma Design

## Goal

Match the current `Ключевые направления FutureLab` board to the compact
proportions and visual rhythm of the supplied Figma reference without changing
any localized content or the six approved direction labels.

## Scope

- Update only the Directions board layout and its surrounding vertical spacing.
- Preserve all chip IDs, labels, order, variants, gradients, colors, and content
  sources.
- Preserve ProgramCard design, the statement block, inline video, section order,
  and animation behavior.

## Desktop Layout

At widths of `960px` and above, the board uses a compact fixed-format
composition:

- The board height is controlled by one responsive token in the approximate
  range `280px` to `330px`.
- The heading remains in the upper-left area and has enough width to wrap to no
  more than two lines on wide screens.
- All six chips form an irregular lower-right cluster.
- Each slot is associated with a stable `chip.id`, never localized label text.
- Chips use real width, height, padding, and font-size values rather than a
  scaled parent.
- Individual rotations remain small and intentional.
- The lowest chip preserves a positive inset above the gradient border.

## Tablet Layout

At widths from `720px` through `959px`:

- The board uses natural height.
- Chips use a compact two-column grid.
- Small per-chip rotations preserve the visual character without creating
  overlap.
- The heading and all six chips remain fully inside the board.

## Mobile Layout

Below `720px`:

- The board uses natural height and a single-column chip layout.
- Chips remain compact and readable with controlled rotations.
- No desktop scaling, horizontal clipping, or browser-level overflow is used.

## Spacing

Two semantic CSS tokens control:

- ProgramCards to Directions board.
- Directions board to statement.

The values are responsive and use normal document flow. No negative margins,
large translations, or z-index workarounds are introduced.

## Gradient Border

The existing gradient and rounded board treatment remain unchanged. The
gradient stays aligned with the bottom edge of the board, while the content
layout reserves a positive bottom inset above it.

## Verification

Verify Russian and English at `390`, `658`, `719`, `720`, `768`, `960`, `1200`,
`1440`, `1600`, and `1920` pixel widths. Confirm:

- All six chips are visible and inside the board.
- The heading does not intersect the cluster.
- Chip rectangles do not overlap.
- The gradient border remains fully visible.
- External spacing remains deliberate.
- The statement and video behavior are unchanged.
- No content files or localized strings changed.

Run `npm run lint` and `npm run build`.
