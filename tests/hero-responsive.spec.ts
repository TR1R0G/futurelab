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

type Geometry = {
  left: number
  top: number
  width: number
  height: number
}

const desktopBaselines: Record<
  number,
  Record<
    'stage' | 'header' | 'title' | 'description' | 'actions' | 'image',
    Partial<Geometry>
  >
> = {
  1600: {
    stage: { left: 0, top: 0, width: 1600, height: 1080 },
    header: { left: 0, top: 30, width: 1600, height: 64 },
    title: { left: 82, top: 269, width: 1172 },
    description: { left: 82, top: 645, width: 402, height: 234.56 },
    actions: { left: 1189, top: 649, width: 329, height: 174 },
    image: { left: 715, top: 557, width: 170, height: 298 },
  },
  1920: {
    stage: { left: 0, top: 0, width: 1920, height: 1296 },
    header: { left: 0, top: 30, width: 1920, height: 64 },
    title: { left: 242, top: 269, width: 1172 },
    description: { left: 242, top: 735, width: 402, height: 234.56 },
    actions: { left: 1349, top: 739, width: 329, height: 174 },
    image: { left: 875, top: 647, width: 170, height: 298 },
  },
  2560: {
    stage: { left: 0, top: 0, width: 2560, height: 1728 },
    header: { left: 0, top: 30, width: 2560, height: 64 },
    title: { left: 562, top: 269, width: 1172 },
    description: { left: 562, top: 735, width: 402, height: 234.56 },
    actions: { left: 1669, top: 739, width: 329, height: 174 },
    image: { left: 1195, top: 647, width: 170, height: 298 },
  },
}

async function waitForHero(page: Page) {
  await page.locator('.hero-section').waitFor({ state: 'visible' })
  await page.waitForFunction(() =>
    !document.documentElement.classList.contains('is-preloading'),
  )
  await page.evaluate(() => document.fonts.ready)
}

async function readHeroLayoutState(page: Page) {
  return page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>('.hero-stage')!
    const title = document.querySelector<HTMLElement>('.hero-title')!
    const description = document.querySelector<HTMLElement>('.hero-description')!
    const actions = document.querySelector<HTMLElement>('.hero-action-panel')!
    const image = document.querySelector<HTMLElement>('.hero-image')!
    const support = document.querySelector<HTMLElement>('.hero-support')!
    const stageRect = stage.getBoundingClientRect()
    const rects = {
      title: title.getBoundingClientRect(),
      description: description.getBoundingClientRect(),
      actions: actions.getBoundingClientRect(),
      image: image.getBoundingClientRect(),
    }
    const overlaps = (a: DOMRect, b: DOMRect) =>
      !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top)
    const toGeometry = ({ left, top, right, bottom, width, height }: DOMRect) => ({
      left,
      top,
      right,
      bottom,
      width,
      height,
    })
    const stageStyle = getComputedStyle(stage)
    const supportStyle = getComputedStyle(support)

    return {
      stagePosition: stageStyle.position,
      stageOverflow: stageStyle.overflow,
      supportDisplay: supportStyle.display,
      supportColumns: supportStyle.gridTemplateColumns,
      stageRect: toGeometry(stageRect),
      rects: Object.fromEntries(
        Object.entries(rects).map(([name, rect]) => [name, toGeometry(rect)]),
      ),
      overlaps: {
        titleDescription: overlaps(rects.title, rects.description),
        descriptionActions: overlaps(rects.description, rects.actions),
        actionsImage: overlaps(rects.actions, rects.image),
      },
    }
  })
}

