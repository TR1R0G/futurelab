import { expect, test } from '@playwright/test'

const desktopViewports = [
	{ width: 1200, height: 900 },
	{ width: 1415, height: 905 },
	{ width: 1600, height: 900 },
	{ width: 1980, height: 1138 },
]

test.describe('Russian hero title clearance', () => {
	for (const viewport of desktopViewports) {
		test(`keeps supporting content clear at ${viewport.width}px`, async ({ page }) => {
			await page.setViewportSize(viewport)
			await page.goto('/ru')
			await page.evaluate(() => document.fonts.ready)

			const layout = await page.evaluate(() => {
				const rect = (selector: string) => {
					const element = document.querySelector<HTMLElement>(selector)
					if (!element) throw new Error(`Missing ${selector}`)
					const box = element.getBoundingClientRect()
					return {
						left: box.left,
						top: box.top,
						right: box.right,
						bottom: box.bottom,
						width: box.width,
					}
				}

				return {
					viewportHeight: window.innerHeight,
					title: rect('.hero-title'),
					description: rect('.hero-description'),
					actions: rect('.hero-action-panel'),
					image: rect('.hero-image'),
				}
			})

			expect(layout.title.bottom).toBeLessThanOrEqual(layout.description.top)
			expect(layout.title.bottom).toBeLessThanOrEqual(layout.actions.top)
			expect(layout.title.bottom).toBeLessThanOrEqual(layout.image.top)
			expect(layout.description.bottom).toBeLessThanOrEqual(
				layout.viewportHeight,
			)
			expect(layout.actions.bottom).toBeLessThanOrEqual(layout.viewportHeight)
			expect(layout.image.bottom).toBeLessThanOrEqual(layout.viewportHeight)
		})
	}

	test('uses the wider Russian title area on large desktops', async ({ page }) => {
		await page.setViewportSize({ width: 1980, height: 1138 })
		await page.goto('/ru')
		await page.evaluate(() => document.fonts.ready)

		const titleWidth = await page.locator('.hero-title').evaluate(element =>
			element.getBoundingClientRect().width,
		)

		expect(titleWidth).toBeGreaterThanOrEqual(1450)
	})
})
