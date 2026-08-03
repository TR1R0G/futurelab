import { expect, test } from '@playwright/test'

type TypographyExpectation = {
  selector: string
  sizes: readonly [number, number, number, number, number]
}

const viewports = [360, 720, 960, 1200, 1440] as const

const expectations: TypographyExpectation[] = [
  { selector: '.hero-title', sizes: [30, 46.8, 50.88, 60, 69.12] },
  { selector: '.hero-description', sizes: [16, 18, 18, 21, 23] },
  { selector: '.hero-button', sizes: [16, 16, 18, 20, 22] },
  { selector: '.ecosystem-title', sizes: [26, 36, 48, 60, 65] },
  { selector: '.ecosystem-feature-title', sizes: [22, 26, 28, 28, 33] },
  { selector: '.ecosystem-feature-description', sizes: [16, 18, 20, 21, 23] },
  { selector: '.infrastructure-heading h2', sizes: [26, 36, 48, 60, 65] },
  { selector: '.infrastructure-heading p', sizes: [16, 18, 20, 21, 23] },
  { selector: '.infrastructure-card h3', sizes: [22, 26, 28, 28, 33] },
  { selector: '.infrastructure-card p', sizes: [16, 18, 20, 21, 23] },
  { selector: '.infrastructure-cta-title', sizes: [18, 22, 25, 28, 33] },
  { selector: '.infrastructure-cta-button', sizes: [16, 16, 19, 20, 22] },
  { selector: '.academy-heading h2', sizes: [26, 36, 48, 60, 65] },
  { selector: '.academy-description', sizes: [16, 18, 20, 21, 25] },
  { selector: '.academy-card-title', sizes: [16, 18, 20, 21, 25] },
  { selector: '.program-card-title', sizes: [22, 26, 28, 28, 33] },
  { selector: '.program-card-description', sizes: [16, 18, 20, 20, 22] },
  { selector: '.program-card-meta', sizes: [16, 18, 18, 20, 22] },
  { selector: '.program-card-cta', sizes: [16, 16, 16, 20, 22] },
  { selector: '.directions-board-title', sizes: [22, 26, 28, 28, 33] },
  { selector: '.directions-chip', sizes: [16, 18, 20, 21, 23] },
  { selector: '.directions-statement-copy', sizes: [26, 30, 36, 48, 55] },
  { selector: '.solutions-heading h2', sizes: [26, 36, 48, 60, 65] },
  { selector: '.solutions-description', sizes: [16, 18, 20, 21, 23] },
  { selector: '.solutions-card-title', sizes: [22, 30, 38, 50, 55] },
  { selector: '.solutions-card-description', sizes: [16, 18, 20, 21, 23] },
  { selector: '.realized-title-frame h2', sizes: [26, 36, 50, 50, 55] },
  { selector: '.realized-project-card-title', sizes: [22, 26, 36, 38, 40] },
  { selector: '.realized-project-card-description', sizes: [16, 18, 20, 21, 23] },
  { selector: '.experience-content h2', sizes: [26, 36, 40, 52, 55] },
  { selector: '.trust-intro', sizes: [16, 18, 20, 21, 23] },
  { selector: '.experience-stat-card-title', sizes: [18, 20, 22, 23, 25] },
  { selector: '.experience-stat-card-label', sizes: [16, 18, 20, 21, 23] },
  { selector: '.contact-content > h2', sizes: [26, 36, 40, 52, 55] },
  { selector: '.contact-card-intro h3', sizes: [22, 30, 30, 30, 30] },
  { selector: '.contact-card-description', sizes: [16, 18, 21, 21, 23] },
  { selector: '.contact-item p', sizes: [16, 18, 21, 21, 22] },
  { selector: '.footer-contact-text', sizes: [12, 14, 14, 14, 16] },
]

for (const [viewportIndex, width] of viewports.entries()) {
  test(`uses the approved typography hierarchy at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => document.fonts.ready)

    for (const expectation of expectations) {
      const element = page.locator(expectation.selector).first()
      await expect(element, `${expectation.selector} should exist`).toHaveCount(1)

      const fontSize = await element.evaluate((node) =>
        Number.parseFloat(getComputedStyle(node).fontSize),
      )

      expect(
        fontSize,
        `${expectation.selector} at ${width}px`,
      ).toBeCloseTo(expectation.sizes[viewportIndex], 0)
    }

    const overflow = await page.evaluate((selectors) => {
      const overflowingText = selectors.flatMap((selector) =>
        [...document.querySelectorAll<HTMLElement>(selector)]
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map((element) => ({
            selector,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          })),
      )

      return {
        page:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        text: overflowingText,
      }
    }, expectations.map(({ selector }) => selector))

    expect(overflow.page, `page overflow at ${width}px`).toBe(false)
    expect(overflow.text, `text overflow at ${width}px`).toEqual([])
  })
}
