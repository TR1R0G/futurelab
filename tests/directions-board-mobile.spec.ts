import { expect, test } from '@playwright/test'

const mobileWidths = [360, 390, 719] as const
const nonMobileWidths = [720, 1000, 1200, 1400, 1600] as const
const desktopRotationById = {
	'ar-vr-webar': -16,
	'3d-gamedev': 0,
	'genai-animation': -5,
	holography: -15,
	gamification: 8,
	'digital-tourism': -2,
} as const
const referenceCenterById = {
	'ar-vr-webar': { x: 0.42, y: 0.686 },
	'3d-gamedev': { x: 0.605, y: 0.812 },
	'genai-animation': { x: 0.78, y: 0.551 },
	holography: { x: 0.865, y: 0.736 },
	gamification: { x: 0.848, y: 0.268 },
	'digital-tourism': { x: 0.607, y: 0.405 },
} as const

type DirectionId = keyof typeof desktopRotationById
type Point = { x: number; y: number }

function polygonsOverlap(first: Point[], second: Point[]) {
	for (const polygon of [first, second]) {
		for (let index = 0; index < polygon.length; index += 1) {
			const start = polygon[index]
			const end = polygon[(index + 1) % polygon.length]
			const axis = {
				x: -(end.y - start.y),
				y: end.x - start.x,
			}
			const firstProjection = first.map(
				point => point.x * axis.x + point.y * axis.y,
			)
			const secondProjection = second.map(
				point => point.x * axis.x + point.y * axis.y,
			)

			if (
				Math.max(...firstProjection) <= Math.min(...secondProjection) ||
				Math.max(...secondProjection) <= Math.min(...firstProjection)
			) {
				return false
			}
		}
	}

	return true
}

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

		expect(layout.columnCount).toBe(1)
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

test('mobile Directions background light stays soft and subdued', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto('/ru', { waitUntil: 'domcontentloaded' })

	const light = await page.evaluate(() => {
		const element = document.querySelector<HTMLElement>(
			'.directions-statement > .directions-statement-light',
		)
		if (!element) throw new Error('Directions background light is missing')

		const style = getComputedStyle(element)
		return { filter: style.filter, opacity: Number(style.opacity) }
	})

	expect(light.filter).toContain('blur(250px)')
	expect(light.opacity).toBeCloseTo(0.58, 2)
})

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
			const title = document.querySelector<HTMLElement>(
				'.directions-board-title',
			)
			if (!board || !title) throw new Error('Directions board is missing')

			const boardRect = board.getBoundingClientRect()
			const titleRect = title.getBoundingClientRect()
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
					const angle = Math.atan2(b, a)
					const centerX = (rect.left + rect.right) / 2
					const centerY = (rect.top + rect.bottom) / 2
					const halfWidth = chip.offsetWidth / 2
					const halfHeight = chip.offsetHeight / 2
					const corners = [
						[-halfWidth, -halfHeight],
						[halfWidth, -halfHeight],
						[halfWidth, halfHeight],
						[-halfWidth, halfHeight],
					].map(([x, y]) => ({
						x: centerX + x * Math.cos(angle) - y * Math.sin(angle),
						y: centerY + x * Math.sin(angle) + y * Math.cos(angle),
					}))

					return [
						id,
						{
							left: rect.left,
							right: rect.right,
							top: rect.top,
							bottom: rect.bottom,
							centerX,
							centerY,
							rotation: (Math.atan2(b, a) * 180) / Math.PI,
							corners,
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
				corners: Point[]
			}>

			return {
				board: {
					left: boardRect.left,
					right: boardRect.right,
					top: boardRect.top,
					bottom: boardRect.bottom,
				},
				title: {
					left: titleRect.left,
					right: titleRect.right,
					top: titleRect.top,
					bottom: titleRect.bottom,
				},
				chips,
				pageOverflow:
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth,
			}
		}, Object.keys(desktopRotationById) as DirectionId[])

		expect(geometry.pageOverflow).toBe(false)
		const boardWidth = geometry.board.right - geometry.board.left
		const boardHeight = geometry.board.bottom - geometry.board.top
		const normalizedCenter = (id: DirectionId) => ({
			x:
				(geometry.chips[id].centerX - geometry.board.left) /
				boardWidth,
			y:
				(geometry.chips[id].centerY - geometry.board.top) /
				boardHeight,
		})

		expect(geometry.title.left - geometry.board.left).toBeGreaterThanOrEqual(20)
		expect(geometry.title.top - geometry.board.top).toBeGreaterThanOrEqual(20)
		expect(geometry.title.right).toBeLessThan(
			geometry.chips.gamification.left,
		)

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
				const overlaps = polygonsOverlap(a.corners, b.corners)
				expect(
					overlaps,
					`${firstId} overlaps ${secondId} at ${width}px`,
				).toBe(false)
			}
		}

		const chips = geometry.chips
		const gamification = normalizedCenter('gamification')
		const digitalTourism = normalizedCenter('digital-tourism')
		const genai = normalizedCenter('genai-animation')
		const arVr = normalizedCenter('ar-vr-webar')
		const gameDev = normalizedCenter('3d-gamedev')
		const holography = normalizedCenter('holography')

		expect(gamification.x).toBeGreaterThan(0.78)
		expect(gamification.y).toBeLessThan(0.4)
		expect(digitalTourism.x).toBeGreaterThan(0.48)
		expect(digitalTourism.x).toBeLessThan(0.76)
		expect(digitalTourism.y).toBeLessThan(0.53)
		expect(genai.x).toBeGreaterThan(0.68)
		expect(genai.y).toBeGreaterThan(0.42)
		expect(genai.y).toBeLessThan(0.72)
		expect(arVr.x).toBeGreaterThan(0.35)
		expect(arVr.x).toBeLessThan(0.62)
		expect(arVr.y).toBeGreaterThan(0.55)
		expect(gameDev.x).toBeGreaterThan(0.5)
		expect(gameDev.y).toBeGreaterThan(0.68)
		expect(holography.x).toBeGreaterThan(0.76)
		expect(holography.y).toBeGreaterThan(0.58)

		if (width >= 1600) {
			for (const [id, expectedCenter] of Object.entries(
				referenceCenterById,
			) as [DirectionId, { x: number; y: number }][]) {
				const center = normalizedCenter(id)
				expect(center.x, `${id} reference x`).toBeCloseTo(
					expectedCenter.x,
					1,
				)
				expect(center.y, `${id} reference y`).toBeCloseTo(
					expectedCenter.y,
					1,
				)
			}
		}

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

