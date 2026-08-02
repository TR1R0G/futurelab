import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { width: 279, height: 844 },
  { width: 297, height: 905 },
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

const boundaryWidths = [
  359, 360, 719, 720, 767, 768, 959, 960, 1023, 1024,
  1199, 1200, 1279, 1280, 1399, 1400, 1599, 1600,
] as const

const zoomEquivalentViewport = { width: 1280, height: 720 } as const

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
    title: { left: 82, top: 245, width: 1172 },
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
    title: { left: 242, top: 245, width: 1172 },
    description: { left: 242, top: 735, width: 402, height: 234.56 },
    actions: { left: 1349, top: 739, width: 329, height: 174 },
    image: { left: 875, top: 647, width: 170, height: 298 },
  },
  '2560x1440': {
    stage: { left: 0, top: 0, width: 2560, height: 1728 },
    header: { left: 0, top: 30, width: 2560, height: 64 },
    title: { left: 562, top: 245, width: 1172 },
    description: { left: 562, top: 735, width: 402, height: 234.56 },
    actions: { left: 1669, top: 739, width: 329, height: 174 },
    image: { left: 1195, top: 647, width: 170, height: 298 },
  },
}

const englishDesktopBaselineOverrides: Record<
  string,
  Record<'description' | 'actions', Partial<Geometry>>
