# Hero Video Expansion Design

## Scope

Fix the existing Hero scroll animation without changing approved content, initial responsive layout, media, controls, or the transition order into Ecosystem.

The change covers three defects:

1. Below 1200px, the expanded video is not always fully visible.
2. At some viewport sizes, the video reverses vertical direction during expansion.
3. After the Hero animation completes, transformed Hero elements remain visible over Ecosystem instead of leaving with the Hero section.

## Confirmed Cause

The animation derives its vertical target from the live `hero-stage` viewport rectangle on every update. Once the stage begins leaving its sticky or normal-flow position, its viewport `top` changes. The computed target therefore moves while the animation is still interpolating, which can reverse the video's direction.

The same live viewport compensation continues after ScrollTrigger reaches its end because the global scroll listener still calls the clamped update function. This counteracts the Hero stage moving out of view, allowing the video and supporting content to remain visually fixed over Ecosystem.

Short sub-1200 layouts make the problem more visible because the stage can use normal document flow rather than a sticky viewport stage.

## Chosen Approach

Keep the existing Hero elements and ScrollTrigger, but replace the moving vertical target with stable section-local geometry calculated during measurement and refresh.

The animation will use one canonical expansion target for the current responsive state:

- The target video size is constrained by available content width and 92% of the usable viewport height.
- The target video position is stored in Hero-section coordinates during `measure()`.
- Each frame interpolates toward that stored target; it does not recalculate the destination from the stage's current viewport position.
- At and after the trigger end, the final transforms remain relative to the Hero stage, so the complete Hero naturally scrolls away with its parent.
- Reverse scrolling uses the same geometry in reverse and returns to the original layout without stale transforms.

No new pin spacer, cloned video, fixed overlay, or second animation system will be introduced.

## Responsive Behavior

### Below 960px

- The description and buttons fade out during video expansion.
- The video expands to the largest fully visible size allowed by the viewport and Hero content width.
- The expanded video stays contained horizontally and vertically.
- After expansion, the entire Hero scrolls away before Ecosystem enters.

### 960px to 1199px

- The existing description/video/buttons composition remains.
- Supporting columns stay visible while the video expands between them.
- The video remains fully contained and follows a monotonic vertical path.
- The complete Hero leaves before Ecosystem enters.

### 1200px and Above

- Preserve the approved desktop composition and sizing.
- Apply the same stable target/release logic to prevent cross-section overlay.
- Do not change desktop title, support positions, or button geometry.

## ScrollTrigger Lifecycle

- Continue using one `hero-scroll` ScrollTrigger.
- Keep function-based `start` and `end` values and `invalidateOnRefresh: true`.
- Recalculate stable geometry on refresh, font readiness, video metadata readiness, resize, and orientation changes through the existing controlled refresh path.
- Stop viewport-following compensation after the Hero's scroll range.
- Keep cleanup responsible for the global scroll listener, animation frame, ScrollTrigger, media-query context, and inline animation properties.

## Regression Tests

Add tests before production changes and verify that they fail for the current implementation.

Test both forward and reverse scrolling at representative widths:

- 360px
- 720px
- 959px
- 960px
- 1024px
- 1199px

Assertions:

1. The expanded video remains within the viewport at its fully expanded point.
2. The video does not reverse vertical direction during forward expansion.
3. Below 960px, description and actions fade out.
4. At 960px and above, supporting columns retain the intended visibility.
5. After the Hero trigger ends and Ecosystem enters, Hero video, description, and actions do not overlap the Ecosystem panel.
6. Reverse scrolling restores the initial Hero geometry.
7. There is no horizontal page overflow.
8. Only one Hero ScrollTrigger exists after resize and language changes.

## Verification

Run the focused Hero Playwright suite, then:

```bash
npm run lint
npm run build
```

Perform visual checks for English and Russian at the affected responsive widths, including the Hero-to-Ecosystem transition.
