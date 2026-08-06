import { expect, test } from '@playwright/test'

for (const width of [360, 720, 960, 1200, 1440, 1600]) {
	test(`ecosystem intro has balanced vertical insets at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/ru')
		await page.locator('.ecosystem-section').waitFor()
		await page.evaluate(() => document.fonts.ready)

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
	})
}

for (const width of [360, 720, 960, 1200, 1440, 1600]) {
	test(`ecosystem feature content keeps a balanced lower inset at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/uz')
		await page.locator('.ecosystem-section').waitFor()
		await page.evaluate(() => document.fonts.ready)

		const insets = await page.evaluate(() => {
			const wrapper = document.querySelector<HTMLElement>('.ecosystem-wrapper')
			const title = document.querySelector<HTMLElement>('.ecosystem-title')
			const descriptions = [
				...document.querySelectorAll<HTMLElement>(
					'.ecosystem-feature-description',
				),
			]

			if (!wrapper || !title || descriptions.length === 0) {
				throw new Error('Ecosystem feature elements were not rendered')
			}

			const wrapperRect = wrapper.getBoundingClientRect()
			const titleRect = title.getBoundingClientRect()
			const contentBottom = Math.max(
				...descriptions.map(description => description.getBoundingClientRect().bottom),
			)

			return {
				top: titleRect.top - wrapperRect.top,
				bottom: wrapperRect.bottom - contentBottom,
			}
		})

		expect(insets.bottom).toBeGreaterThanOrEqual(insets.top - 2)
	})
}
