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
  { width: 1600, height: 1080 },
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
  string,
  Record<
    'stage' | 'header' | 'title' | 'description' | 'actions' | 'image',
    Partial<Geometry>
  >
> = {
  '1600x900': {
    stage: { left: 0, top: 0, width: 1600, height: 1080 },
    header: { left: 0, top: 30, width: 1600, height: 64 },
    title: { left: 82, top: 269, width: 1172 },
    description: { left: 82, top: 645, width: 402, height: 234.56 },
    actions: { left: 1189, top: 649, width: 329, height: 174 },
    image: { left: 715, top: 557, width: 170, height: 298 },
  },
  '1600x1080': {
    stage: { left: 0, top: 0, width: 1600, height: 1296 },
    header: {},
    title: {},
    description: {},
    actions: {},
    image: {},
  },
  '1920x1080': {
    stage: { left: 0, top: 0, width: 1920, height: 1296 },
    header: { left: 0, top: 30, width: 1920, height: 64 },
    title: { left: 242, top: 269, width: 1172 },
    description: { left: 242, top: 735, width: 402, height: 234.56 },
    actions: { left: 1349, top: 739, width: 329, height: 174 },
    image: { left: 875, top: 647, width: 170, height: 298 },
  },
  '2560x1440': {
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
  await page.locator('.hero-image video').evaluate(async (video) => {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return
    await new Promise<void>((resolve) => {
      video.addEventListener('loadedmetadata', () => resolve(), { once: true })
    })
  })
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      }),
  )
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

async function readAnimatedHeroBoxes(page: Page) {
  return page.evaluate(() => {
    const selectors = [
      '.hero-description',
      '.hero-image',
      '.hero-action-panel',
    ] as const

    return Object.fromEntries(
      selectors.map((selector) => {
        const { left, top, width, height } = document
          .querySelector<HTMLElement>(selector)!
          .getBoundingClientRect()
        return [selector, { left, top, width, height }]
      }),
    ) as Record<(typeof selectors)[number], Geometry>
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

      const baseline = desktopBaselines[`${viewport.width}x${viewport.height}`]
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

const scrollViewports = [
  { width: 360, height: 800 },
  { width: 720, height: 900 },
  { width: 1024, height: 768 },
  { width: 1600, height: 900 },
  { width: 2560, height: 1440 },
] as const

for (const language of ['en', 'ru'] as const) {
  for (const viewport of scrollViewports) {
    test(`${language} Hero scroll geometry at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto(`/${language}`)
      await waitForHero(page)

      const sectionHeight = await page.locator('.hero-section').evaluate(
        (section) => section.getBoundingClientRect().height,
      )
      const finalScroll = Math.max(0, sectionHeight - viewport.height - 2)
      let initialImageBox: Geometry | undefined

      for (const progress of [0, 0.5, 1, 0.5, 0]) {
        await page.evaluate(
          ({ y }) => window.scrollTo({ top: y, behavior: 'instant' }),
          { y: finalScroll * progress },
        )
        await page.waitForTimeout(100)

        const state = await page.evaluate(() => {
          const image = document.querySelector<HTMLElement>('.hero-image')!
          const stage = document.querySelector<HTMLElement>('.hero-stage')!
          const content = document.querySelector<HTMLElement>('.hero-content')!
          const rect = image.getBoundingClientRect()
          const stageRect = stage.getBoundingClientRect()
          const contentRect = content.getBoundingClientRect()
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            stage: {
              left: stageRect.left,
              top: stageRect.top,
              width: stageRect.width,
              height: stageRect.height,
            },
            contentWidth: contentRect.width,
            horizontalOverflow:
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
          }
        })

        expect(state.horizontalOverflow).toBe(false)
        expect(state.left).toBeGreaterThanOrEqual(-0.5)
        expect(state.right).toBeLessThanOrEqual(state.viewportWidth + 0.5)
        expect(state.width).toBeGreaterThan(0)
        expect(state.height).toBeGreaterThan(0)

        if (progress === 1) {
          const availableStageHeight = Math.min(
            state.stage.height,
            state.viewportHeight,
          )
          const expectedWidth = Math.min(
            530,
            state.contentWidth,
            availableStageHeight * 0.92 * (530 / 928),
          )
          expect(Math.abs(state.width - expectedWidth)).toBeLessThanOrEqual(1)
          expect(
            Math.abs(
              state.left + state.width / 2 -
                (state.stage.left + state.stage.width / 2),
            ),
          ).toBeLessThanOrEqual(1)
        }

        if (!initialImageBox) {
          initialImageBox = state
        } else if (progress === 0) {
          expect(Math.abs(state.left - initialImageBox.left)).toBeLessThanOrEqual(1)
          expect(Math.abs(state.top - initialImageBox.top)).toBeLessThanOrEqual(1)
          expect(Math.abs(state.width - initialImageBox.width)).toBeLessThanOrEqual(1)
          expect(Math.abs(state.height - initialImageBox.height)).toBeLessThanOrEqual(1)
        }
      }
    })
  }
}

test('Hero scroll geometry refreshes after language changes', async ({ page }) => {
  const viewport = { width: 720, height: 900 }
  const baselinePage = await page.context().newPage()
  await baselinePage.setViewportSize(viewport)
  await baselinePage.goto('/ru')
  await waitForHero(baselinePage)
  const expected = await readAnimatedHeroBoxes(baselinePage)
  await baselinePage.close()

  await page.setViewportSize(viewport)
  await page.goto('/en')
  await waitForHero(page)
  const sectionHeight = await page.locator('.hero-section').evaluate(
    (section) => section.getBoundingClientRect().height,
  )
  await page.evaluate(
    ({ y }) => window.scrollTo({ top: y, behavior: 'instant' }),
    { y: (sectionHeight - viewport.height - 2) * 0.5 },
  )
  await page.waitForTimeout(100)

  await page.locator('.hero-language a[href="/ru"]').click()
  await page.waitForURL('**/ru')
  await waitForHero(page)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(100)

  const actual = await readAnimatedHeroBoxes(page)
  for (const selector of Object.keys(expected) as (keyof typeof expected)[]) {
    for (const dimension of ['left', 'top', 'width', 'height'] as const) {
      expect(
        Math.abs(actual[selector][dimension] - expected[selector][dimension]),
        `${selector} ${dimension}`,
      ).toBeLessThanOrEqual(1)
    }
  }
})

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
