import { expect, test } from '@playwright/test'

const mobileWidths = [360, 390, 719] as const
const nonMobileWidths = [720, 1000, 1200, 1400, 1600] as const
const desktopRotationById = {
	'ar-vr-webar': -16,
	'3d-gamedev': 0,
	'genai-animation': -5,
	holography: -15,
	gamification: 18,
	'digital-tourism': 2,
} as const

type DirectionId = keyof typeof desktopRotationById

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

for (const width of nonMobileWidths) {
	test(`directions chips keep their composition without overlap at ${width}px`, async ({
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

		const geometry = await page.evaluate(ids => {
			const board = document.querySelector<HTMLElement>(
				'.directions-board-card',
			)
			if (!board) throw new Error('Directions board is missing')

			const boardRect = board.getBoundingClientRect()
			const chips = Object.fromEntries(
				ids.map(id => {
					const chip = document.querySelector<HTMLElement>(
						`.directions-chip-slot--${id} .directions-chip`,
					)
					if (!chip) throw new Error(`Directions chip ${id} is missing`)

					const rect = chip.getBoundingClientRect()
					const transform = getComputedStyle(chip).transform
					const matrix = transform.match(/^matrix\(([^)]+)\)$/)
					if (!matrix) throw new Error(`Unexpected transform for ${id}`)
					const [a, b] = matrix[1]
						.split(',')
						.slice(0, 2)
						.map(Number)

					return [
						id,
						{
							left: rect.left,
							right: rect.right,
							top: rect.top,
							bottom: rect.bottom,
							centerX: (rect.left + rect.right) / 2,
							centerY: (rect.top + rect.bottom) / 2,
							rotation: (Math.atan2(b, a) * 180) / Math.PI,
						},
					]
				}),
			) as Record<DirectionId, {
				left: number
				right: number
				top: number
				bottom: number
				centerX: number
				centerY: number
				rotation: number
			}>

			return {
				board: {
					left: boardRect.left,
					right: boardRect.right,
					top: boardRect.top,
					bottom: boardRect.bottom,
				},
				chips,
				pageOverflow:
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth,
			}
		}, Object.keys(desktopRotationById) as DirectionId[])

		expect(geometry.pageOverflow).toBe(false)

		for (const [id, expectedRotation] of Object.entries(
			desktopRotationById,
		) as [DirectionId, number][]) {
			const chip = geometry.chips[id]
			expect(chip.rotation, `${id} rotation at ${width}px`).toBeCloseTo(
				expectedRotation,
				1,
			)
			expect(chip.left, `${id} left containment`).toBeGreaterThanOrEqual(
				geometry.board.left - 1,
			)
			expect(chip.right, `${id} right containment`).toBeLessThanOrEqual(
				geometry.board.right + 1,
			)
			expect(chip.top, `${id} top containment`).toBeGreaterThanOrEqual(
				geometry.board.top - 1,
			)
			expect(chip.bottom, `${id} bottom containment`).toBeLessThanOrEqual(
				geometry.board.bottom + 1,
			)
		}

		const ids = Object.keys(desktopRotationById) as DirectionId[]
		for (let first = 0; first < ids.length; first += 1) {
			for (let second = first + 1; second < ids.length; second += 1) {
				const firstId = ids[first]
				const secondId = ids[second]
				const a = geometry.chips[firstId]
				const b = geometry.chips[secondId]
				const overlaps =
					a.left < b.right &&
					a.right > b.left &&
					a.top < b.bottom &&
					a.bottom > b.top
				expect(
					overlaps,
					`${firstId} overlaps ${secondId} at ${width}px`,
				).toBe(false)
			}
		}

		const chips = geometry.chips
		expect(chips['ar-vr-webar'].centerX).toBeLessThan(
			chips['3d-gamedev'].centerX,
		)
		expect(chips['3d-gamedev'].centerX).toBeLessThan(
			chips.holography.centerX,
		)
		expect(chips['digital-tourism'].centerX).toBeLessThan(
			chips.gamification.centerX,
		)
		expect(chips.gamification.centerY).toBeLessThan(
			chips['digital-tourism'].centerY,
		)
		expect(chips['digital-tourism'].centerY).toBeLessThan(
			chips['genai-animation'].centerY,
		)
		expect(chips['genai-animation'].centerY).toBeLessThan(
			chips['ar-vr-webar'].centerY,
		)
		expect(chips['ar-vr-webar'].centerY).toBeLessThan(
			chips.holography.centerY,
		)
		expect(chips.holography.centerY).toBeLessThan(
			chips['3d-gamedev'].centerY,
		)
	})
}