for (const width of [390, 1440]) {
	test(`directions expanded video is centered in the viewport at ${width}px`, async ({
		page,
	}) => {
		const height = 900
		await page.setViewportSize({ width, height })
		await page.goto('/ru', { waitUntil: 'domcontentloaded' })
		await page.evaluate(() => document.fonts.ready)

		const scrollToExpansionEnd = () =>
			page.evaluate(() => {
				const section = document.querySelector<HTMLElement>(
					'.directions-section .expanded-image-section',
				)
				if (!section)
					throw new Error('Directions expanded media section is missing')

				const top = section.getBoundingClientRect().top + window.scrollY
				window.scrollTo({
					top: top + section.offsetHeight - window.innerHeight - 1,
					behavior: 'instant',
				})
			})

		// Pin spacers settle after the first scroll on wider layouts.
		await scrollToExpansionEnd()
		await page.waitForTimeout(120)
		await scrollToExpansionEnd()
		await page.waitForTimeout(200)

		const mediaCenter = await page.evaluate(() => {
			const section = document.querySelector<HTMLElement>(
				'.directions-section .expanded-image-section',
			)
			const video = document.querySelector<HTMLVideoElement>(
				'.directions-section .expanded-image-section video',
			)
			const frame = video?.parentElement
			if (!section || !frame)
				throw new Error('Directions expanded video frame is missing')

			const rect = frame.getBoundingClientRect()
			return {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
				objectFit: getComputedStyle(video).objectFit,
			}
		})

		expect(mediaCenter.x, JSON.stringify(mediaCenter)).toBeCloseTo(width / 2, 0)
		expect(mediaCenter.y, JSON.stringify(mediaCenter)).toBeCloseTo(height / 2, 0)
		if (width < 720) {
			expect(mediaCenter.objectFit).toBe('contain')
		}
	})
}
