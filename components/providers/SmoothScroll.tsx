'use client'

import { gsap, registerGsapPlugins, ScrollTrigger } from '@/lib/gsap'
import Lenis from 'lenis'
import { useEffect, useRef } from 'react'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
	const tickerFnRef = useRef<((time: number) => void) | null>(null)

	useEffect(() => {
		registerGsapPlugins()

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			orientation: 'vertical',
			smoothWheel: true,
		})

		const refreshLayout = () => {
			requestAnimationFrame(() => {
				;(lenis as { resize?: () => void }).resize?.()
				ScrollTrigger.refresh()
			})
		}

		const scrollToTarget = (event: Event) => {
			const { target } =
				(event as CustomEvent<{ target?: string | HTMLElement }>).detail ?? {}

			if (!target) return

			event.preventDefault()
			refreshLayout()

			requestAnimationFrame(() => {
				lenis.scrollTo(target, {
					duration: 0.25,
					easing: (t: number) => 1 - Math.pow(1 - t, 3),
				})
			})
		}

		lenis.on('scroll', ScrollTrigger.update)

		const tickerFn = (time: number) => {
			lenis.raf(time * 1000)
		}
		tickerFnRef.current = tickerFn

		gsap.ticker.add(tickerFn)
		gsap.ticker.lagSmoothing(0)

		window.addEventListener('load', refreshLayout)
		window.addEventListener('futurelab:critical-assets-ready', refreshLayout)
		window.addEventListener('futurelab:image-loaded', refreshLayout)
		window.addEventListener('futurelab:smooth-scroll-to', scrollToTarget)

		if ('fonts' in document) {
			document.fonts.ready.then(refreshLayout).catch(() => undefined)
		}

		const refreshTimeout = window.setTimeout(refreshLayout, 500)

		return () => {
			window.removeEventListener('load', refreshLayout)
			window.removeEventListener(
				'futurelab:critical-assets-ready',
				refreshLayout,
			)
			window.removeEventListener('futurelab:image-loaded', refreshLayout)
			window.removeEventListener('futurelab:smooth-scroll-to', scrollToTarget)
			window.clearTimeout(refreshTimeout)

			if (tickerFnRef.current) {
				gsap.ticker.remove(tickerFnRef.current)
			}

			lenis.destroy()
		}
	}, [])

	return <>{children}</>
}
