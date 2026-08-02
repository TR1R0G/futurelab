import { expect, test } from '@playwright/test'

const mobileWidths = [360, 390, 719] as const

for (const width of mobileWidths) {
	test(`Solution videos expand and release inside their own cards at ${width}px`, async ({
		page,
	}) => {
		const viewportHeight = 844
		await page.setViewportSize({ width, height: viewportHeight })
		await page.goto('/en')
		await page.locator('.solutions-section').waitFor({ state: 'attached' })
		await page.evaluate(() => document.fonts.ready)
		await page.evaluate(() => {
			window.dispatchEvent(
				new CustomEvent('futurelab:smooth-scroll-to', {
					detail: { target: document.documentElement },
				}),
			)
		})
		await page.waitForFunction(() => window.scrollY < 4)
		await page.waitForTimeout(220)

		const slotCount = await page.locator('.solution-media-slot').count()
		expect(slotCount).toBe(3)
		const initialActions = await page.evaluate(() =>
			Array.from(document.querySelectorAll<HTMLElement>('.solution-mobile-cta')).map(
				action => ({
					opacity: getComputedStyle(action).opacity,
					pointerEvents: getComputedStyle(action).pointerEvents,
				}),
		)
		)
		expect(initialActions).toHaveLength(3)
		for (const action of initialActions) {
			expect(Number(action.opacity)).toBeLessThanOrEqual(0.02)
			expect(action.pointerEvents).toBe('none')
		}

		for (let index = 0; index < slotCount; index += 1) {
			const slotTop = await page.evaluate(activeIndex => {
				const slot = document.querySelectorAll<HTMLElement>(
					'.solution-media-slot',
				)[activeIndex]
				if (!slot) throw new Error(`Missing solution slot ${activeIndex}`)
				return slot.getBoundingClientRect().top + window.scrollY
			}, index)
			await page.evaluate(
				y => window.scrollTo({ top: y, behavior: 'instant' }),
				slotTop,
			)
			await page.waitForTimeout(220)

			const expanded = await page.evaluate(activeIndex => {
				const media = document.querySelectorAll<HTMLElement>(
					'.solutions-transition-media',
				)[activeIndex]
				const slot = media?.closest<HTMLElement>('.solution-media-slot')
				const action = slot?.querySelector<HTMLElement>('.solution-mobile-cta')
				if (!media || !slot || !action) {
					throw new Error(`Missing solution ${activeIndex}`)
				}

				const mediaRect = media.getBoundingClientRect()
				const slotRect = slot.getBoundingClientRect()
				const actionRect = action.getBoundingClientRect()
				return {
					position: getComputedStyle(media).position,
					mediaWidth: mediaRect.width,
					slotWidth: slotRect.width,
					actionTop: actionRect.top,
					mediaBottom: mediaRect.bottom,
					actionOpacity: getComputedStyle(action).opacity,
					actionPointerEvents: getComputedStyle(action).pointerEvents,
				}
			}, index)

			expect(expanded.position, `solution ${index} expanded position`).toBe(
				'fixed',
			)
			expect(expanded.mediaWidth, `solution ${index} expanded width`).toBeGreaterThan(
				expanded.slotWidth + 20,
			)
			expect(
				Number(expanded.actionOpacity),
				`solution ${index} CTA appears during expansion`,
			).toBeGreaterThanOrEqual(0.95)
			expect(
				expanded.actionPointerEvents,
				`solution ${index} CTA is interactive during expansion`,
			).not.toBe('none')
			expect(
				expanded.actionTop,
				`solution ${index} CTA stays below the expanding video`,
			).toBeGreaterThanOrEqual(expanded.mediaBottom + 18)

			await page.evaluate(
				y => window.scrollTo({ top: y, behavior: 'instant' }),
				slotTop + viewportHeight * 1.1,
			)
			await page.waitForTimeout(220)

			const released = await page.evaluate(activeIndex => {
				const media = document.querySelectorAll<HTMLElement>(
					'.solutions-transition-media',
				)[activeIndex]
				const slot = media?.closest<HTMLElement>('.solution-media-slot')
				const action = slot?.querySelector<HTMLElement>('.solution-mobile-cta')
				const item = media?.closest<HTMLElement>('.solution-item')
				const nextItem = document.querySelectorAll<HTMLElement>('.solution-item')[
					activeIndex + 1
				]
				if (!media || !slot || !action || !item) {
					throw new Error(`Missing solution ${activeIndex}`)
				}

				const mediaRect = media.getBoundingClientRect()
				const actionRect = action.getBoundingClientRect()
				const itemRect = item.getBoundingClientRect()
				const nextRect = nextItem?.getBoundingClientRect()
				const overlapsNext = nextRect
					? !(
							mediaRect.right <= nextRect.left ||
							nextRect.right <= mediaRect.left ||
							mediaRect.bottom <= nextRect.top ||
							nextRect.bottom <= mediaRect.top
						)
					: false
				const actionOverlapsNext = nextRect
					? !(
							actionRect.right <= nextRect.left ||
							nextRect.right <= actionRect.left ||
							actionRect.bottom <= nextRect.top ||
							nextRect.bottom <= actionRect.top
						)
					: false

				return {
					position: getComputedStyle(media).position,
					mediaInsideItem: mediaRect.bottom <= itemRect.bottom + 1,
					actionInsideItem: actionRect.bottom <= itemRect.bottom + 1,
					actionBelowMedia: actionRect.top >= mediaRect.bottom - 1,
					actionOpacity: getComputedStyle(action).opacity,
					actionPointerEvents: getComputedStyle(action).pointerEvents,
					mediaBottom: mediaRect.bottom,
					mediaTop: mediaRect.top,
					actionBottom: actionRect.bottom,
					itemBottom: itemRect.bottom,
					nextTop: nextRect?.top ?? null,
					overlapsNext,
					actionOverlapsNext,
					hasHorizontalOverflow:
						document.documentElement.scrollWidth >
						document.documentElement.clientWidth,
				}
			}, index)

			expect(released.position, `solution ${index} released position`).toBe(
				'absolute',
			)
			expect(
				released.mediaInsideItem,
				`solution ${index} media containment ${JSON.stringify(released)}`,
			).toBe(
				true,
			)
			expect(released.actionInsideItem, `solution ${index} CTA containment`).toBe(
				true,
			)
			expect(released.actionBelowMedia, `solution ${index} CTA order`).toBe(true)
			expect(
				Number(released.actionOpacity),
				`solution ${index} CTA visibility`,
			).toBeGreaterThanOrEqual(0.95)
			expect(
				released.actionPointerEvents,
				`solution ${index} CTA interaction`,
			).not.toBe('none')
			expect(released.overlapsNext, `solution ${index} next-card overlap`).toBe(
				false,
			)
			expect(
				released.actionOverlapsNext,
				`solution ${index} CTA next-card overlap`,
			).toBe(false)
			expect(released.hasHorizontalOverflow).toBe(false)

			await page.evaluate(() =>
				window.scrollTo({ top: window.scrollY + 120, behavior: 'instant' }),
			)
			await page.waitForTimeout(120)
			const scrolledAway = await page.evaluate(activeIndex => {
				const media = document.querySelectorAll<HTMLElement>(
					'.solutions-transition-media',
				)[activeIndex]
				if (!media) throw new Error(`Missing solution ${activeIndex}`)
				return {
					top: media.getBoundingClientRect().top,
					visibility: getComputedStyle(media).visibility,
				}
			}, index)

			expect(scrolledAway.visibility, `solution ${index} remains visible`).toBe(
				'visible',
			)
			expect(
				released.mediaTop - scrolledAway.top,
				`solution ${index} scroll-away distance`,
			).toBeGreaterThan(80)
		}
	})
}
