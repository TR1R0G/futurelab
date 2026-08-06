import { expect, test } from '@playwright/test'

for (const language of ['ru', 'en', 'uz'] as const) {
	test(`mobile cases CTA transitions into compact Trust cards for ${language}`, async ({
		page,
	}) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(`/${language}`, { waitUntil: 'domcontentloaded' })
	await page.locator('.trust-section').waitFor({ state: 'attached' })
	await page.evaluate(() => document.fonts.ready)

	const layout = await page.evaluate(() => {
		const ctaSection = document.querySelector<HTMLElement>('.cases-to-trust-cta')
		const ctaCard = ctaSection?.querySelector<HTMLElement>('.infrastructure-cta')
		const trust = document.querySelector<HTMLElement>('.trust-section')
		const title = trust?.querySelector<HTMLElement>('h2')
		const intro = trust?.querySelector<HTMLElement>('.trust-intro')

		if (!ctaSection || !ctaCard || !trust || !title || !intro) {
			throw new Error('Cases CTA to Trust transition is incomplete')
		}

		const ctaCardRect = ctaCard.getBoundingClientRect()
		const titleRect = title.getBoundingClientRect()
		const introRect = intro.getBoundingClientRect()

		const stats = [
			...document.querySelectorAll<HTMLElement>('.experience-stat-card'),
		].map(card => {
			const inner = card.querySelector<HTMLElement>(
				'.experience-stat-card-inner',
			)
			if (!inner) throw new Error('Trust stat card inner is missing')

			const cardRect = card.getBoundingClientRect()
			const innerRect = inner.getBoundingClientRect()
			return {
				height: cardRect.height,
				contentFits:
					innerRect.top >= cardRect.top && innerRect.bottom <= cardRect.bottom,
			}
		})

		return {
			ctaToTrustTitle: titleRect.top - ctaCardRect.bottom,
			titleToIntro: introRect.top - titleRect.bottom,
			ctaPaddingBottom: getComputedStyle(ctaSection).paddingBottom,
			trustPaddingTop: getComputedStyle(trust).paddingTop,
			introMarginTop: getComputedStyle(intro).marginTop,
			stats,
		}
	})

	expect(layout.ctaToTrustTitle).toBeGreaterThan(0)
	expect(layout.ctaToTrustTitle).toBeLessThanOrEqual(105)
	expect(layout.titleToIntro).toBeCloseTo(36, 0)
	expect(layout.ctaPaddingBottom).toBe('48px')
	expect(layout.trustPaddingTop).toBe('56px')
	expect(layout.introMarginTop).toBe('36px')
	expect(layout.stats).toHaveLength(3)
	for (const stat of layout.stats) {
		expect(stat.height).toBeLessThanOrEqual(270)
		expect(stat.contentFits).toBe(true)
	}
	})
}
