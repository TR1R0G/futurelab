import { expect, test, type Page } from '@playwright/test'

const referenceViewports = [
	{ width: 360, height: 800 },
	{ width: 720, height: 900 },
	{ width: 960, height: 900 },
	{ width: 1200, height: 900 },
	{ width: 1440, height: 900 },
] as const

type Rect = {
	left: number
	top: number
	right: number
	bottom: number
	width: number
	height: number
}

async function waitForEcosystem(page: Page) {
	await page.locator('.ecosystem-wrapper').waitFor({ state: 'attached' })
	await page.evaluate(() => document.fonts.ready)
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			}),
	)
}

async function readEcosystemLayout(page: Page) {
	return page.evaluate(() => {
		const toRect = (rect: DOMRect): Rect => ({
			left: rect.left,
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
			width: rect.width,
			height: rect.height,
		})
		const wrapper = document.querySelector<HTMLElement>('.ecosystem-wrapper')!
		const track = document.querySelector<HTMLElement>('.ecosystem-track')!
		const columns = [
			...document.querySelectorAll<HTMLElement>('.ecosystem-column'),
		]
		const features = [
			...document.querySelectorAll<HTMLElement>('.ecosystem-feature-column'),
		].map((feature) => ({
			column: toRect(feature.getBoundingClientRect()),
			icon: toRect(
				feature
					.querySelector<HTMLElement>('.ecosystem-feature-icon')!
					.getBoundingClientRect(),
			),
			title: toRect(
				feature
					.querySelector<HTMLElement>('.ecosystem-feature-title')!
					.getBoundingClientRect(),
			),
			description: toRect(
				feature
					.querySelector<HTMLElement>('.ecosystem-feature-description')!
					.getBoundingClientRect(),
			),
		}))

		return {
			wrapper: toRect(wrapper.getBoundingClientRect()),
			track: toRect(track.getBoundingClientRect()),
			trackMarginLeft: getComputedStyle(track).marginLeft,
			columns: columns.map((column) => toRect(column.getBoundingClientRect())),
			features,
			pageHasHorizontalOverflow:
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth,
		}
	})
}

async function scrollEcosystemToEnd(page: Page) {
	const target = await page.evaluate(() => {
		document.documentElement.style.scrollBehavior = 'auto'
		const section = document.querySelector<HTMLElement>('.ecosystem-section')!
		const spacer = section.parentElement?.classList.contains('pin-spacer')
			? section.parentElement
			: section
		const rect = spacer.getBoundingClientRect()
		const bottom = rect.top + window.scrollY + spacer.scrollHeight
		const maxScroll = document.documentElement.scrollHeight - window.innerHeight
		const scrollTarget = Math.min(
			maxScroll,
			Math.max(0, bottom - window.innerHeight),
		)
		window.scrollTo(0, scrollTarget)
		return scrollTarget
	})
	await page.waitForFunction(
		(scrollTarget) => Math.abs(window.scrollY - scrollTarget) < 4,
		target,
	)
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			}),
	)
	await page.waitForFunction(() => {
		const wrapper =
			document.querySelector<HTMLElement>('.ecosystem-wrapper')?.getBoundingClientRect()
		const feature = document
			.querySelector<HTMLElement>('.ecosystem-feature-column-3')
			?.getBoundingClientRect()

		return Boolean(
			wrapper &&
				feature &&
				feature.right > wrapper.left &&
				feature.left < wrapper.right,
		)
	})
}

for (const viewport of referenceViewports) {
	test(`Ecosystem uses contained semantic geometry at ${viewport.width}px`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport)
		await page.goto('/ru')
		await waitForEcosystem(page)

		const layout = await readEcosystemLayout(page)

		expect(layout.wrapper.left).toBeGreaterThanOrEqual(0)
		expect(layout.wrapper.right).toBeLessThanOrEqual(viewport.width)
		expect(layout.track.left).toBeCloseTo(layout.wrapper.left, 0)
		expect(layout.trackMarginLeft).toBe('0px')
		expect(layout.columns).toHaveLength(4)
		expect(layout.pageHasHorizontalOverflow).toBe(false)

		for (const column of layout.columns) {
			expect(column.width).toBeGreaterThan(0)
			expect(column.height).toBeGreaterThan(0)
		}

		for (const feature of layout.features) {
			expect(feature.icon.bottom).toBeLessThanOrEqual(feature.title.top)
			expect(feature.title.bottom).toBeLessThanOrEqual(
				feature.description.top,
			)
			expect(feature.description.bottom).toBeLessThanOrEqual(
				layout.wrapper.bottom,
			)
		}

		expect(
			Math.abs(
				layout.features[0].column.top - layout.features[2].column.top,
			),
		).toBeLessThan(2)
		expect(layout.features[1].column.top).toBeLessThan(
			layout.features[0].column.top,
		)
	})
}

for (const viewport of [
	{ width: 360, height: 800 },
	{ width: 1200, height: 900 },
] as const) {
	test(`Ecosystem keeps all English copy renderable at ${viewport.width}px`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport)
		await page.goto('/en')
		await waitForEcosystem(page)

		const copy = await page.evaluate(() =>
			[
				...document.querySelectorAll<HTMLElement>(
					'.ecosystem-title, .ecosystem-description, .ecosystem-feature-title, .ecosystem-feature-description',
				),
			].map((element) => {
				const rect = element.getBoundingClientRect()
				return {
					text: element.innerText.trim(),
					width: rect.width,
					height: rect.height,
				}
			}),
		)

		expect(copy).toHaveLength(8)
		for (const item of copy) {
			expect(item.text.length).toBeGreaterThan(0)
			expect(item.width).toBeGreaterThan(0)
			expect(item.height).toBeGreaterThan(0)
		}
	})
}

test('Ecosystem horizontal scroll reveals the last feature and returns to the intro', async ({
	page,
}) => {
	await page.setViewportSize({ width: 720, height: 900 })
	await page.goto('/ru')
	await waitForEcosystem(page)

	await scrollEcosystemToEnd(page)
	const endState = await page.evaluate(() => {
		const wrapper = document
			.querySelector<HTMLElement>('.ecosystem-wrapper')!
			.getBoundingClientRect()
		const feature = document
			.querySelector<HTMLElement>('.ecosystem-feature-column-3')!
			.getBoundingClientRect()
		return {
			intersects: feature.right > wrapper.left && feature.left < wrapper.right,
		}
	})
	expect(endState.intersects).toBe(true)

	await page.evaluate(() => {
		document.documentElement.style.scrollBehavior = 'auto'
		window.scrollTo(0, 0)
	})
	await page.waitForFunction(() => {
		const wrapper =
			document.querySelector<HTMLElement>('.ecosystem-wrapper')?.getBoundingClientRect()
		const intro = document
			.querySelector<HTMLElement>('.ecosystem-intro-column')
			?.getBoundingClientRect()

		return Boolean(
			wrapper &&
				intro &&
				intro.right > wrapper.left &&
				intro.left < wrapper.right,
		)
	})
	const startState = await page.evaluate(() => {
		const wrapper = document
			.querySelector<HTMLElement>('.ecosystem-wrapper')!
			.getBoundingClientRect()
		const intro = document
			.querySelector<HTMLElement>('.ecosystem-intro-column')!
			.getBoundingClientRect()
		return {
			intersects: intro.right > wrapper.left && intro.left < wrapper.right,
		}
	})
	expect(startState.intersects).toBe(true)
})