> = {
  '1600x900': {
    description: { top: 588.53 },
    actions: { top: 618.81 },
  },
  '1920x1080': {
    description: { top: 678.55 },
    actions: { top: 708.83 },
  },
  '2560x1440': {
    description: { top: 678.55 },
    actions: { top: 708.83 },
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

async function readAnimatedHeroBoxesOnNextFrame(page: Page) {
  return page.evaluate(
    () =>
      new Promise<Record<string, Geometry>>((resolve) => {
        window.dispatchEvent(new Event('orientationchange'))
        requestAnimationFrame(() => {
          resolve(
            Object.fromEntries(
              [
                '.hero-description',
                '.hero-image',
                '.hero-action-panel',
              ].map((selector) => {
                const { left, top, width, height } = document
                  .querySelector<HTMLElement>(selector)!
                  .getBoundingClientRect()
                return [selector, { left, top, width, height }]
              }),
            ),
          )
        })
      }),
  )
}

async function readHeroTriggerCount(page: Page) {
  return page.locator('.hero-section').evaluate((section) =>
    Number((section as HTMLElement).dataset.heroScrollTriggerCount),
  )
}

async function expectInitialHeroGeometry(
  page: Page,
  language: 'en' | 'ru',
  viewport: { width: number; height: number },
) {
  const result = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('.hero-section')!
    const stage = document.querySelector<HTMLElement>('.hero-stage')!
    const header = document.querySelector<HTMLElement>('.hero-header')!
    const title = document.querySelector<HTMLElement>('.hero-title')!
    const description = document.querySelector<HTMLElement>('.hero-description')!
    const actions = document.querySelector<HTMLElement>('.hero-action-panel')!
    const image = document.querySelector<HTMLElement>('.hero-image')!
    const visibleCtas = [
      ...document.querySelectorAll<HTMLElement>(
        '.hero-button, .hero-header-button',
      ),
    ].filter((button) => {
      const style = getComputedStyle(button)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
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
    const titleWordRects = [
      ...title.querySelectorAll<HTMLElement>(
        '.hero-title-lines-compact .hero-word',
      ),
    ]
      .filter((word) => word.getBoundingClientRect().width > 0)
      .map((word) => toGeometry(word.getBoundingClientRect()))

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
      titleWordRects,
      ctaHeights: visibleCtas.map((button) =>
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
  for (const wordRect of result.titleWordRects) {
    expect(wordRect.left).toBeGreaterThanOrEqual(result.stageRect.left - 0.5)
    expect(wordRect.right).toBeLessThanOrEqual(result.stageRect.right + 0.5)
  }
  expect(result.imageAspect).toBeCloseTo(530 / 928, 2)
  for (const height of result.ctaHeights) {
    expect(height).toBeGreaterThanOrEqual(44)
  }

  const viewportKey = `${viewport.width}x${viewport.height}`
  const sharedBaseline = desktopBaselines[viewportKey]
  const englishOverrides = englishDesktopBaselineOverrides[viewportKey]
  const baseline =
    language === 'en' && sharedBaseline && englishOverrides
      ? {
          ...sharedBaseline,
          description: {
            ...sharedBaseline.description,
            ...englishOverrides.description,
          },
          actions: {
            ...sharedBaseline.actions,
            ...englishOverrides.actions,
          },
        }
      : sharedBaseline
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
}

for (const language of ['en', 'ru'] as const) {
  for (const viewport of viewports) {
    test(`${language} Hero fits at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto(`/${language}`)
      await waitForHero(page)
      await expectInitialHeroGeometry(page, language, viewport)
    })
  }
}

for (const language of ['en', 'ru'] as const) {
  for (const width of boundaryWidths) {
    test(`${language} Hero boundary initial geometry at ${width}x900`, async ({ page }) => {
      const viewport = { width, height: 900 }
      await page.setViewportSize(viewport)
      await page.goto(`/${language}`)
      await waitForHero(page)
      await expectInitialHeroGeometry(page, language, viewport)
    })
  }
}

for (const language of ['en', 'ru'] as const) {
  test(`${language} Hero contains initial geometry at the 125% desktop zoom equivalent`, async ({ page }) => {
    await page.setViewportSize(zoomEquivalentViewport)
    await page.goto(`/${language}`)
    await waitForHero(page)
    await expectInitialHeroGeometry(page, language, zoomEquivalentViewport)
  })
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
      const denseEarlyProgress = [
        0.01, 0.02, 0.03, 0.04, 0.05, 0.075, 0.1, 0.125, 0.15, 0.2, 0.25,
      ]
      const progressPoints =
        viewport.width === 1024 && viewport.height === 768
          ? [
              0,
              ...denseEarlyProgress,
              0.5,
              1,
              0.5,
              ...denseEarlyProgress.toReversed(),
              0,
            ]
          : [0, 0.5, 1, 0.5, 0]
      let initialImageBox: Geometry | undefined
      let initialActionBox: Geometry | undefined

      for (const progress of progressPoints) {
        await page.evaluate(
          ({ y }) => window.scrollTo({ top: y, behavior: 'instant' }),
          { y: finalScroll * progress },
        )
        await page.waitForTimeout(100)

        const state = await page.evaluate(() => {
          const image = document.querySelector<HTMLElement>('.hero-image')!
          const stage = document.querySelector<HTMLElement>('.hero-stage')!
          const content = document.querySelector<HTMLElement>('.hero-content')!
          const description = document.querySelector<HTMLElement>(
            '.hero-description',
          )!
          const actions = document.querySelector<HTMLElement>(
            '.hero-action-panel',
          )!
          const buttons = [...actions.querySelectorAll<HTMLElement>('.hero-button')]
          const rect = image.getBoundingClientRect()
          const stageRect = stage.getBoundingClientRect()
          const contentRect = content.getBoundingClientRect()
          const descriptionRect = description.getBoundingClientRect()
          const actionsRect = actions.getBoundingClientRect()
          const overlaps = (a: DOMRect, b: DOMRect) =>
            !(
              a.right <= b.left ||
              b.right <= a.left ||
              a.bottom <= b.top ||
              b.bottom <= a.top
            )
          const toGeometry = ({
            left,
            top,
            right,
            bottom,
            width,
            height,
          }: DOMRect) => ({ left, top, right, bottom, width, height })
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
            stagePosition: getComputedStyle(stage).position,
            description: {
              ...toGeometry(descriptionRect),
              opacity: Number(getComputedStyle(description).opacity),
            },
            actions: {
              ...toGeometry(actionsRect),
              opacity: Number(getComputedStyle(actions).opacity),
            },
            buttons: buttons.map((button) =>
              toGeometry(button.getBoundingClientRect()),
            ),
            overlaps: {
              descriptionImage: overlaps(descriptionRect, rect),
              imageActions: overlaps(rect, actionsRect),
              descriptionActions: overlaps(descriptionRect, actionsRect),
            },
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

        for (const [name, box] of Object.entries({
          description: state.description,
          image: state,
          actions: state.actions,
        })) {
          expect(box.left, `${name} left at ${progress}`).toBeGreaterThanOrEqual(
            state.stage.left - 0.5,
          )
          expect(box.right, `${name} right at ${progress}`).toBeLessThanOrEqual(
            state.stage.left + state.stage.width + 0.5,
          )
        }

        const supportingTextVisible =
          state.description.opacity > 0.01 || state.actions.opacity > 0.01
        if (state.overlaps.imageActions) {
          expect(
            state.actions.opacity,
            `overlapping actions must be fully hidden at ${progress}`,
          ).toBe(0)
        }
        if (supportingTextVisible) {
          expect(
            state.overlaps.descriptionImage,
            `description/image overlap at ${progress}`,
          ).toBe(false)
          expect(
            state.overlaps.imageActions,
            `image/actions overlap at ${progress}: ${JSON.stringify({
              image: {
                left: state.left,
                top: state.top,
                right: state.right,
                bottom: state.bottom,
              },
              actions: state.actions,
              initialActions: initialActionBox,
            })}`,
          ).toBe(false)
          expect(
            state.overlaps.descriptionActions,
            `description/actions overlap at ${progress}`,
          ).toBe(false)
        }

        if (
          viewport.width === 1024 &&
          viewport.height === 768 &&
          progress <= 0.25 &&
          state.actions.opacity > 0
        ) {
          expect(
            state.overlaps.imageActions,
            `visible image/actions overlap at ${progress}`,
          ).toBe(false)
          expect(state.actions.top).toBeGreaterThanOrEqual(state.stage.top - 0.5)
          expect(state.actions.bottom).toBeLessThanOrEqual(
            state.stage.top + state.stage.height + 0.5,
          )
        }

        const supportingColumnsRemainVisible =
          viewport.width >= 720 &&
          !(
            viewport.width <= 1199 &&
            viewport.height <= 600
          )
        if (supportingColumnsRemainVisible) {
          expect(state.description.width).toBeGreaterThanOrEqual(159.5)
          expect(state.actions.width).toBeGreaterThanOrEqual(159.5)

          if (state.stagePosition === 'sticky') {
            for (const [name, box] of Object.entries({
              description: state.description,
              image: state,
              actions: state.actions,
            })) {
              expect(box.top, `${name} top at ${progress}`).toBeGreaterThanOrEqual(
                state.stage.top - 0.5,
              )
              expect(
                box.bottom,
                `${name} bottom at ${progress}`,
              ).toBeLessThanOrEqual(state.stage.top + state.stage.height + 0.5)
            }
          }

          for (const button of state.buttons) {
            expect(button.left).toBeGreaterThanOrEqual(state.stage.left - 0.5)
            expect(button.right).toBeLessThanOrEqual(
              state.stage.left + state.stage.width + 0.5,
            )
          }
        }

        if (progress === 1) {
          const availableStageHeight = Math.min(
            state.stage.height,
            state.viewportHeight,
          )
          const columnGap = Math.max(
            24,
            Math.min(64, state.contentWidth * 0.04),
          )
          const availableContentWidth = supportingColumnsRemainVisible
            ? state.contentWidth - 2 * 160 - 2 * columnGap
            : state.contentWidth
          const expectedWidth = Math.min(
            530,
            availableContentWidth,
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
          initialActionBox = state.actions
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

test('Hero preserves scroll geometry during a synchronous refresh', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 })
  await page.goto('/ru')
  await waitForHero(page)

  const sectionHeight = await page.locator('.hero-section').evaluate(
    (section) => section.getBoundingClientRect().height,
  )
  await page.evaluate(
    ({ y }) => window.scrollTo({ top: y, behavior: 'instant' }),
    { y: (sectionHeight - 900 - 2) * 0.5 },
  )
  await page.waitForTimeout(100)

  const beforeRefresh = await readAnimatedHeroBoxes(page)
  const firstRefreshFrame = await readAnimatedHeroBoxesOnNextFrame(page)

  for (const selector of Object.keys(
    beforeRefresh,
  ) as (keyof typeof beforeRefresh)[]) {
    for (const dimension of ['left', 'top', 'width', 'height'] as const) {
      expect(
        Math.abs(
          beforeRefresh[selector][dimension] -
            firstRefreshFrame[selector][dimension],
        ),
        `${selector} ${dimension}`,
      ).toBeLessThanOrEqual(1)
    }
  }
})

test('Hero keeps one ScrollTrigger through resize and language changes', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 })
  await page.goto('/en')
  await waitForHero(page)
  expect(await readHeroTriggerCount(page)).toBe(1)

  const tabletSectionHeight = await page.locator('.hero-section').evaluate(
    (section) => section.getBoundingClientRect().height,
  )
  await page.evaluate(
    ({ y }) => window.scrollTo({ top: y, behavior: 'instant' }),
    { y: tabletSectionHeight - 900 - 2 },
  )
  await page.waitForTimeout(100)
  const tabletImage = await readAnimatedHeroBoxes(page)

  await page.setViewportSize({ width: 1024, height: 900 })
  await page.waitForTimeout(150)
  expect(await readHeroTriggerCount(page)).toBe(1)

  const laptopSectionHeight = await page.locator('.hero-section').evaluate(
    (section) => section.getBoundingClientRect().height,
  )
  await page.evaluate(
    ({ y }) => window.scrollTo({ top: y, behavior: 'instant' }),
    { y: laptopSectionHeight - 900 - 2 },
  )
  await page.waitForTimeout(100)
  const laptopImage = await readAnimatedHeroBoxes(page)
  expect(laptopImage['.hero-image'].width).toBeGreaterThan(
    tabletImage['.hero-image'].width + 100,
  )

  await page.locator('.hero-language a[href="/ru"]').click()
  await page.waitForURL('**/ru')
  await waitForHero(page)
  expect(await readHeroTriggerCount(page)).toBe(1)
})

test('Hero refreshes immediately when video metadata is already available', async ({ page }) => {
  await page.addInitScript(() => {
    const metadataListenerKey = '__heroMetadataListenerCount'
    const testWindow = window as Window & Record<string, number>
    const nativeAddEventListener = EventTarget.prototype.addEventListener

    Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_METADATA,
    })
    EventTarget.prototype.addEventListener = function (...args) {
      const [type] = args
      if (
        type === 'loadedmetadata' &&
        this instanceof HTMLVideoElement &&
        this.closest('.hero-image')
      ) {
        testWindow[metadataListenerKey] =
          (testWindow[metadataListenerKey] ?? 0) + 1
      }
      return nativeAddEventListener.apply(this, args)
    }
  })

  await page.setViewportSize({ width: 720, height: 900 })
  await page.goto('/en')
  await page.locator('.hero-section').waitFor({ state: 'visible' })
  await page.waitForTimeout(100)

  const metadataListenerCount = await page.evaluate(
    () =>
      (window as Window & Record<string, number>)[
        '__heroMetadataListenerCount'
      ] ?? 0,
  )
  expect(metadataListenerCount).toBe(1)
})

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

test('ru Hero keeps short-flow actions readable until they pass through normal flow', async ({ page }) => {
  const viewport = { width: 667, height: 375 }
  await page.setViewportSize(viewport)
  await page.goto('/ru')
  await waitForHero(page)

  const result = await page.evaluate(async ({ viewportHeight }) => {
    const actions = document.querySelector<HTMLElement>('.hero-action-panel')!
    const buttons = [...actions.querySelectorAll<HTMLElement>('.hero-button')]
    const actionRect = actions.getBoundingClientRect()
    const transitionThreshold = actionRect.bottom + window.scrollY
    const buttonCenters = buttons.map((button) => {
      const rect = button.getBoundingClientRect()
      return rect.top + window.scrollY + rect.height / 2
    })
    const samplePoints = new Set<number>([0, transitionThreshold - 1])

    for (let y = 0; y < transitionThreshold; y += 32) {
      samplePoints.add(y)
    }
    for (const center of buttonCenters) {
      samplePoints.add(Math.max(0, center - viewportHeight / 2))
    }

    const observations = []
    for (const y of [...samplePoints].sort((a, b) => a - b)) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      )
      observations.push({
        y: window.scrollY,
        opacity: Number(getComputedStyle(actions).opacity),
        buttonVisibility: buttons.map((button) => {
          const buttonRect = button.getBoundingClientRect()
          return buttonRect.bottom > 0 && buttonRect.top < viewportHeight
        }),
      })
    }

    const section = document.querySelector<HTMLElement>('.hero-section')!
    const remainingDistance =
      section.getBoundingClientRect().height -
      viewportHeight -
      transitionThreshold
    window.scrollTo({
      top: transitionThreshold + Math.max(1, remainingDistance * 0.2),
      behavior: 'instant',
    })
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )

    return {
      observations,
      transitionThreshold,
      opacityAfterThreshold: Number(getComputedStyle(actions).opacity),
    }
  }, { viewportHeight: viewport.height })

  for (const observation of result.observations) {
    expect(
      observation.opacity,
      `actions opacity at scrollY=${observation.y}`,
    ).toBeGreaterThanOrEqual(0.99)
  }
  for (let index = 0; index < 3; index += 1) {
    expect(
      result.observations.some(
        (observation) =>
          observation.buttonVisibility[index] && observation.opacity >= 0.99,
      ),
      `button ${index + 1} reachable before ${result.transitionThreshold}`,
    ).toBe(true)
  }
  expect(result.opacityAfterThreshold).toBeLessThan(0.1)
})

test.describe('Hero narrow mobile composition', () => {
  test('en short mobile keeps description, actions, and video in reading order', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 667, height: 375 })
    await page.goto('/en')
    await waitForHero(page)

    const rects = await page.evaluate(() => {
      const read = (selector: string) => {
        const { top, bottom } = document
          .querySelector<HTMLElement>(selector)!
          .getBoundingClientRect()
        return { top, bottom }
      }

      return {
        description: read('.hero-description'),
        actions: read('.hero-action-panel'),
        image: read('.hero-image'),
      }
    })

    expect(rects.description.bottom).toBeLessThanOrEqual(rects.actions.top)
    expect(rects.actions.bottom).toBeLessThanOrEqual(rects.image.top)
  })

  test('en Hero uses the available title width at 719px', async ({ page }) => {
    await page.setViewportSize({ width: 719, height: 905 })
    await page.goto('/en')
    await waitForHero(page)
    await page.waitForTimeout(3_500)

    const titleRows = await page.locator('.hero-title').evaluate((title) => {
      const visibleWords = [
        ...title.querySelectorAll<HTMLElement>('.hero-word'),
      ].filter((word) => word.getBoundingClientRect().width > 0)

      return new Set(
        visibleWords.map((word) =>
          Math.round(word.getBoundingClientRect().top),
        ),
      ).size
    })

    expect(titleRows).toBeLessThanOrEqual(3)
  })

  for (const width of [297, 389, 719]) {
    test(`en Hero CTA entrance remains in normal flow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 905 })
      await page.goto('/en')
      await page.locator('.hero-section').waitFor({ state: 'visible' })
      await page.waitForFunction(() => {
        const opacity = Number(
          getComputedStyle(
            document.querySelector<HTMLElement>('.hero-actions')!,
          ).opacity,
        )
        return opacity > 0.01 && opacity < 0.99
      })

      const overlaps = await page.evaluate(() => {
        const description = document
          .querySelector<HTMLElement>('.hero-description')!
          .getBoundingClientRect()
        const actions = document
          .querySelector<HTMLElement>('.hero-actions')!
          .getBoundingClientRect()
        const image = document
          .querySelector<HTMLElement>('.hero-image')!
          .getBoundingClientRect()
        const intersects = (a: DOMRect, b: DOMRect) =>
          !(
            a.right <= b.left ||
            b.right <= a.left ||
            a.bottom <= b.top ||
            b.bottom <= a.top
          )

        return {
          descriptionOverlap: intersects(description, actions),
          imageOverlap: intersects(actions, image),
        }
      })

      expect(overlaps).toEqual({
        descriptionOverlap: false,
        imageOverlap: false,
      })
    })
  }
})

test.describe('Hero desktop composition', () => {
  for (const width of [1600, 1920, 2560]) {
    for (const language of ['en', 'ru'] as const) {
      test(`${language} wide short Hero title clears support content at ${width}x768`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 768 })
        await page.goto(`/${language}`)
        await waitForHero(page)
        await page.waitForTimeout(1_500)

        const gaps = await page.evaluate(() => {
          const title = document
            .querySelector<HTMLElement>('.hero-title')!
            .getBoundingClientRect()
          const description = document
            .querySelector<HTMLElement>('.hero-description')!
            .getBoundingClientRect()
          const image = document
            .querySelector<HTMLElement>('.hero-image')!
            .getBoundingClientRect()

          return {
            titleToDescription: description.top - title.bottom,
            titleToImage: image.top - title.bottom,
          }
        })

        expect(gaps.titleToDescription).toBeGreaterThanOrEqual(20)
        expect(gaps.titleToImage).toBeGreaterThanOrEqual(20)
      })
    }
  }

  for (const width of [1200, 1280, 1366, 1400, 1499, 1500, 1537]) {
    for (const language of ['en', 'ru'] as const) {
      test(`${language} Hero CTA labels remain centered on one line at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(`/${language}`)
        await waitForHero(page)
        await page.waitForTimeout(1_500)

        const buttons = await page.locator('.hero-button').evaluateAll((items) =>
          items.map((button) => {
            const element = button as HTMLElement
            const buttonRect = element.getBoundingClientRect()
            const styles = getComputedStyle(element)
            const textRange = document.createRange()
            textRange.selectNodeContents(element)
            const textRect = textRange.getBoundingClientRect()

            return {
              label: element.textContent?.trim(),
              lineHeight: Number.parseFloat(styles.lineHeight),
              textHeight: textRect.height,
              leftInset: textRect.left - buttonRect.left,
              rightInset: buttonRect.right - textRect.right,
              centerDelta:
                (textRect.left + textRect.right) / 2 -
                (buttonRect.left + buttonRect.right) / 2,
            }
          }),
        )

        for (const button of buttons) {
          expect(
            button.textHeight,
            `${button.label} should remain on one line`,
          ).toBeLessThanOrEqual(button.lineHeight * 1.1)
          expect(button.leftInset, `${button.label} left padding`).toBeGreaterThanOrEqual(16)
          expect(button.rightInset, `${button.label} right padding`).toBeGreaterThanOrEqual(16)
          expect(Math.abs(button.centerDelta), `${button.label} centering`).toBeLessThanOrEqual(1)
        }
      })
    }

    test(`en Hero title uses three contained rows at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/en')
      await waitForHero(page)
      await page.waitForTimeout(1_500)

      const result = await page.locator('.hero-title').evaluate((title) => {
        const stage = document
          .querySelector<HTMLElement>('.hero-stage')!
          .getBoundingClientRect()
        const words = [
          ...title.querySelectorAll<HTMLElement>('.hero-word'),
        ].filter((word) => word.getBoundingClientRect().width > 0)

        return {
          rows: new Set(
            words.map((word) => Math.round(word.getBoundingClientRect().top)),
          ).size,
          words: words.map((word) => {
            const rect = word.getBoundingClientRect()
            return {
              text: word.textContent,
              leftInset: rect.left - stage.left,
              rightInset: stage.right - rect.right,
            }
          }),
        }
      })

      expect(result.rows).toBe(3)
      for (const word of result.words) {
        expect(word.leftInset, `${word.text} left inset`).toBeGreaterThanOrEqual(0)
        expect(word.rightInset, `${word.text} right inset`).toBeGreaterThanOrEqual(0)
      }
    })
  }

  for (const width of [1200, 1400, 1600, 1920]) {
    test(`en Hero title remains contained at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/en')
      await waitForHero(page)
      await page.waitForTimeout(1_500)

      const result = await page.evaluate(() => {
        const stage = document
          .querySelector<HTMLElement>('.hero-stage')!
          .getBoundingClientRect()
        const title = document
          .querySelector<HTMLElement>('.hero-title')!
          .getBoundingClientRect()
        const description = document
          .querySelector<HTMLElement>('.hero-description')!
          .getBoundingClientRect()
        const visibleWords = [
          ...document.querySelectorAll<HTMLElement>('.hero-title .hero-word'),
        ].filter((word) => word.getBoundingClientRect().width > 0)

        return {
          titleToDescriptionGap: description.top - title.bottom,
          words: visibleWords.map((word) => {
            const rect = word.getBoundingClientRect()
            return {
              text: word.textContent,
              leftInset: rect.left - stage.left,
              rightInset: stage.right - rect.right,
            }
          }),
        }
      })

      expect(result.titleToDescriptionGap).toBeGreaterThanOrEqual(20)
      for (const word of result.words) {
        expect(word.leftInset, `${word.text} left inset`).toBeGreaterThanOrEqual(0)
        expect(word.rightInset, `${word.text} right inset`).toBeGreaterThanOrEqual(0)
      }
    })

    test(`en Hero support columns align to the video at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/en')
      await waitForHero(page)
      await page.waitForTimeout(1_500)

      const centers = await page.evaluate(() => {
        const centerY = (selector: string) => {
          const rect = document
            .querySelector<HTMLElement>(selector)!
            .getBoundingClientRect()
          return rect.top + rect.height / 2
        }

        return {
          description: centerY('.hero-description'),
          actions: centerY('.hero-action-panel'),
          image: centerY('.hero-image'),
        }
      })

      expect(Math.abs(centers.description - centers.image)).toBeLessThanOrEqual(1)
      expect(Math.abs(centers.actions - centers.image)).toBeLessThanOrEqual(1)
    })
  }

  test('en short desktop title clears the description at 1366x768', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto('/en')
    await waitForHero(page)
    await page.waitForTimeout(1_500)

    const gap = await page.evaluate(() => {
      const title = document
        .querySelector<HTMLElement>('.hero-title')!
        .getBoundingClientRect()
      const description = document
        .querySelector<HTMLElement>('.hero-description')!
        .getBoundingClientRect()
      return description.top - title.bottom
    })

    expect(gap).toBeGreaterThanOrEqual(20)
  })

  test('en compact desktop title completes its entrance without hidden variants', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 })
    await page.goto('/en')
    await waitForHero(page)
    await page.waitForTimeout(4_000)

    const visibleCharacterOpacities = await page
      .locator('.hero-title .hero-char')
      .evaluateAll((characters) =>
        characters
          .filter((character) => character.getBoundingClientRect().width > 0)
          .map((character) => Number(getComputedStyle(character).opacity)),
      )

    expect(visibleCharacterOpacities.length).toBeGreaterThan(0)
    expect(Math.min(...visibleCharacterOpacities)).toBeGreaterThanOrEqual(0.99)
  })
})

