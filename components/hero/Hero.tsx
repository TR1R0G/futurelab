'use client'

import { gsap, registerGsapPlugins } from '@/lib/gsap'
import { useGlobalVideoSound } from '@/components/providers/SoundProvider'
import type { Language } from '@/lib/mdx'
import Image from 'next/image'
import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { GradientOrb } from './GradientOrb'
import { HeroActions } from './HeroActions'
import { HeroTitle } from './HeroTitle'

interface HeroProps {
	title: string
	description: string
	primaryCta: string
	secondaryCta: string
	headerCta: string
	imageAlt: string
	language: Language
}

export function Hero({
	title,
	description,
	primaryCta,
	secondaryCta,
	headerCta,
	imageAlt,
	language,
}: HeroProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const headerRef = useRef<HTMLElement>(null)
	const copyRef = useRef<HTMLDivElement>(null)
	const descRef = useRef<HTMLParagraphElement>(null)
	const imageRef = useRef<HTMLDivElement>(null)
	const imageFrameRef = useRef<HTMLDivElement>(null)
	const videoRef = useRef<HTMLVideoElement>(null)
	const actionsRef = useRef<HTMLDivElement>(null)
	const heroVideoSrc =
		language === 'en'
			? '/videos/block1/hero-en.mp4'
			: '/videos/block1/hero-ru.mp4'

	useGlobalVideoSound(videoRef, [heroVideoSrc])

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		void video.play().catch(() => undefined)
	}, [heroVideoSrc])

	useEffect(() => {
		registerGsapPlugins()

		const ctx = gsap.context(() => {
			const section = sectionRef.current
			const header = headerRef.current
			const copy = copyRef.current
			const desc = descRef.current
			const image = imageRef.current
			const imageFrame = imageFrameRef.current
			const actions = actionsRef.current
			const light = section?.querySelector<HTMLElement>('.hero-light')

			if (
				!section ||
				!header ||
				!copy ||
				!desc ||
				!image ||
				!imageFrame ||
				!actions ||
				!light
			) {
				return
			}

			const clamp = (value: number) => Math.min(1, Math.max(0, value))
			const lerp = (start: number, end: number, progress: number) =>
				start + (end - start) * progress
			const finalImageAt = 0.82

			const readRect = (element: HTMLElement) => {
				const computed = getComputedStyle(element)
				return {
					left: parseFloat(computed.left) || 0,
					right: parseFloat(computed.right) || 0,
					top: parseFloat(computed.top) || 0,
					width: parseFloat(computed.width) || 0,
					height: parseFloat(computed.height) || 0,
				}
			}

			const getTarget = (vh: number): ScrollTarget => {
				const width = window.innerWidth
				const visualGroupWidth = 1013.91
				const visualGroupHeight = 946.61
				const visualScale = Math.min(
					1,
					(width * 0.9) / visualGroupWidth,
					(vh * 0.92) / visualGroupHeight,
				)
				const imageWidth = Math.round(530 * visualScale)
				const imageHeight = Math.round(928 * visualScale)
				const imageTop = Math.max(32, Math.round((vh - imageHeight) / 2))
				const centerY = vh / 2
				const gradientTop = Math.round(
					(vh - visualGroupHeight * visualScale) / 2 + 22 * visualScale,
				)
				const gradientScale = (visualGroupHeight * visualScale) / 508.64

				if (width >= 1600) {
					const frameOffset = (width - 1920) / 2
					const desktopDescriptionLeft = Math.max(
						40,
						Math.round(frameOffset + 242),
					)
					const desktopActionsRight = Math.max(
						40,
						Math.round(width - (frameOffset + 1349 + 329)),
					)

					return {
						image: { top: imageTop, width: imageWidth, height: imageHeight },
						description: {
							left: desktopDescriptionLeft,
							top: Math.round(centerY - 120),
							width: 402,
						},
						actions: {
							right: desktopActionsRight,
							top: Math.round(centerY - 115),
							width: 329,
						},
						gradientScale,
						gradientTop,
					}
				}

				if (width >= 1200) {
					const compactHeight = vh <= 820
					const tabletImageWidth = compactHeight ? 340 : 373
					const tabletImageHeight = compactHeight ? 596 : 653

					return {
						image: {
							top: Math.round((vh - tabletImageHeight) / 2),
							width: tabletImageWidth,
							height: tabletImageHeight,
						},
						description: {
							left: compactHeight ? 98 : 135,
							top: Math.round(centerY - 113),
							width: compactHeight ? 310 : 370,
						},
						actions: {
							right: Math.max(
								compactHeight ? 96 : 134,
								Math.round((width - 1305) / 2),
							),
							top: Math.round(centerY - 113),
							width: 270,
						},
						gradientScale,
						gradientTop: Math.round((vh - 631.91) / 2 - 60),
					}
				}

				if (width >= 900) {
					const mediumImageWidth = 373
					const mediumImageHeight = 653

					return {
						image: {
							top: Math.round((vh - mediumImageHeight) / 2),
							width: mediumImageWidth,
							height: mediumImageHeight,
						},
						description: {
							left: 35,
							top: Math.round(centerY - 225),
							width: 210,
						},
						actions: { right: 35, top: Math.round(centerY - 177), width: 210 },
						gradientScale,
						gradientTop: Math.round((vh - 631.91) / 2 - 60),
					}
				}

				if (width >= 640) {
					const smallTabletImageWidth = 373
					const smallTabletImageHeight = 653

					return {
						image: {
							top: Math.round((vh - smallTabletImageHeight) / 2),
							width: smallTabletImageWidth,
							height: smallTabletImageHeight,
						},
						description: {
							left: 155,
							top: Math.round(centerY - 225),
							width: 210,
						},
						actions: {
							right: Math.max(0, width - 845),
							top: Math.round(centerY - 177),
							width: 210,
						},
						gradientScale,
						gradientTop: Math.round((vh - 631.91) / 2 - 60),
					}
				}

				return {
					image: { top: 64, width: 300, height: 525 },
					hideText: true,
					gradientScale,
					gradientTop: 120,
				}
			}

			let frame = 0
			let start = {
				desc: readRect(desc),
				image: readRect(image),
				actions: readRect(actions),
				light: readRect(light),
			}

			const resetInlineStyles = () => {
				for (const element of [
					header,
					copy,
					desc,
					image,
					imageFrame,
					actions,
					light,
				]) {
					element.removeAttribute('style')
				}

				start = {
					desc: readRect(desc),
					image: readRect(image),
					actions: readRect(actions),
					light: readRect(light),
				}
			}

			const update = () => {
				frame = 0

				const vh = window.innerHeight
				const maxScroll = Math.max(1, section.offsetHeight - vh)
				const sectionTop = section.getBoundingClientRect().top + window.scrollY
				const progress = clamp((window.scrollY - sectionTop) / maxScroll)
				const imageProgress = clamp(progress / finalImageAt)
				const eased = gsap.parseEase('power2.inOut')(imageProgress)
				const target = getTarget(vh)

				header.style.opacity = String(1 - clamp(progress * 3))
				header.style.transform = `translateY(${-90 * eased}px)`

				copy.style.opacity = String(1 - clamp(progress * 3))
				copy.style.transform = `translateY(${-150 * eased}px)`

				light.style.opacity = '1'
				light.style.top = `${lerp(start.light.top, target.gradientTop, eased)}px`
				light.style.transform = `rotate(-12.33deg) scale(${lerp(1, target.gradientScale, eased)})`

				image.style.left = '50%'
				image.style.top = `${lerp(start.image.top, target.image.top, eased)}px`
				image.style.width = `${lerp(start.image.width, target.image.width, eased)}px`
				image.style.height = `${lerp(start.image.height, target.image.height, eased)}px`
				image.style.transform = 'translateX(-50%)'
				const initialRadius =
					window.innerWidth >= 1200 && window.innerWidth < 1600 ? 15 : 13
				const expandedRadius = window.innerWidth < 1200 ? 25 : 35
				imageFrame.style.borderRadius = `${lerp(
					initialRadius,
					expandedRadius,
					eased,
				)}px`

				if (target.hideText) {
					desc.style.opacity = String(1 - clamp(progress * 2))
					actions.style.opacity = String(1 - clamp(progress * 2))
					return
				}

				const description = target.description
				const actionTarget = target.actions

				if (!description || !actionTarget) return

				desc.style.opacity = '1'
				desc.style.left = `${lerp(start.desc.left, description.left, eased)}px`
				desc.style.top = `${lerp(start.desc.top, description.top, eased)}px`
				desc.style.width = `${lerp(start.desc.width, description.width, eased)}px`

				actions.style.opacity = '1'
				actions.style.left = 'auto'
				actions.style.right = `${lerp(start.actions.right, actionTarget.right, eased)}px`
				actions.style.top = `${lerp(start.actions.top, actionTarget.top, eased)}px`
				actions.style.width = `${lerp(start.actions.width, actionTarget.width, eased)}px`
			}

			const requestUpdate = () => {
				if (frame) return
				frame = window.requestAnimationFrame(update)
			}

			resetInlineStyles()
			update()

			window.addEventListener('scroll', requestUpdate, { passive: true })
			window.addEventListener('resize', resetInlineStyles)
			window.addEventListener('resize', requestUpdate)

			return () => {
				if (frame) window.cancelAnimationFrame(frame)
				window.removeEventListener('scroll', requestUpdate)
				window.removeEventListener('resize', resetInlineStyles)
				window.removeEventListener('resize', requestUpdate)
			}
		}, sectionRef)

		return () => ctx.revert()
	}, [])

	return (
		<section ref={sectionRef} className='hero-section relative w-full bg-black'>
			<div className='hero-stage sticky top-0 h-screen w-full overflow-hidden bg-black'>
				<div className='absolute inset-0 z-0'>
					<GradientOrb />
				</div>

				<HeroHeader cta={headerCta} headerRef={headerRef} language={language} />

				<div ref={copyRef} className='hero-copy relative z-10'>
					<HeroTitle title={title} />
				</div>

				<p ref={descRef} className='hero-description relative z-10'>
					{description}
				</p>

				<div ref={imageRef} className='hero-image relative z-10'>
					<div
						ref={imageFrameRef}
						className='hero-image-frame relative h-full w-full overflow-hidden rounded-[13px] shadow-2xl shadow-black/45'
					>
						<video
							key={heroVideoSrc}
							ref={videoRef}
							className='h-full w-full object-cover'
							aria-label={imageAlt}
							autoPlay
							muted
							loop
							playsInline
							preload='auto'
							poster='/images/optimized/office.webp'
							disablePictureInPicture
						>
							<source src={heroVideoSrc} type='video/mp4' />
						</video>
					</div>
				</div>

				<div ref={actionsRef} className='hero-action-panel relative z-10'>
					<HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
				</div>
			</div>
		</section>
	)
}

