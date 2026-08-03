import { expect, test, type Page } from '@playwright/test'

const mobileViewports = [
	{ width: 320, height: 568 },
	{ width: 360, height: 800 },
	{ width: 375, height: 812 },
	{ width: 390, height: 844 },
	{ width: 412, height: 915 },
	{ width: 430, height: 932 },
	{ width: 667, height: 375 },
	{ width: 719, height: 900 },
] as const

async function waitForCarousel(page: Page) {
	await page.locator('.realized-projects-section').waitFor({ state: 'attached' })
	await page.evaluate(() => document.fonts.ready)
	await page.evaluate(
		() =>
			new Promise<void>(resolve => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			}),
	)
}

for (const viewport of mobileViewports) {
	test(`realized projects exposes the next card at ${viewport.width}x${viewport.height}`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport)
		await page.goto('/en', { waitUntil: 'domcontentloaded' })
		await waitForCarousel(page)

		const layout = await page.evaluate(() => {
			const viewportElement = document.querySelector<HTMLElement>(
				'.realized-projects-viewport',
			)
			const track = document.querySelector<HTMLElement>(
				'.realized-projects-track',
			)
			const cards = [
				...document.querySelectorAll<HTMLElement>('.realized-project-card'),
			]
			const navigation = document.querySelector<HTMLElement>(
				'.realized-projects-navigation',
			)

			if (!viewportElement || !track || !navigation || cards.length < 2) {
				throw new Error('Realized projects carousel is incomplete')
			}

			const viewportRect = viewportElement.getBoundingClientRect()
			const firstRect = cards[0].getBoundingClientRect()
			const secondRect = cards[1].getBoundingClientRect()
			const viewportStyle = getComputedStyle(viewportElement)

			return {
				cardCount: cards.length,
				firstLeftInset: firstRect.left - viewportRect.left,
				firstRightInset: viewportRect.right - firstRect.right,
				nextCardPreview: viewportRect.right - secondRect.left,
				trackScrollable:
					viewportElement.scrollWidth > viewportElement.clientWidth,
				scrollSnapType: viewportStyle.scrollSnapType,
				overflowX: viewportStyle.overflowX,
				navigationDisplay: getComputedStyle(navigation).display,
				pageOverflow:
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth,
			}
		})

		expect(layout.cardCount).toBe(4)
		expect(layout.firstLeftInset).toBeGreaterThanOrEqual(-1)
		expect(layout.firstRightInset).toBeGreaterThanOrEqual(19)
		expect(layout.nextCardPreview).toBeGreaterThanOrEqual(19)
		expect(layout.nextCardPreview).toBeLessThanOrEqual(29)
		expect(layout.trackScrollable).toBe(true)
		expect(layout.scrollSnapType).toContain('x mandatory')
		expect(layout.overflowX).toBe('auto')
		expect(layout.navigationDisplay).not.toBe('none')
		expect(layout.pageOverflow).toBe(false)
	})
}

test('mobile arrows and pagination follow clicks and manual scrolling', async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto('/en', { waitUntil: 'domcontentloaded' })
	await waitForCarousel(page)

	const previous = page.getByRole('button', { name: 'Previous project' })
	const next = page.getByRole('button', { name: 'Next project' })
	const dots = page.locator('.realized-projects-dot')

	await expect(dots).toHaveCount(4)
	await expect(previous).toBeDisabled()
	await expect(next).toBeEnabled()
	await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true')

	await next.click()
	await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true')
	await expect(previous).toBeEnabled()

	await dots.nth(3).click()
	await expect(dots.nth(3)).toHaveAttribute('aria-current', 'true')
	await expect(next).toBeDisabled()

	await page.evaluate(() => {
		const viewportElement = document.querySelector<HTMLElement>(
			'.realized-projects-viewport',
		)
		const card = document.querySelectorAll<HTMLElement>(
			'.realized-project-card',
		)[1]
		if (!viewportElement || !card) throw new Error('Carousel geometry missing')

		const viewportRect = viewportElement.getBoundingClientRect()
		const cardRect = card.getBoundingClientRect()
		viewportElement.scrollTo({
			left: viewportElement.scrollLeft + cardRect.left - viewportRect.left,
			behavior: 'instant',
		})
	})

	await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true')
	await expect(previous).toBeEnabled()
	await expect(next).toBeEnabled()

	await previous.click()
	await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true')
	await expect(previous).toBeDisabled()
})

test('mobile navigation exposes localized Russian labels', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 800 })
	await page.goto('/ru', { waitUntil: 'domcontentloaded' })
	await waitForCarousel(page)

	await expect(
		page.getByRole('navigation', { name: 'Навигация по проектам' }),
	).toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Предыдущий проект' }),
	).toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Следующий проект' }),
	).toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Перейти к проекту 1' }),
	).toHaveAttribute('aria-current', 'true')
})

test('reduced motion disables smooth mobile carousel scrolling', async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' })
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto('/en', { waitUntil: 'domcontentloaded' })
	await waitForCarousel(page)

	const scrollBehavior = await page
		.locator('.realized-projects-viewport')
		.evaluate(element => getComputedStyle(element).scrollBehavior)

	expect(scrollBehavior).toBe('auto')
})

test('720px preserves the existing non-mobile realized projects layout', async ({
	page,
}) => {
	await page.setViewportSize({ width: 720, height: 900 })
	await page.goto('/en', { waitUntil: 'domcontentloaded' })
	await waitForCarousel(page)

	const boundary = await page.evaluate(() => {
		const viewportElement = document.querySelector<HTMLElement>(
			'.realized-projects-viewport',
		)
		const navigation = document.querySelector<HTMLElement>(
			'.realized-projects-navigation',
		)
		if (!viewportElement || !navigation) {
			throw new Error('Realized projects boundary elements missing')
		}

		return {
			navigationDisplay: getComputedStyle(navigation).display,
			scrollSnapType: getComputedStyle(viewportElement).scrollSnapType,
			pageOverflow:
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth,
		}
	})

	expect(boundary.navigationDisplay).toBe('none')
	expect(boundary.scrollSnapType).toBe('none')
	expect(boundary.pageOverflow).toBe(false)
})