test.describe('Hero tablet and laptop vertical composition', () => {
  test('en Hero title sits lower below the desktop breakpoint', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1199, height: 900 })
    await page.goto('/en')
    await waitForHero(page)

    const titleTop = await page
      .locator('.hero-title')
      .evaluate((title) => title.getBoundingClientRect().top)

    expect(titleTop).toBeGreaterThanOrEqual(270)
  })

  for (const width of [1200, 1600]) {
    test(`en Hero title sits higher at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/en')
      await waitForHero(page)

      const titleTop = await page
        .locator('.hero-title')
        .evaluate((title) => title.getBoundingClientRect().top)

      expect(titleTop).toBeLessThanOrEqual(250)
    })
  }

  for (const viewport of [
    { width: 720, height: 900 },
    { width: 768, height: 1024 },
    { width: 960, height: 900 },
    { width: 1024, height: 768 },
    { width: 1199, height: 900 },
  ]) {
    test(`en Hero support row stays near the bottom at ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto('/en')
      await waitForHero(page)
      await page.waitForTimeout(1_500)

      const spacing = await page.evaluate(() => {
        const stage = document
          .querySelector<HTMLElement>('.hero-stage')!
          .getBoundingClientRect()
        const title = document
          .querySelector<HTMLElement>('.hero-title')!
          .getBoundingClientRect()
        const supportRects = [
          '.hero-description',
          '.hero-image',
          '.hero-action-panel',
        ].map((selector) =>
          document.querySelector<HTMLElement>(selector)!.getBoundingClientRect(),
        )
        const supportTop = Math.min(...supportRects.map((rect) => rect.top))
        const supportBottom = Math.max(
          ...supportRects.map((rect) => rect.bottom),
        )

        return {
          titleToSupport: supportTop - title.bottom,
          supportBottomInset: stage.bottom - supportBottom,
        }
      })

      expect(spacing.titleToSupport).toBeGreaterThanOrEqual(80)
      expect(spacing.supportBottomInset).toBeGreaterThanOrEqual(32)
      expect(spacing.supportBottomInset).toBeLessThanOrEqual(64)
    })
  }
})

const shortHeightCases = [
  { width: 768, height: 650, expectedPosition: 'relative', expectedOverflow: 'visible', tracks: 3 },
  { width: 1024, height: 650, expectedPosition: 'relative', expectedOverflow: 'visible', tracks: 3 },
  { width: 1024, height: 768, expectedPosition: 'relative', expectedOverflow: 'visible', tracks: 3 },
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

    expect(result.rects.description.right).toBeLessThanOrEqual(
      result.rects.image.left,
    )
    expect(result.rects.image.right).toBeLessThanOrEqual(
      result.rects.actions.left,
    )
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