for (const language of ['en', 'ru'] as const) {
  for (const viewport of viewports) {
    test(`${language} Hero fits at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto(`/${language}`)
      await waitForHero(page)

      const result = await page.evaluate(() => {
        const section = document.querySelector<HTMLElement>('.hero-section')!
        const stage = document.querySelector<HTMLElement>('.hero-stage')!
        const header = document.querySelector<HTMLElement>('.hero-header')!
        const title = document.querySelector<HTMLElement>('.hero-title')!
        const description = document.querySelector<HTMLElement>('.hero-description')!
        const actions = document.querySelector<HTMLElement>('.hero-action-panel')!
        const image = document.querySelector<HTMLElement>('.hero-image')!
        const buttons = [...document.querySelectorAll<HTMLElement>('.hero-button')]
        const sectionRect = section.getBoundingClientRect()
        const stageRect = stage.getBoundingClientRect()
        const headerRect = header.getBoundingClientRect()
        const titleRect = title.getBoundingClientRect()
        const descriptionRect = description.getBoundingClientRect()
        const actionsRect = actions.getBoundingClientRect()
        const imageRect = image.getBoundingClientRect()
        const rects = {
          header: headerRect,
          title: titleRect,
          description: descriptionRect,
          actions: actionsRect,
          image: imageRect,
        }
        const intersects = (a: DOMRect, b: DOMRect) =>
          !(
            a.right <= b.left ||
            b.right <= a.left ||
            a.bottom <= b.top ||
            b.bottom <= a.top
          )
        const toGeometry = ({ left, top, right, bottom, width, height }: DOMRect) => ({
          left,
          top,
          right,
          bottom,
          width,
          height,
        })

        return {
          horizontalOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          sectionWidth: sectionRect.width,
          viewportWidth: window.innerWidth,
          sectionRect: toGeometry(sectionRect),
          stageRect: toGeometry(stageRect),
          rects: Object.fromEntries(
            Object.entries(rects).map(([name, rect]) => [name, toGeometry(rect)]),
          ),
          overlaps: {
            titleDescription: intersects(titleRect, descriptionRect),
            descriptionActions: intersects(descriptionRect, actionsRect),
            actionsImage: intersects(actionsRect, imageRect),
          },
          imageAspect: imageRect.width / imageRect.height,
          buttonHeights: buttons.map((button) =>
            button.getBoundingClientRect().height,
          ),
        }
      })

      expect(result.horizontalOverflow).toBe(false)
      expect(result.sectionWidth).toBeLessThanOrEqual(result.viewportWidth + 0.5)
      expect(result.stageRect.left).toBeGreaterThanOrEqual(
        result.sectionRect.left - 0.5,
      )
      expect(result.stageRect.right).toBeLessThanOrEqual(
        result.sectionRect.right + 0.5,
      )
      expect(result.stageRect.top).toBeGreaterThanOrEqual(
        result.sectionRect.top - 0.5,
      )
      expect(result.stageRect.bottom).toBeLessThanOrEqual(
        result.sectionRect.bottom + 0.5,
      )
      for (const [name, rect] of Object.entries(result.rects)) {
        expect(rect.left).toBeGreaterThanOrEqual(-0.5)
        expect(rect.right).toBeLessThanOrEqual(result.viewportWidth + 0.5)
        expect(rect.width).toBeGreaterThan(0)
        expect(rect.height).toBeGreaterThan(0)
        expect(rect.left, `${name} left`).toBeGreaterThanOrEqual(
          result.stageRect.left - 0.5,
        )
        expect(rect.right, `${name} right`).toBeLessThanOrEqual(
          result.stageRect.right + 0.5,
        )
        expect(rect.top, `${name} top`).toBeGreaterThanOrEqual(
          result.stageRect.top - 0.5,
        )
        expect(rect.bottom, `${name} bottom`).toBeLessThanOrEqual(
          result.stageRect.bottom + 0.5,
        )
      }
      expect(result.overlaps.titleDescription).toBe(false)
      expect(result.overlaps.descriptionActions).toBe(false)
      expect(result.overlaps.actionsImage).toBe(false)
      expect(result.imageAspect).toBeCloseTo(530 / 928, 2)
      for (const height of result.buttonHeights) {
        expect(height).toBeGreaterThanOrEqual(44)
      }

      const baseline = desktopBaselines[viewport.width]
      if (baseline) {
        for (const [name, expected] of Object.entries(baseline)) {
          const actual =
            name === 'stage'
              ? result.stageRect
              : result.rects[name as keyof typeof result.rects]

          for (const [dimension, expectedValue] of Object.entries(expected)) {
            expect(
              Math.abs(actual[dimension as keyof Geometry] - expectedValue),
              `${language} ${viewport.width} ${name} ${dimension}`,
            ).toBeLessThanOrEqual(1)
          }
        }
      }
    })
  }
}

const shortHeightCases = [
  { width: 768, height: 650, expectedPosition: 'relative', expectedOverflow: 'visible', tracks: 1 },
  { width: 1024, height: 650, expectedPosition: 'relative', expectedOverflow: 'visible', tracks: 1 },
  { width: 1024, height: 768, expectedPosition: 'relative', expectedOverflow: 'visible', tracks: 1 },
  { width: 1024, height: 769, expectedPosition: 'sticky', expectedOverflow: 'hidden', tracks: 3 },
] as const

for (const viewport of shortHeightCases) {
  test(`ru Hero uses the content-fit state at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/ru')
    await waitForHero(page)

    const result = await readHeroLayoutState(page)

    expect(result.stagePosition).toBe(viewport.expectedPosition)
    expect(result.stageOverflow).toBe(viewport.expectedOverflow)
    expect(result.supportDisplay).toBe('grid')
    expect(result.supportColumns.trim().split(/\s+/)).toHaveLength(viewport.tracks)

    for (const [name, rect] of Object.entries(result.rects)) {
      expect(rect.left, `${name} left`).toBeGreaterThanOrEqual(
        result.stageRect.left - 0.5,
      )
      expect(rect.right, `${name} right`).toBeLessThanOrEqual(
        result.stageRect.right + 0.5,
      )
      expect(rect.top, `${name} top`).toBeGreaterThanOrEqual(
        result.stageRect.top - 0.5,
      )
      expect(rect.bottom, `${name} bottom`).toBeLessThanOrEqual(
        result.stageRect.bottom + 0.5,
      )
    }

    expect(result.overlaps.titleDescription).toBe(false)
    expect(result.overlaps.descriptionActions).toBe(false)
    expect(result.overlaps.actionsImage).toBe(false)
  })
}

test('ru Hero coordinates remain continuous across former height thresholds', async ({ page }) => {
  for (const { width, heights } of [
    { width: 1366, heights: [819, 820, 821] },
    { width: 1400, heights: [949, 950, 951] },
  ]) {
    const samples = []

    for (const height of heights) {
      await page.setViewportSize({ width, height })
      await page.goto('/ru')
      await waitForHero(page)
      samples.push(await readHeroLayoutState(page))
    }

    for (let index = 1; index < samples.length; index += 1) {
      for (const name of ['title', 'description', 'actions', 'image'] as const) {
        expect(
          Math.abs(samples[index].rects[name].top - samples[index - 1].rects[name].top),
          `${width}px ${name} top continuity`,
        ).toBeLessThanOrEqual(2)
      }
    }
  }
})

test('ru Hero stage height remains continuous across 1600px', async ({ page }) => {
  const heights = []

  for (const width of [1599, 1600, 1601]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ru')
    await waitForHero(page)
    heights.push((await readHeroLayoutState(page)).stageRect.height)
  }

  for (let index = 1; index < heights.length; index += 1) {
    expect(
      Math.abs(heights[index] - heights[index - 1]),
      'stage height continuity',
    ).toBeLessThanOrEqual(2)
  }
})