interface ScrollTarget {
	image: {
		top: number
		width: number
		height: number
	}
	gradientScale: number
	gradientTop: number
	hideText?: boolean
	description?: {
		left: number
		top: number
		width: number
	}
	actions?: {
		right: number
		top: number
		width: number
	}
}

function HeroHeader({
	cta,
	headerRef,
	language,
}: {
	cta: string
	headerRef: RefObject<HTMLElement | null>
	language: Language
}) {
	return (
		<header
			ref={headerRef}
			className='hero-header relative z-20'
			aria-label='Future Lab'
		>
			<div className='hero-brand-shell'>
				<a className='hero-brand' href='#' aria-label='Future Lab'>
					<Image
						src='/images/logo.svg'
						alt='futurelab by NAZZAR Innovation'
						width={144}
						height={30}
						priority
					/>
				</a>
				<button className='hero-header-button bg-[#0B5CFF] font-medium text-white'>
					{cta}
				</button>
			</div>
			<div className='hero-language' aria-label='Language'>
				<a
					href='?lang=en'
					className={language === 'en' ? 'font-bold' : 'font-normal'}
					aria-current={language === 'en' ? 'true' : undefined}
				>
					Eng
				</a>
				<span className='hero-language-divider' aria-hidden='true' />
				<a
					href='?lang=ru'
					className={language === 'ru' ? 'font-bold' : 'font-normal'}
					aria-current={language === 'ru' ? 'true' : undefined}
				>
					Рус
				</a>
			</div>
		</header>
	)
}
