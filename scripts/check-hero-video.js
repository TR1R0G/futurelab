/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright')

const chromeExecutable =
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const baseUrl = process.env.TEST_URL || 'http://localhost:3000'

async function assertHeroVideo(page, lang, expectedFile) {
	await page.goto(`${baseUrl}?lang=${lang}`, { waitUntil: 'domcontentloaded' })
	const video = page.locator('.hero-image video')
	await video.waitFor({ state: 'attached', timeout: 5000 })

	const source = await video.evaluate(
		element => element.currentSrc || element.src,
	)
	if (!decodeURIComponent(source).endsWith(expectedFile)) {
		throw new Error(
			`Expected ${lang} hero video ${expectedFile}, got ${source}`,
		)
	}

	const section = await page.locator('.hero-section').evaluate(element => ({
		top: element.getBoundingClientRect().top + window.scrollY,
		maxScroll: element.offsetHeight - window.innerHeight,
	}))

	for (const progress of [0, 0.42, 0.82]) {
		await page.evaluate(
			({ top, maxScroll, progress }) =>
				window.scrollTo(0, top + maxScroll * progress),
			{ ...section, progress },
		)
		await page.waitForTimeout(450)

		const state = await video.evaluate(async element => {
			if (element.paused) {
				await element.play().catch(() => undefined)
			}

			const before = element.currentTime
			await new Promise(resolve => setTimeout(resolve, 350))

			const rect = element.getBoundingClientRect()
			return {
				autoplay: element.autoplay,
				muted: element.muted,
				loop: element.loop,
				playsInline: element.playsInline,
				paused: element.paused,
				before,
				after: element.currentTime,
				width: rect.width,
				height: rect.height,
			}
		})

		if (!state.autoplay || !state.muted || !state.loop || !state.playsInline) {
			throw new Error(
				`Hero video is missing autoplay-safe attributes at progress ${progress}`,
			)
		}

		if (state.paused || state.after <= state.before) {
			throw new Error(
				`Hero video is not playing at scroll progress ${progress}`,
			)
		}

		if (state.width <= 0 || state.height <= 0) {
			throw new Error(
				`Hero video is not visible at scroll progress ${progress}`,
			)
		}
	}
}

async function run() {
	const browser = await chromium.launch({
		headless: true,
		executablePath: chromeExecutable,
	})

	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	})

	await assertHeroVideo(page, 'ru', '/videos/block1/hero-ru.mp4')
	await assertHeroVideo(page, 'en', '/videos/block1/hero-en.mp4')

	await browser.close()
}

run().catch(error => {
	console.error(error.message)
	process.exit(1)
})
