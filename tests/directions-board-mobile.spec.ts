import { expect, test } from '@playwright/test'

const mobileWidths = [360, 390, 719] as const

for (const width of mobileWidths) {
	test(`directions board uses the approved mobile grid at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/ru', { waitUntil: 'domcontentloaded' })
		await page.evaluate(() => document.fonts.ready)
		await page.evaluate(
			() =>
				new Promise<void>(resolve => {
					requestAnimationFrame(() =>
						requestAnimationFrame(() => resolve()),
					)
				}),
		)

		const layout = await page.evaluate(() => {
			const board = document.querySelector<HTMLElement>(
				'.directions-board-card',
			)
			const gradient = document.querySelector<HTMLElement>(
				'.directions-board-gradient',
			)
			const layer = document.querySelector<HTMLElement>(
				'.directions-chip-layer',
			)
			const chips = [
				...document.querySelectorAll<HTMLElement>('.directions-chip'),
			]

			if (!board || !gradient || !layer) {
				throw new Error('Directions board elements are missing')
			}

			const rects = chips.map(chip => chip.getBoundingClientRect())
			const boardRect = board.getBoundingClientRect()
			const gradientRect = gradient.getBoundingClientRect()

			return {
				columnCount: getComputedStyle(layer).gridTemplateColumns.split(' ')
					.length,
				chipCount: chips.length,
				chipStyles: chips.map(chip => {
					const style = getComputedStyle(chip)
					return {
						transform: style.transform,
						backgroundImage: style.backgroundImage,
						backgroundColor: style.backgroundColor,
						borderWidth: style.borderTopWidth,
					}
				}),
				rects: rects.map(rect => ({
					left: rect.left,
					right: rect.right,
					top: rect.top,
					bottom: rect.bottom,
				})),
				board: {
					left: boardRect.left,
					right: boardRect.right,
					top: boardRect.top,
					bottom: boardRect.bottom,
				},
				gradientBottom: gradientRect.bottom,
				pageOverflow:
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth,
			}
		})

		expect(layout.columnCount).toBe(2)
		expect(layout.chipCount).toBe(6)
		expect(layout.pageOverflow).toBe(false)

		for (const style of layout.chipStyles) {
			expect(style.transform).toBe('none')
			expect(style.backgroundImage).toBe('none')
			expect(style.backgroundColor).toBe('rgb(242, 243, 247)')
			expect(style.borderWidth).toBe('0px')
		}

		for (const rect of layout.rects) {
			expect(rect.left).toBeGreaterThanOrEqual(layout.board.left - 1)
			expect(rect.right).toBeLessThanOrEqual(layout.board.right + 1)
			expect(rect.top).toBeGreaterThan(layout.board.top)
			expect(rect.bottom).toBeLessThan(layout.board.bottom - 3)
		}

		for (let first = 0; first < layout.rects.length; first += 1) {
			for (let second = first + 1; second < layout.rects.length; second += 1) {
				const a = layout.rects[first]
				const b = layout.rects[second]
				const overlaps =
					a.left < b.right &&
					a.right > b.left &&
					a.top < b.bottom &&
					a.bottom > b.top
				expect(overlaps, `chips ${first} and ${second} overlap`).toBe(false)
			}
		}

		expect(layout.gradientBottom).toBeGreaterThan(layout.board.bottom)
	})
}

test('720px retains the existing non-mobile directions composition', async ({
	page,
}) => {
	await page.setViewportSize({ width: 720, height: 900 })
	await page.goto('/ru', { waitUntil: 'domcontentloaded' })
	await page.evaluate(() => document.fonts.ready)

	const layout = await page.evaluate(() => {
		const layer = document.querySelector<HTMLElement>('.directions-chip-layer')
		const chips = [
			...document.querySelectorAll<HTMLElement>('.directions-chip'),
		]
		if (!layer) throw new Error('Directions chip layer is missing')

		return {
			display: getComputedStyle(layer).display,
			hasVariant:
				chips.some(
					chip => getComputedStyle(chip).backgroundImage !== 'none',
				) ||
				chips.some(
					chip => getComputedStyle(chip).borderTopWidth !== '0px',
				),
		}
	})

	expect(layout.display).not.toBe('grid')
	expect(layout.hasVariant).toBe(true)
})
