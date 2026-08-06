import { expect, test } from '@playwright/test'

for (const width of [360, 390, 719] as const) {
	test(`Infrastructure gallery keeps mobile images prominent at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 844 })
		await page.goto('/ru')
		const gallery = page.locator('.infrastructure-gallery')
		await gallery.scrollIntoViewIfNeeded()
		await expect(gallery).toBeVisible()

		const metrics = await page.evaluate(() => {
			const gallery = document.querySelector<HTMLElement>('.infrastructure-gallery')
			const firstItem = document.querySelector<HTMLElement>(
				"[data-gallery-set='original'] .infrastructure-gallery-item",
			)
			const masks = Array.from(
				document.querySelectorAll<HTMLElement>('[data-gallery-mask]'),
			)

			if (!gallery || !firstItem) throw new Error('Infrastructure gallery is missing')

			return {
				itemWidth: firstItem.getBoundingClientRect().width,
				galleryHeight: gallery.getBoundingClientRect().height,
				maskOpacities: masks.map(mask => getComputedStyle(mask).opacity),
				hasPageOverflow:
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth,
			}
		})

		expect(metrics.itemWidth).toBeGreaterThanOrEqual(Math.min(width + 1, 552))
		expect(metrics.galleryHeight).toBeGreaterThan(400)
		expect(metrics.maskOpacities).toEqual(['0', '0'])
		expect(metrics.hasPageOverflow).toBe(false)
	})
}
