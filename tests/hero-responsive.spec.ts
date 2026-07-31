import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 667, height: 375 },
  { width: 720, height: 900 },
  { width: 768, height: 1024 },
  { width: 960, height: 900 },
  { width: 1024, height: 768 },
  { width: 1200, height: 900 },
  { width: 1366, height: 768 },
  { width: 1400, height: 900 },
  { width: 1600, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

async function waitForHero(page: Page) {
  await page.locator('.hero-section').waitFor({ state: 'visible' })
  await page.waitForFunction(() =>
    !document.documentElement.classList.contains('is-preloading'),
  )
  await page.evaluate(() => document.fonts.ready)
}

function intersects(a: DOMRect, b: DOMRect) {
  return !(
    a.right <= b.left ||
    b.right <= a.left ||
    a.bottom <= b.top ||
    b.bottom <= a.top
  )
}

for (const language of ['en', 'ru'] as const) {
  for (const viewport of viewports) {
    test(`${language} Hero fits at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto(`/${language}`)
      await waitForHero(page)

      const result = await page.evaluate(() => {
        const section = document.querySelector<HTMLElement>('.hero-section')!
        const title = document.querySelector<HTMLElement>('.hero-title')!
        const description = document.querySelector<HTMLElement>('.hero-description')!
        const actions = document.querySelector<HTMLElement>('.hero-action-panel')!
        const image = document.querySelector<HTMLElement>('.hero-image')!
        const buttons = [...document.querySelectorAll<HTMLElement>('.hero-button')]
        const sectionRect = section.getBoundingClientRect()
        const rects = [title, description, actions, image].map((element) =>
          element.getBoundingClientRect(),
        )

        return {
          horizontalOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          sectionWidth: sectionRect.width,
          viewportWidth: window.innerWidth,
          rects: rects.map(({ left, right, top, bottom, width, height }) => ({
            left,
            right,
            top,
            bottom,
            width,
            height,
          })),
          buttonHeights: buttons.map((button) =>
            button.getBoundingClientRect().height,
          ),
        }
      })

      expect(result.horizontalOverflow).toBe(false)
      expect(result.sectionWidth).toBeLessThanOrEqual(result.viewportWidth + 0.5)
      for (const rect of result.rects) {
        expect(rect.left).toBeGreaterThanOrEqual(-0.5)
        expect(rect.right).toBeLessThanOrEqual(result.viewportWidth + 0.5)
        expect(rect.width).toBeGreaterThan(0)
        expect(rect.height).toBeGreaterThan(0)
      }
      for (const height of result.buttonHeights) {
        expect(height).toBeGreaterThanOrEqual(44)
      }
    })
  }
}
