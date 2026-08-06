import { expect, test } from '@playwright/test'

for (const viewport of [
	{ width: 390, height: 844 },
	{ width: 1440, height: 900 },
] as const) {
	test(`Hero retains post-video gradient clearance at ${viewport.width}px`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport)
		await page.goto('/ru', { waitUntil: 'domcontentloaded' })
		await page.locator('.hero-section').waitFor({ state: 'attached' })
		await page.evaluate(() => document.fonts.ready)

		const layout = await page.evaluate(() => {
			const section = document.querySelector<HTMLElement>('.hero-section')
			if (!section) throw new Error('Hero section is missing')

			const height = window.innerHeight
			const baseDistance = Math.min(1800, Math.max(1100, height * 1.5))
			const clearance = Math.min(220, Math.max(140, height * 0.16))

			return {
				scrollDistance: section.getBoundingClientRect().height - height,
				expectedMinimum: baseDistance + clearance,
				postVideoClearance: getComputedStyle(section).getPropertyValue(
					'--hero-post-video-clearance',
				),
			}
		})

		expect(layout.postVideoClearance).not.toBe('')
		expect(layout.scrollDistance).toBeGreaterThanOrEqual(
			layout.expectedMinimum - 1,
		)
	})
}
