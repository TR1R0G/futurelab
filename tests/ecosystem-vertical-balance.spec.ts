import { expect, test } from '@playwright/test'

for (const width of [360, 720, 960, 1200, 1440, 1600]) {
	test(`ecosystem intro has balanced vertical insets at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/ru')
		await page.locator('.ecosystem-section').waitFor()
		await page.waitForFunction(() =>
			document
				.querySelector<HTMLElement>('.ecosystem-section')
				?.style.getPropertyValue('--ecosystem-card-height'),
		)

		const insets = await page.evaluate(() => {
			const wrapper = document.querySelector<HTMLElement>('.ecosystem-wrapper')
			const title = document.querySelector<HTMLElement>('.ecosystem-title')
			const icon = document.querySelector<HTMLElement>('.ecosystem-intro-icon')

			if (!wrapper || !title || !icon) {
				throw new Error('Ecosystem intro elements were not rendered')
			}

			const wrapperRect = wrapper.getBoundingClientRect()
			const titleRect = title.getBoundingClientRect()
			const iconRect = icon.getBoundingClientRect()

			return {
				top: titleRect.top - wrapperRect.top,
				bottom: wrapperRect.bottom - iconRect.bottom,
			}
		})

		expect(insets.bottom).toBeGreaterThanOrEqual(insets.top - 2)
		expect(insets.bottom).toBeLessThanOrEqual(insets.top + 12)
	})
}
