import { expect, test } from '@playwright/test'

for (const language of ['ru', 'en', 'uz'] as const) {
	test(`footer keeps the final copyright phrase on one line for ${language}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 360, height: 800 })
		await page.goto(`/${language}`, { waitUntil: 'domcontentloaded' })
		await page.locator('.footer-copyright').waitFor({ state: 'attached' })
		await page.evaluate(() => document.fonts.ready)

		const layout = await page.evaluate(() => {
			const protectedText = document.querySelector<HTMLElement>(
				'.footer-copyright-protected',
			)
			if (!protectedText) throw new Error('Protected copyright text is missing')

			return {
				lineCount: protectedText.getClientRects().length,
				whiteSpace: getComputedStyle(protectedText).whiteSpace,
				pageOverflow:
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth,
			}
		})

		expect(layout.lineCount).toBe(1)
		expect(layout.whiteSpace).toBe('nowrap')
		expect(layout.pageOverflow).toBe(false)
	})
}
