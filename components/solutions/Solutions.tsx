'use client'

import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { Language, SolutionsContent } from '@/lib/mdx'
import { FadeInImage } from '@/components/media/FadeInImage'
import Image from 'next/image'
import type { CSSProperties, RefObject } from 'react'
import { useEffect, useRef } from 'react'

interface SolutionsProps {
	title: string
	description: string
	cards: SolutionsContent['cards']
	language: Language
}

const SOLUTION_CARD_TOP = 555
const SOLUTION_CARD_IMAGE_TOP = 1059
const SOLUTION_EXPANDED_GLOW_TOP = 1415.47
const SOLUTION_EXPANDED_IMAGE_TOP = 1598
const SOLUTION_BLOCK_HEIGHT = 2020.92
const SOLUTION_TRAILING_SPACE = 220
const SOLUTION_IMAGE_FINAL_AT = 0.82
const MUSEUM_VIDEO_SRC = '/videos/museum/museum.mp4'

type Rect = {
	left: number
	top: number
	width: number
	height: number
}

export function Solutions({ title, description, cards, language }: SolutionsProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const mediaRefs = useRef<Array<HTMLDivElement | null>>([])
	const cursorRef = useRef<HTMLDivElement | null>(null)
	const museumHref = `/museum?lang=${language}`

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		if (!section) return

		const mediaQuery = window.matchMedia('(min-width: 1024px)')
		const ease = gsap.parseEase('power2.inOut')
		const clamp = (value: number) => Math.min(1, Math.max(0, value))
		const lerp = (from: number, to: number, progress: number) =>
			from + (to - from) * progress
		const sourceRects = new Map<HTMLDivElement, Rect>()
		let frame = 0

		const getLayout = (index: number) => {
			const offset = index * SOLUTION_BLOCK_HEIGHT

			return {
				cardTop: SOLUTION_CARD_TOP + offset,
				start: {
					left: 371,
					top: SOLUTION_CARD_IMAGE_TOP + offset,
					width: 694,
					height: 391,
					borderRadius: 35,
				},
			}
		}

		const getTargetRect = (): Rect => {
			const visualWidth = 1436
			const visualHeight = 809
			const visualScale = Math.min(
				1,
				(window.innerWidth * 0.9) / visualWidth,
				(window.innerHeight * 0.92) / visualHeight,
			)
			const width = Math.round(visualWidth * visualScale)
			const height = Math.round(visualHeight * visualScale)

			return {
				left: Math.round((window.innerWidth - width) / 2),
				top: Math.max(32, Math.round((window.innerHeight - height) / 2)),
				width,
				height,
			}
		}

		const readSourceRect = (media: HTMLDivElement, index: number): Rect => {
			const rect = media.getBoundingClientRect()

			if (
				rect.width > 0 &&
				rect.height > 0 &&
				media.style.position !== 'fixed'
			) {
				return {
					left: rect.left,
					top: rect.top,
					width: rect.width,
					height: rect.height,
				}
			}

			const container = media.closest<HTMLElement>('.solutions-inner')
			const containerRect = container?.getBoundingClientRect()
			const { start } = getLayout(index)

			return {
				left: (containerRect?.left ?? 0) + start.left,
				top: section.getBoundingClientRect().top + start.top,
				width: start.width,
				height: start.height,
			}
		}

		const getReleasedPosition = (
			media: HTMLDivElement,
			target: Rect,
			releaseScroll: number,
		) => {
			const container = media.closest<HTMLElement>('.solutions-inner')
			const containerRect = container?.getBoundingClientRect()
			const containerTop =
				(containerRect?.top ?? section.getBoundingClientRect().top) +
				window.scrollY
			const containerLeft = containerRect?.left ?? 0

			return {
				left: Math.round(target.left - containerLeft),
				top: Math.round(releaseScroll - containerTop + target.top),
			}
		}

		const setSourceState = (media: HTMLDivElement, index: number) => {
			const { start } = getLayout(index)

			media.style.position = 'absolute'
			media.style.left = `${start.left}px`
			media.style.top = `${start.top}px`
			media.style.width = `${start.width}px`
			media.style.height = `${start.height}px`
			media.style.borderRadius = `${start.borderRadius}px`
			media.style.zIndex = '20'
			media.style.transform = 'none'
			media.style.willChange = 'left, top, width, height, border-radius'
		}

		const setReleasedState = (
			media: HTMLDivElement,
			target: Rect,
			releaseScroll: number,
		) => {
			const released = getReleasedPosition(media, target, releaseScroll)

			media.style.position = 'absolute'
			media.style.left = `${released.left}px`
			media.style.top = `${released.top}px`
			media.style.width = `${target.width}px`
			media.style.height = `${target.height}px`
			media.style.borderRadius = '35px'
			media.style.zIndex = '20'
			media.style.transform = 'none'
			media.style.willChange = 'left, top, width, height, border-radius'
		}

		const setFixedState = (
			media: HTMLDivElement,
			start: Rect,
			target: Rect,
			progress: number,
		) => {
			const eased = ease(progress)

			media.style.position = 'fixed'
			media.style.left = `${lerp(start.left, target.left, eased)}px`
			media.style.top = `${lerp(start.top, target.top, eased)}px`
			media.style.width = `${lerp(start.width, target.width, eased)}px`
			media.style.height = `${lerp(start.height, target.height, eased)}px`
			media.style.borderRadius = '35px'
			media.style.zIndex = '220'
			media.style.transform = 'none'
			media.style.willChange = 'left, top, width, height, border-radius'
		}

		const update = () => {
			frame = 0

			if (!mediaQuery.matches) {
				sourceRects.clear()
				mediaRefs.current.forEach(media => media?.removeAttribute('style'))
				return
			}

			const sectionTop = section.getBoundingClientRect().top + window.scrollY
			const sectionBottom = sectionTop + section.offsetHeight
			const target = getTargetRect()

			mediaRefs.current.forEach((media, index) => {
				if (!media) return

				if (window.scrollY >= sectionBottom - 1) {
					media.style.visibility = 'hidden'
					media.style.pointerEvents = 'none'
					return
				}

				media.style.visibility = 'visible'
				media.style.pointerEvents = ''

				const { cardTop } = getLayout(index)
				const animationStart = sectionTop + cardTop + 5
				const releaseScroll =
					sectionTop +
					SOLUTION_EXPANDED_IMAGE_TOP +
					index * SOLUTION_BLOCK_HEIGHT -
					target.top
				const transitionDistance = Math.max(1, releaseScroll - animationStart)
				const rawProgress =
					(window.scrollY - animationStart) /
					transitionDistance

				if (rawProgress <= 0) {
					setSourceState(media, index)
					sourceRects.set(media, readSourceRect(media, index))
					return
				}

				if (rawProgress >= 1) {
					setReleasedState(media, target, releaseScroll)
					sourceRects.delete(media)
					return
				}

				const startRect =
					sourceRects.get(media) ?? readSourceRect(media, index)
				sourceRects.set(media, startRect)

				setFixedState(
					media,
					startRect,
					target,
					clamp(rawProgress / SOLUTION_IMAGE_FINAL_AT),
				)
			})
		}

		const requestUpdate = () => {
			if (frame) return
			frame = window.requestAnimationFrame(update)
		}

		const handleResize = () => {
			sourceRects.clear()
			mediaRefs.current.forEach(media => media?.removeAttribute('style'))
			requestUpdate()
		}

		const ctx = gsap.context(() => {
			mediaRefs.current.forEach((media, index) => {
				if (media) setSourceState(media, index)
			})
			update()
			window.addEventListener('scroll', requestUpdate, { passive: true })
			window.addEventListener('resize', handleResize)
			mediaQuery.addEventListener('change', handleResize)
		}, section)

		return () => {
			if (frame) window.cancelAnimationFrame(frame)
			window.removeEventListener('scroll', requestUpdate)
			window.removeEventListener('resize', handleResize)
			mediaQuery.removeEventListener('change', handleResize)
			ctx.revert()
		}
	}, [cards.length])

	useEffect(() => {
		const section = sectionRef.current
		const cursor = cursorRef.current
		if (!section || !cursor) return

		const mediaQuery = window.matchMedia('(min-width: 361px) and (pointer: fine)')
		let frame = 0
		let cursorX = 0
		let cursorY = 0

		const setCursor = () => {
			frame = 0
			cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`
		}

		const requestCursorUpdate = () => {
			if (frame) return
			frame = window.requestAnimationFrame(setCursor)
		}

		const showCursor = () => {
			if (!mediaQuery.matches) return
			cursor.dataset.visible = 'true'
		}

		const hideCursor = () => {
			cursor.dataset.visible = 'false'
		}

		const moveCursor = (event: PointerEvent) => {
			if (!mediaQuery.matches) return
			cursorX = event.clientX
			cursorY = event.clientY
			requestCursorUpdate()
		}

		const syncMediaState = () => {
			if (!mediaQuery.matches) hideCursor()
		}

		const cards = Array.from(
			section.querySelectorAll<HTMLElement>('.solutions-card-outline'),
		)

		cards.forEach(card => {
			card.addEventListener('pointerenter', showCursor)
			card.addEventListener('pointermove', moveCursor)
			card.addEventListener('pointerleave', hideCursor)
		})
		mediaQuery.addEventListener('change', syncMediaState)
		syncMediaState()

		return () => {
			if (frame) window.cancelAnimationFrame(frame)
			cards.forEach(card => {
				card.removeEventListener('pointerenter', showCursor)
				card.removeEventListener('pointermove', moveCursor)
				card.removeEventListener('pointerleave', hideCursor)
			})
			mediaQuery.removeEventListener('change', syncMediaState)
		}
	}, [])

	const sectionHeight =
		SOLUTION_CARD_TOP + cards.length * SOLUTION_BLOCK_HEIGHT + SOLUTION_TRAILING_SPACE

	return (
		<section
			ref={sectionRef}
			className='solutions-section relative z-[120] isolate -mt-20 overflow-hidden bg-black px-5 py-24 md:px-8 lg:mt-[60px] lg:px-0 lg:py-0'
			style={{ minHeight: `${sectionHeight}px` }}
		>
			<div
				className='solutions-inner relative mx-auto max-w-[1436px]'
				style={{ height: `${sectionHeight}px` }}
			>
				<div className='solutions-heading lg:absolute lg:left-0 lg:top-[150px] lg:w-[857px]'>
					<h2 className='font-heading whitespace-pre-line text-[42px] font-bold leading-[1.08] tracking-normal text-white md:text-[56px] lg:text-[65px] lg:leading-[73px]'>
						{title}
					</h2>
				</div>

				<p className='solutions-description mt-10 max-w-[944px] text-[18px] font-medium leading-[1.24] text-[#C4C4C4] md:text-[21px] lg:absolute lg:left-0 lg:top-[366px] lg:mt-0 lg:text-[23px] lg:leading-[28px]'>
					{description}
				</p>

				{cards.map((card, index) => {
					const top = SOLUTION_CARD_TOP + index * SOLUTION_BLOCK_HEIGHT
					const expandedTop =
						SOLUTION_EXPANDED_GLOW_TOP + index * SOLUTION_BLOCK_HEIGHT
					const imageTop = SOLUTION_CARD_IMAGE_TOP + index * SOLUTION_BLOCK_HEIGHT
					const isMuseumCard = index === 0

					return (
						<div key={card.title}>
							<SolutionCard
								card={card}
								href={isMuseumCard ? museumHref : undefined}
								className='mt-16 md:mt-20 lg:absolute lg:left-0 lg:mt-0'
								style={{ top }}
							/>
							<ExpandedGlow top={expandedTop} />
							<TransitionMedia
								mediaRef={element => {
									mediaRefs.current[index] = element
								}}
								image={card.image}
								imageAlt={card.imageAlt}
								videoSrc={isMuseumCard ? MUSEUM_VIDEO_SRC : undefined}
								top={imageTop}
							/>
						</div>
					)
				})}

				<LearnMoreCursor
					cursorRef={cursorRef}
					label={cards[0]?.cta ?? 'Узнать больше'}
				/>
			</div>
		</section>
	)
}

function SolutionCard({
	card,
	href,
	className = '',
	style,
}: {
	card: SolutionsContent['cards'][number]
	href?: string
	className?: string
	style?: CSSProperties
}) {
	const classNames = `solutions-card-outline relative block min-h-[680px] overflow-visible rounded-[35px] bg-black lg:h-[680px] lg:w-full ${className}`
	const content = (
		<>
			<div className='relative z-20 px-8 pt-14 md:px-[72px] md:pt-[86px] lg:px-0 lg:pt-0'>
				<h3 className='text-[38px] font-semibold leading-tight text-[#DE5CFF] md:text-[48px] lg:absolute lg:left-[121px] lg:top-[88px] lg:w-[760px] lg:text-[55px] lg:leading-[66px]'>
					{card.title}
				</h3>

				<p className='mt-10 max-w-[821px] whitespace-pre-line text-[18px] font-medium leading-[1.24] text-[#C4C4C4] md:text-[21px] lg:absolute lg:left-[121px] lg:top-[204px] lg:mt-0 lg:text-[23px] lg:leading-[28px]'>
					{card.description}
				</p>
			</div>

			<LearnMoreButton label={card.cta} />

			<CollapsedGlow />
		</>
	)

	if (href) {
		return (
			<a
				href={href}
				className={classNames}
				style={style}
				aria-label={`${card.cta}: ${card.title}`}
			>
				{content}
			</a>
		)
	}

	return (
		<article
			className={classNames}
			style={style}
		>
			{content}
		</article>
	)
}

function LearnMoreButton({ label }: { label: string }) {
	return (
		<span
			aria-hidden='true'
			className='learn-more-button absolute left-[1107px] top-[160px] z-30 hidden h-[252.42px] w-[252.42px] text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0051FF] active:scale-[0.98] lg:block'
		>
			<span className='absolute left-[22.21px] top-[22.21px] h-[207px] w-[207px] rounded-full bg-[#0051FF]' />
			<svg
				className='learn-more-title-ring absolute left-[18.21px] top-[18.21px] h-[216px] w-[216px] overflow-visible'
				viewBox='0 0 216 216'
				aria-hidden='true'
			>
				<defs>
					<path
						id='learn-more-circle'
						d='M108 108 m -75 0 a 75 75 0 1 1 150 0 a 75 75 0 1 1 -150 0'
					/>
				</defs>
				<text className='fill-white text-[24px] font-semibold tracking-[0.035em]'>
					<textPath
						href='#learn-more-circle'
						startOffset='0%'
						textLength='465'
						lengthAdjust='spacing'
					>
						{label} • {label} • {label} •
					</textPath>
				</text>
			</svg>
			<Image
				src='/images/block6/arrow.svg'
				alt=''
				width={28}
				height={28}
				className='absolute left-[112.21px] top-[112.2px] h-[28px] w-[28px]'
				aria-hidden='true'
			/>
		</span>
	)
}

function LearnMoreCursor({
	cursorRef,
	label,
}: {
	cursorRef: RefObject<HTMLDivElement | null>
	label: string
}) {
	return (
		<div
			ref={cursorRef}
			className='learn-more-cursor pointer-events-none fixed left-0 top-0 z-[500] hidden h-[252.42px] w-[252.42px] text-white'
			data-visible='false'
			aria-hidden='true'
		>
			<span className='absolute left-[22.21px] top-[22.21px] h-[207px] w-[207px] rounded-full bg-[#0051FF]' />
			<svg
				className='learn-more-title-ring absolute left-[18.21px] top-[18.21px] h-[216px] w-[216px] overflow-visible'
				viewBox='0 0 216 216'
			>
				<defs>
					<path
						id='learn-more-cursor-circle'
						d='M108 108 m -75 0 a 75 75 0 1 1 150 0 a 75 75 0 1 1 -150 0'
					/>
				</defs>
				<text className='fill-white text-[24px] font-semibold tracking-[0.035em]'>
					<textPath
						href='#learn-more-cursor-circle'
						startOffset='0%'
						textLength='465'
						lengthAdjust='spacing'
					>
						{label} • {label} • {label} •
					</textPath>
				</text>
			</svg>
			<Image
				src='/images/block6/arrow.svg'
				alt=''
				width={28}
				height={28}
				className='absolute left-[112.21px] top-[112.2px] h-[28px] w-[28px]'
			/>
		</div>
	)
}

function CollapsedGlow() {
	return (
		<div className='pointer-events-none absolute left-1/2 top-[420px] z-10 h-[870px] w-[954px] -translate-x-1/2 lg:left-[calc(50%+5.16px)] lg:top-[262.79px]'>
			<SolutionGlow variant='collapsed' />
		</div>
	)
}

function ExpandedGlow({ top }: { top: number }) {
	return (
		<div
			className='pointer-events-none relative mt-20 hidden h-[1160px] w-full lg:absolute lg:left-0 lg:mt-0 lg:block'
			style={{ top }}
		>
			<SolutionGlow variant='expanded' />
		</div>
	)
}

function TransitionMedia({
	mediaRef,
	image,
	imageAlt,
	videoSrc,
	top,
}: {
	mediaRef: (element: HTMLDivElement | null) => void
	image: string
	imageAlt: string
	videoSrc?: string
	top: number
}) {
	return (
		<div
			ref={mediaRef}
			className='solutions-transition-media relative z-20 mt-20 h-[391px] w-full overflow-hidden rounded-[35px] shadow-2xl shadow-black/40 lg:absolute lg:left-[371px] lg:top-[1059px] lg:mt-0 lg:h-[391px] lg:w-[694px]'
			style={{ top }}
		>
			{videoSrc ? (
				<video
					key={videoSrc}
					className='h-full w-full object-cover'
					aria-label={imageAlt}
					autoPlay
					muted
					loop
					playsInline
					preload='auto'
					poster={image}
					disablePictureInPicture
				>
					<source src={videoSrc} type='video/mp4' />
				</video>
			) : (
				<FadeInImage
					src={image}
					alt={imageAlt}
					fill
					sizes='(min-width: 1024px) 1436px, calc(100vw - 40px)'
					className='object-cover'
					unoptimized
				/>
			)}
		</div>
	)
}

function SolutionGlow({ variant }: { variant: 'collapsed' | 'expanded' }) {
	if (variant === 'expanded') {
		return (
			<div
				className='solutions-glow solutions-glow-expanded'
				aria-hidden='true'
			>
				<span className='solutions-glow-ellipse solutions-glow-expanded-blue' />
				<span className='solutions-glow-ellipse solutions-glow-expanded-yellow' />
				<span className='solutions-glow-ellipse solutions-glow-expanded-pink' />
			</div>
		)
	}

	return (
		<div className='solutions-glow solutions-glow-collapsed' aria-hidden='true'>
			<span className='solutions-glow-ellipse solutions-glow-collapsed-blue' />
			<span className='solutions-glow-ellipse solutions-glow-collapsed-yellow' />
			<span className='solutions-glow-ellipse solutions-glow-collapsed-pink' />
		</div>
	)
}
