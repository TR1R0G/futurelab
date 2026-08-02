import { expect, test, type Page } from '@playwright/test'

const viewports = [360, 720, 960, 1200, 1400, 1440, 1600] as const

const alignedSelectors = [
	'.infrastructure-heading',
	'.infrastructure-cards',
	'.infrastructure-separator',
	'.academy-heading',
	'.academy-programs-stage',
	'.directions-board',
	'.directions-statement',
	'.directions-post-image-divider',
	'.solutions-inner',
	'.realized-title-frame',
	'.realized-projects-viewport',
	'.experience-content',
	'.contact-content',
	'.footer-inner',
] as const

const containedSelectors = [
	'.academy-card-stage',
	'.programs-grid',
	'.directions-board-card',
	'.solutions-heading',
	'.solutions-description',
	'.solutions-card-outline',
	'.experience-stats',
	'.trust-additional-copy',
	'.contact-card',
	'.footer-contact-list',
] as const

const leftAlignedSelectors = [
	'.solutions-heading',
	'.solutions-description',
] as const

type Box = {
	selector: string
	left: number
	right: number
	width: number
	hasShell: boolean
}

async function waitForLayout(page: Page) {
	await page.locator('.footer-inner').waitFor({ state: 'attached' })
	await page.evaluate(() => document.fonts.ready)
	await page.evaluate(
		() =>
			new Promise<void>(resolve => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			}),
	)
}

async function readLayout(page: Page) {
	return page.evaluate(({ selectors, containedSelectors, leftAlignedSelectors }) => {
		const boxes: Box[] = selectors.map(selector => {
			const element = document.querySelector<HTMLElement>(selector)
			if (!element) {
				throw new Error(`Missing horizontal-gutter target: ${selector}`)
			}

			const rect = element.getBoundingClientRect()
			return {
				selector,
				left: rect.left,
				right: rect.right,
				width: rect.width,
				hasShell: element.classList.contains('section-shell'),
			}
		})

		const contained = containedSelectors.map(selector => {
			const element = document.querySelector<HTMLElement>(selector)
			if (!element) {
				throw new Error(`Missing contained horizontal-gutter target: ${selector}`)
			}

			const rect = element.getBoundingClientRect()
			return {
				selector,
				left: rect.left,
				right: rect.right,
				width: rect.width,
			}
		})

		const leftAligned = leftAlignedSelectors.map(selector => {
			const element = document.querySelector<HTMLElement>(selector)
			if (!element) {
				throw new Error(`Missing left-aligned gutter target: ${selector}`)
			}

			const rect = element.getBoundingClientRect()
			return {
				selector,
				left: rect.left,
				width: rect.width,
			}
		})

		return {
			boxes,
			contained,
			leftAligned,
			shellCount: document.querySelectorAll('.section-shell').length,
			hasHorizontalOverflow:
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth,
		}
	}, { selectors: alignedSelectors, containedSelectors, leftAlignedSelectors })
}

for (const width of viewports) {
	test(`shared section gutters align scoped content at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/ru')
		await waitForLayout(page)

		const layout = await readLayout(page)
		const gutter = Math.min(80, Math.max(20, width * 0.0575))
		const shellWidth = Math.min(1436, width - gutter * 2)
		const shellLeft = (width - shellWidth) / 2
		const shellRight = shellLeft + shellWidth

		expect(layout.shellCount).toBeGreaterThanOrEqual(alignedSelectors.length)
		expect(layout.hasHorizontalOverflow).toBe(false)

		for (const box of layout.boxes) {
			expect(box.hasShell, box.selector).toBe(true)
			expect(box.width, box.selector).toBeGreaterThan(0)
			expect(box.left, box.selector).toBeCloseTo(shellLeft, 0)
			expect(box.right, box.selector).toBeCloseTo(shellRight, 0)
		}

		for (const box of layout.contained) {
			expect(box.width, box.selector).toBeGreaterThan(0)
			expect(box.left, box.selector).toBeGreaterThanOrEqual(shellLeft - 1)
			expect(box.right, box.selector).toBeLessThanOrEqual(shellRight + 1)
		}

		for (const box of layout.leftAligned) {
			expect(box.width, box.selector).toBeGreaterThan(0)
			expect(box.left, box.selector).toBeCloseTo(shellLeft, 0)
		}
	})
}

test('English route keeps shared shells renderable without page overflow', async ({
	page,
}) => {
	await page.setViewportSize({ width: 720, height: 900 })
	await page.goto('/en')
	await waitForLayout(page)

	const layout = await readLayout(page)

	expect(layout.hasHorizontalOverflow).toBe(false)
	for (const box of layout.boxes) {
		expect(box.hasShell, box.selector).toBe(true)
		expect(box.width, box.selector).toBeGreaterThan(0)
	}
	for (const box of layout.contained) {
		expect(box.width, box.selector).toBeGreaterThan(0)
	}
	for (const box of layout.leftAligned) {
		expect(box.width, box.selector).toBeGreaterThan(0)
	}
})
