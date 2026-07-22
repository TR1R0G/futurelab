'use client'

import { FadeInImage } from '@/components/media/FadeInImage'
import { LazyVideo } from '@/components/media/LazyVideo'
import { useGlobalVideoSound } from '@/components/providers/SoundProvider'
import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { Language, SolutionsContent } from '@/lib/mdx'
import Image from 'next/image'
import type { CSSProperties, RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface SolutionsProps {
	title: string
	description: string
	cards: SolutionsContent['cards']
	language: Language
}

const SOLUTION_TOP_OFFSET = -80
const SOLUTION_CARD_TOP = 555 + SOLUTION_TOP_OFFSET
const SOLUTION_CARD_IMAGE_TOP = 1059 + SOLUTION_TOP_OFFSET
const SOLUTION_EXPANDED_IMAGE_TOP = 1598 + SOLUTION_TOP_OFFSET
const SOLUTION_CARD_IMAGE_LEFT = 371
const SOLUTION_CARD_IMAGE_WIDTH = 694
const SOLUTION_CARD_IMAGE_HEIGHT = 391
const SOLUTION_EXPANDED_MEDIA_WIDTH = 1436
const SOLUTION_EXPANDED_MEDIA_HEIGHT = 809
const SOLUTION_GLOW_WIDTH = 820.87
const SOLUTION_GLOW_HEIGHT = 710.82
const SOLUTION_GLOW_CENTER_OFFSET_X = -61.27
const SOLUTION_GLOW_TOP_OFFSET =
	SOLUTION_CARD_TOP + 262.79 - SOLUTION_CARD_IMAGE_TOP
const SOLUTION_BLOCK_HEIGHT = 2020.92
const SOLUTION_TRAILING_SPACE = 220
const SOLUTION_IMAGE_FINAL_AT = 0.82
const SOLUTION_ANIMATION_START_OFFSET = 5
const MUSEUM_VIDEO_SRC = '/videos/museum/museum.mp4'
const TEMURIDS_VIDEO_SRC = '/videos/temurids/temurids.mp4'
const LEARN_MORE_SEPARATOR = '\u00a0\u00a0•\u00a0\u00a0'

type Rect = {
	left: number
	top: number
	width: number
	height: number
}

type SolutionPlayerMedia = {
	image: string
	imageAlt: string
	videoSrc?: string
	youtubeVideoId?: string
}

const isExternalHref = (href: string) => /^https?:\/\//.test(href)
const isPdfPageHref = (href: string) =>
	href.startsWith('/museum') || href.startsWith('/temurids')

export function Solutions({
	title,
	description,
	cards,
	language,
}: SolutionsProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const mediaRefs = useRef<Array<HTMLDivElement | null>>([])
	const glowRefs = useRef<Array<HTMLDivElement | null>>([])
	const cursorRef = useRef<HTMLDivElement | null>(null)
	const [activePlayerMedia, setActivePlayerMedia] =
		useState<SolutionPlayerMedia | null>(null)
	const museumHref = `/museum?lang=${language}`
	const temuridsHref = `/temurids?lang=${language}`
	const closePlayer = useCallback(() => setActivePlayerMedia(null), [])

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		if (!section) return

		const largeDesktopQuery = window.matchMedia('(min-width: 1370px)')
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
					left: SOLUTION_CARD_IMAGE_LEFT,
					top: SOLUTION_CARD_IMAGE_TOP + offset,
					width: SOLUTION_CARD_IMAGE_WIDTH,
					height: SOLUTION_CARD_IMAGE_HEIGHT,
					borderRadius: 35,
				},
			}
		}

		const isLargeDesktopLayout = () => largeDesktopQuery.matches

		const getLargeDesktopTargetRect = (): Rect => {
			const visualScale = Math.min(
				1,
				(window.innerWidth * 0.9) / SOLUTION_EXPANDED_MEDIA_WIDTH,
				(window.innerHeight * 0.92) / SOLUTION_EXPANDED_MEDIA_HEIGHT,
			)
			const width = Math.round(SOLUTION_EXPANDED_MEDIA_WIDTH * visualScale)
			const height = Math.round(SOLUTION_EXPANDED_MEDIA_HEIGHT * visualScale)

			return {
				left: Math.round((window.innerWidth - width) / 2),
				top: Math.max(32, Math.round((window.innerHeight - height) / 2)),
				width,
				height,
			}
		}

		const getResponsiveTargetRect = (source: Rect): Rect => {
			const horizontalInset =
				window.innerWidth < 720 ? 16 : window.innerWidth < 960 ? 24 : 32
			const verticalInset =
				window.innerWidth < 720 ? 20 : window.innerWidth < 960 ? 28 : 36
			const aspectRatio = source.width / Math.max(1, source.height)
			const maxWidth = window.innerWidth - horizontalInset * 2
			const maxHeight = window.innerHeight - verticalInset * 2
			let width = maxWidth
			let height = width / aspectRatio

			if (height > maxHeight) {
				height = maxHeight
				width = height * aspectRatio
			}

			return {
				left: Math.round((window.innerWidth - width) / 2),
				top: Math.round((window.innerHeight - height) / 2),
				width: Math.round(width),
				height: Math.round(height),
			}
		}

		const getGlowPosition = (rect: Rect) => ({
			left:
				rect.left +
				rect.width / 2 +
				SOLUTION_GLOW_CENTER_OFFSET_X -
				SOLUTION_GLOW_WIDTH / 2,
			top: rect.top + SOLUTION_GLOW_TOP_OFFSET,
		})

		const readSourceRect = (media: HTMLDivElement, index: number): Rect => {
			if (!isLargeDesktopLayout()) {
				const source = media.closest<HTMLElement>('.solution-media-slot') ?? media
				const rect = source.getBoundingClientRect()

				return {
					left: Math.round(rect.left),
					top: Math.round(rect.top),
					width: Math.round(rect.width),
					height: Math.round(rect.height),
				}
			}

			const container = media.closest<HTMLElement>('.solutions-inner')
			const containerRect = container?.getBoundingClientRect()
			const { cardTop, start } = getLayout(index)

			return {
				left: (containerRect?.left ?? 0) + start.left,
				top: start.top - cardTop - SOLUTION_ANIMATION_START_OFFSET,
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

		const setHiddenGlowState = (glow: HTMLDivElement, index: number) => {
			const { start } = getLayout(index)
			const position = getGlowPosition(start)

			glow.style.position = 'absolute'
			glow.style.left = `${position.left}px`
			glow.style.top = `${position.top}px`
			glow.style.width = `${SOLUTION_GLOW_WIDTH}px`
			glow.style.height = `${SOLUTION_GLOW_HEIGHT}px`
			glow.style.opacity = '0'
			glow.style.visibility = 'hidden'
			glow.style.zIndex = '10'
			glow.style.transform = 'none'
			glow.style.transformOrigin = 'top left'
			glow.style.pointerEvents = 'none'
			glow.style.willChange = 'left, top, transform'
		}

		const setReleasedGlowState = (
			glow: HTMLDivElement,
			media: HTMLDivElement,
			target: Rect,
			releaseScroll: number,
		) => {
			const released = getReleasedPosition(media, target, releaseScroll)
			const position = getGlowPosition({
				...target,
				left: released.left,
				top: released.top,
			})

			glow.style.position = 'absolute'
			glow.style.left = `${position.left}px`
			glow.style.top = `${position.top}px`
			glow.style.width = `${SOLUTION_GLOW_WIDTH}px`
			glow.style.height = `${SOLUTION_GLOW_HEIGHT}px`
			glow.style.opacity = '1'
			glow.style.visibility = 'visible'
			glow.style.zIndex = '10'
			glow.style.transform = 'none'
			glow.style.transformOrigin = 'top left'
			glow.style.pointerEvents = 'none'
			glow.style.willChange = 'left, top, transform'
		}

		const setFixedGlowState = (
			glow: HTMLDivElement,
			start: Rect,
			target: Rect,
			progress: number,
		) => {
			const eased = ease(progress)
			const position = getGlowPosition({
				left: lerp(start.left, target.left, eased),
				top: lerp(start.top, target.top, eased),
				width: lerp(start.width, target.width, eased),
				height: lerp(start.height, target.height, eased),
			})

			glow.style.position = 'fixed'
			glow.style.left = `${position.left}px`
			glow.style.top = `${position.top}px`
			glow.style.width = `${SOLUTION_GLOW_WIDTH}px`
			glow.style.height = `${SOLUTION_GLOW_HEIGHT}px`
			glow.style.opacity = '1'
			glow.style.visibility = 'visible'
			glow.style.zIndex = '210'
			glow.style.transform = 'none'
			glow.style.transformOrigin = 'top left'
			glow.style.pointerEvents = 'none'
			glow.style.willChange = 'left, top, transform'
		}

		const setSourceState = (media: HTMLDivElement, index: number) => {
			if (!isLargeDesktopLayout()) {
				const slot = media.closest<HTMLElement>('.solution-media-slot')
				if (slot) slot.style.zIndex = ''
				media.removeAttribute('style')
				return
			}

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

		const setResponsiveReleasedState = (
			media: HTMLDivElement,
			target: Rect,
			releaseScroll: number,
		) => {
			const slot = media.closest<HTMLElement>('.solution-media-slot')
			const slotRect = slot?.getBoundingClientRect()
			const slotTop = (slotRect?.top ?? 0) + window.scrollY
			const slotLeft = slotRect?.left ?? 0

			if (slot) slot.style.zIndex = ''
			media.style.position = 'absolute'
			media.style.left = `${Math.round(target.left - slotLeft)}px`
			media.style.top = `${Math.round(releaseScroll + target.top - slotTop)}px`
			media.style.width = `${target.width}px`
			media.style.height = `${target.height}px`
			media.style.borderRadius = '35px'
			media.style.zIndex = '20'
			media.style.transform = 'none'
			media.style.transformOrigin = 'center center'
			media.style.willChange = 'left, top, width, height, border-radius'
		}

		const setFixedState = (
			media: HTMLDivElement,
			start: Rect,
			target: Rect,
			progress: number,
			zIndex = 220,
		) => {
			const eased = ease(progress)
			const slot = media.closest<HTMLElement>('.solution-media-slot')
			if (slot) slot.style.zIndex = `${zIndex}`

			media.style.position = 'fixed'
			media.style.left = `${lerp(start.left, target.left, eased)}px`
			media.style.top = `${lerp(start.top, target.top, eased)}px`
			media.style.width = `${lerp(start.width, target.width, eased)}px`
			media.style.height = `${lerp(start.height, target.height, eased)}px`
			media.style.borderRadius = '35px'
			media.style.zIndex = `${zIndex}`
			media.style.transform = 'none'
			media.style.transformOrigin = 'center center'
			media.style.willChange = 'left, top, width, height, border-radius'
		}

		const update = () => {
			frame = 0

			const sectionTop = section.getBoundingClientRect().top + window.scrollY
			const sectionBottom = sectionTop + section.offsetHeight
			const largeDesktopLayout = isLargeDesktopLayout()
			const largeDesktopTarget = largeDesktopLayout
				? getLargeDesktopTargetRect()
				: null

			mediaRefs.current.forEach((media, index) => {
				if (!media) return
				const glow = glowRefs.current[index]

				if (window.scrollY >= sectionBottom - 1) {
					media.style.visibility = 'hidden'
					media.style.pointerEvents = 'none'
					if (glow) setHiddenGlowState(glow, index)
					return
				}

				media.style.visibility = 'visible'
				media.style.pointerEvents = ''

				const { cardTop } = getLayout(index)
				const responsiveSource = largeDesktopLayout
					? null
					: readSourceRect(media, index)
				const responsiveSourcePageTop = responsiveSource
					? responsiveSource.top + window.scrollY
					: 0
				const animationStart = largeDesktopLayout
					? sectionTop + cardTop + SOLUTION_ANIMATION_START_OFFSET
					: responsiveSourcePageTop - window.innerHeight * 0.64
				const target =
					largeDesktopTarget ?? getResponsiveTargetRect(responsiveSource!)
				const expansionDistance = largeDesktopLayout
					? Math.max(
							1,
							sectionTop +
								SOLUTION_EXPANDED_IMAGE_TOP +
								index * SOLUTION_BLOCK_HEIGHT -
								target.top -
								animationStart,
						)
					: Math.max(
							window.innerHeight * 1.2,
							Math.abs(target.height - responsiveSource!.height) * 2,
						)
				const releaseScroll = animationStart + expansionDistance
				const holdDistance = largeDesktopLayout ? 0 : window.innerHeight * 0.32
				const transitionDistance = Math.max(1, expansionDistance)
				const rawProgress =
					(window.scrollY - animationStart) / transitionDistance

				if (rawProgress <= 0) {
					setSourceState(media, index)
					if (glow) setHiddenGlowState(glow, index)
					sourceRects.set(media, readSourceRect(media, index))
					return
				}

				if (rawProgress >= 1) {
					if (!largeDesktopLayout && window.scrollY < releaseScroll + holdDistance) {
						setFixedState(
							media,
							{
								...responsiveSource!,
								top: responsiveSourcePageTop - animationStart,
							},
							target,
							1,
							500,
						)
						if (glow) glow.removeAttribute('style')
						sourceRects.delete(media)
						return
					}

					if (largeDesktopLayout) {
						setReleasedState(media, target, releaseScroll)
						if (glow) setReleasedGlowState(glow, media, target, releaseScroll)
					} else {
						setResponsiveReleasedState(media, target, releaseScroll + holdDistance)
						if (glow) glow.removeAttribute('style')
					}
					sourceRects.delete(media)
					return
				}

				const startRect = largeDesktopLayout
					? sourceRects.get(media) ?? readSourceRect(media, index)
					: {
							...responsiveSource!,
							top: responsiveSourcePageTop - animationStart,
						}
				sourceRects.set(media, startRect)

				setFixedState(
					media,
					startRect,
					target,
					clamp(rawProgress / SOLUTION_IMAGE_FINAL_AT),
					largeDesktopLayout ? 220 : 500,
				)
				if (glow && largeDesktopLayout) {
					setFixedGlowState(
						glow,
						startRect,
						target,
						clamp(rawProgress / SOLUTION_IMAGE_FINAL_AT),
					)
				}
			})
		}

		const requestUpdate = () => {
			if (frame) return
			frame = window.requestAnimationFrame(update)
		}

		const handleResize = () => {
				sourceRects.clear()
				section
					.querySelectorAll<HTMLElement>('.solution-media-slot')
					.forEach(slot => {
						slot.style.zIndex = ''
					})
				mediaRefs.current.forEach(media => media?.removeAttribute('style'))
				glowRefs.current.forEach(glow => glow?.removeAttribute('style'))
				requestUpdate()
		}

		const ctx = gsap.context(() => {
			mediaRefs.current.forEach((media, index) => {
				if (media) setSourceState(media, index)
			})
			glowRefs.current.forEach((glow, index) => {
				if (glow) setHiddenGlowState(glow, index)
			})
			update()
			window.addEventListener('scroll', requestUpdate, { passive: true })
			window.addEventListener('resize', handleResize)
			largeDesktopQuery.addEventListener('change', handleResize)
		}, section)

		return () => {
			if (frame) window.cancelAnimationFrame(frame)
			window.removeEventListener('scroll', requestUpdate)
			window.removeEventListener('resize', handleResize)
			largeDesktopQuery.removeEventListener('change', handleResize)
			ctx.revert()
		}
	}, [cards.length])

	useEffect(() => {
		const section = sectionRef.current
		const cursor = cursorRef.current
		if (!section || !cursor) return

		const mediaQuery = window.matchMedia(
			'(min-width: 720px) and (pointer: fine)',
		)
		let frame = 0
		let cursorX: number | null = null
		let cursorY: number | null = null

		const setCursor = () => {
			frame = 0
			if (cursorX === null || cursorY === null) return
			cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`
		}

		const requestCursorUpdate = () => {
			if (frame) return
			frame = window.requestAnimationFrame(setCursor)
		}

		const setCursorPosition = (event: PointerEvent, immediate = false) => {
			if (!mediaQuery.matches) return
			cursorX = event.clientX
			cursorY = event.clientY

			if (immediate) {
				if (frame) {
					window.cancelAnimationFrame(frame)
					frame = 0
				}
				setCursor()
				return
			}

			requestCursorUpdate()
		}

		const showCursor = (event: PointerEvent) => {
			if (!mediaQuery.matches) return
			setCursorPosition(event, true)
			cursor.dataset.visible = 'true'
		}

		const hideCursor = () => {
			if (frame) {
				window.cancelAnimationFrame(frame)
				frame = 0
			}
			cursor.dataset.visible = 'false'
		}

		const moveCursor = (event: PointerEvent) => {
			setCursorPosition(event)
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

	useEffect(() => {
		if (!activePlayerMedia) return

		const previousOverflow = document.body.style.overflow
		const backgroundVideos = Array.from(
			document.querySelectorAll<HTMLVideoElement>(
				'.solutions-transition-media video',
			),
		)
		const previousVideoStates = backgroundVideos.map(video => ({
			video,
			muted: video.muted,
			volume: video.volume,
		}))

		document.body.style.overflow = 'hidden'
		backgroundVideos.forEach(video => {
			video.muted = true
			video.volume = 0
		})

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closePlayer()
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			previousVideoStates.forEach(({ video, muted, volume }) => {
				if (!video.isConnected) return

				video.muted = muted
				video.volume = volume
			})
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [activePlayerMedia, closePlayer])

	const sectionHeight =
		SOLUTION_CARD_TOP +
		cards.length * SOLUTION_BLOCK_HEIGHT +
		SOLUTION_TRAILING_SPACE -
		300

	return (
		<section
			ref={sectionRef}
			className='solutions-section relative z-[120] isolate -mt-20 overflow-hidden bg-black px-5 py-10 md:px-8 md:py-14 min-[1370px]:mt-[-142px] min-[1370px]:px-0 min-[1370px]:py-0 min-[1600px]:mt-[-46px]'
			style={
				{
					'--solutions-section-height': `${sectionHeight}px`,
					minHeight: `${sectionHeight}px`,
				} as CSSProperties
			}
		>
			<div
				className='solutions-inner relative mx-auto flex max-w-[1436px] flex-col min-[1370px]:block'
				style={{ height: `${sectionHeight}px` }}
			>
				<div className='solutions-heading min-[1370px]:absolute min-[1370px]:left-0 min-[1370px]:top-[40px] min-[1370px]:w-[857px]'>
					<h2 className='font-heading whitespace-pre-line text-[42px] font-bold leading-[1.08] tracking-normal text-white md:text-[56px] min-[1370px]:text-[65px] min-[1370px]:leading-[73px]'>
						{title}
					</h2>
				</div>

				<p className='solutions-description mt-10 max-w-[944px] text-[18px] font-medium leading-[1.24] text-[#C4C4C4] md:text-[21px] min-[1370px]:absolute min-[1370px]:left-0 min-[1370px]:top-[256px] min-[1370px]:mt-0 min-[1370px]:text-[23px] min-[1370px]:leading-[28px]'>
					{description}
				</p>

				{cards.map((card, index) => {
					const top = SOLUTION_CARD_TOP + index * SOLUTION_BLOCK_HEIGHT
					const imageTop =
						SOLUTION_CARD_IMAGE_TOP + index * SOLUTION_BLOCK_HEIGHT
					const isMuseumCard = index === 0
					const isTemuridsCard = index === 2
					const href = isMuseumCard
						? museumHref
						: isTemuridsCard
							? temuridsHref
							: card.href
					const videoSrc = isMuseumCard
						? MUSEUM_VIDEO_SRC
						: isTemuridsCard
							? TEMURIDS_VIDEO_SRC
							: card.videoSrc

					return (
						<div
							key={card.title}
							className='solution-item relative min-[1370px]:contents'
						>
							<SolutionCard
								card={card}
								href={href}
								className='mt-16 md:mt-20 min-[1370px]:absolute min-[1370px]:left-0 min-[1370px]:mt-0 min-[1370px]:top-[var(--solutions-card-top)]'
								style={{ '--solutions-card-top': `${top}px` } as CSSProperties}
							/>
							<div className='solution-media-slot relative z-20 mt-20 aspect-video md:mt-20 min-[1370px]:contents'>
								<TransitionExpandedGlow
									glowRef={element => {
										glowRefs.current[index] = element
									}}
								/>
								<TransitionMedia
									mediaRef={element => {
										mediaRefs.current[index] = element
									}}
									image={card.image}
									imageAlt={card.imageAlt}
									videoSrc={videoSrc}
									youtubeVideoId={card.youtubeVideoId}
									top={imageTop}
								/>
							</div>
							<div
								className='solution-scroll-spacer min-[1370px]:hidden'
								aria-hidden='true'
							/>
							<MobileLearnMoreButton href={href} label={card.cta} />
						</div>
					)
				})}

				<LearnMoreCursor
					cursorRef={cursorRef}
					label={cards[0]?.cta ?? 'Узнать больше'}
				/>
			</div>

			<SolutionVideoPlayerModal
				media={activePlayerMedia}
				onClose={closePlayer}
			/>
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
	const classNames = `solutions-card-outline relative block min-h-[560px] overflow-visible rounded-[35px] bg-black md:min-h-[600px] min-[1370px]:h-[680px] min-[1370px]:min-h-[680px] min-[1370px]:w-full ${className}`
	const content = (
		<>
			<div className='relative z-20 px-8 pt-14 md:px-[72px] md:pt-[86px] min-[1370px]:px-0 min-[1370px]:pt-0'>
				<h3 className='text-[38px] font-semibold leading-tight text-[#DE5CFF] md:text-[48px] min-[1370px]:absolute min-[1370px]:left-[121px] min-[1370px]:top-[88px] min-[1370px]:w-[760px] min-[1370px]:text-[55px] min-[1370px]:leading-[66px]'>
					{card.title}
				</h3>

				<p className='mt-10 max-w-[821px] whitespace-pre-line text-[18px] font-medium leading-[1.24] text-[#C4C4C4] md:text-[21px] min-[1370px]:absolute min-[1370px]:left-[121px] min-[1370px]:top-[204px] min-[1370px]:mt-0 min-[1370px]:text-[23px] min-[1370px]:leading-[28px]'>
					{card.description}
				</p>
			</div>

			<LearnMoreButton label={card.cta} />

			<CollapsedGlow />
		</>
	)

	if (href) {
		const isExternal = isExternalHref(href)
		const opensInNewTab = isExternal || isPdfPageHref(href)

		return (
			<a
				href={href}
				className={classNames}
				style={style}
				aria-label={`${card.cta}: ${card.title}`}
				target={opensInNewTab ? '_blank' : undefined}
				rel={opensInNewTab ? 'noopener noreferrer' : undefined}
			>
				{content}
			</a>
		)
	}

	return (
		<article className={classNames} style={style}>
			{content}
		</article>
	)
}

function MobileLearnMoreButton({
	href,
	label,
}: {
	href?: string
	label: string
}) {
	if (!href) return null

	const isExternal = isExternalHref(href)
	const opensInNewTab = isExternal || isPdfPageHref(href)

	return (
		<a
			href={href}
			className='solution-mobile-cta'
			target={opensInNewTab ? '_blank' : undefined}
			rel={opensInNewTab ? 'noopener noreferrer' : undefined}
		>
			{label}
		</a>
	)
}

function LearnMoreButton({ label }: { label: string }) {
	const circularLabel = `${label}${LEARN_MORE_SEPARATOR}${label}${LEARN_MORE_SEPARATOR}`

	return (
		<span
			aria-hidden='true'
			className='learn-more-button absolute left-[1107px] top-[160px] z-30 hidden h-[252.42px] w-[252.42px] text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0051FF] active:scale-[0.98] min-[1370px]:block'
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
						{circularLabel}
					</textPath>
				</text>
			</svg>
			<Image
				src='/images/block6/arrow.svg'
				alt=''
				width={16}
				height={16}
				className='absolute left-[118.21px] top-[118.2px] h-4 w-4'
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
	const circularLabel = `${label}${LEARN_MORE_SEPARATOR}${label}${LEARN_MORE_SEPARATOR}`

	return (
		<div
			ref={cursorRef}
			className='learn-more-cursor pointer-events-none fixed left-0 top-0 z-[500] hidden h-[252.42px] w-[252.42px] text-white'
			data-visible='false'
			style={
				{
					transform: 'translate3d(-9999px, -9999px, 0) translate(-50%, -50%)',
				} as CSSProperties
			}
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
						{circularLabel}
					</textPath>
				</text>
			</svg>
			<Image
				src='/images/block6/arrow.svg'
				alt=''
				width={16}
				height={16}
				className='absolute left-[118.21px] top-[118.2px] h-4 w-4'
			/>
		</div>
	)
}

function CollapsedGlow() {
	return (
		<div className='pointer-events-none absolute left-1/2 top-[420px] z-10 h-[870px] w-[954px] -translate-x-1/2 min-[1370px]:left-[calc(50%+5.16px)] min-[1370px]:top-[262.79px]'>
			<SolutionGlow />
		</div>
	)
}

function TransitionExpandedGlow({
	glowRef,
}: {
	glowRef: (element: HTMLDivElement | null) => void
}) {
	return (
		<div
			ref={glowRef}
			className='solutions-transition-glow pointer-events-none invisible hidden opacity-0 min-[1370px]:absolute min-[1370px]:left-0 min-[1370px]:top-0 min-[1370px]:block'
			aria-hidden='true'
		>
			<SolutionGlow />
		</div>
	)
}

function TransitionMedia({
	mediaRef,
	image,
	imageAlt,
	videoSrc,
	youtubeVideoId,
	top,
}: {
	mediaRef: (element: HTMLDivElement | null) => void
	image: string
	imageAlt: string
	videoSrc?: string
	youtubeVideoId?: string
	top: number
}) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const youtubeSrc = youtubeVideoId
		? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
		: undefined

	useGlobalVideoSound(videoRef, [videoSrc])

	return (
		<div
			ref={mediaRef}
			className='solutions-transition-media absolute inset-0 z-20 h-full w-full overflow-hidden rounded-[35px] shadow-2xl shadow-black/40 min-[1370px]:bottom-auto min-[1370px]:left-[371px] min-[1370px]:right-auto min-[1370px]:top-[var(--solutions-media-top)] min-[1370px]:mt-0 min-[1370px]:h-[391px] min-[1370px]:w-[694px]'
			style={{ '--solutions-media-top': `${top}px` } as CSSProperties}
		>
			{youtubeSrc ? (
				<iframe
					key={youtubeVideoId}
					className='pointer-events-none h-full w-full'
					src={youtubeSrc}
					title={imageAlt}
					allow='autoplay; encrypted-media; picture-in-picture; web-share'
					allowFullScreen
				/>
			) : videoSrc ? (
				<LazyVideo
					ref={videoRef}
					key={videoSrc}
					className='h-full w-full object-cover'
					aria-label={imageAlt}
					autoPlay
					loop
					playsInline
					preload='metadata'
					poster={image}
					disablePictureInPicture
					sourceSrc={videoSrc}
				/>
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

function SolutionVideoPlayerModal({
	media,
	onClose,
}: {
	media: SolutionPlayerMedia | null
	onClose: () => void
}) {
	if (!media) return null

	const youtubeModalSrc = media.youtubeVideoId
		? `https://www.youtube.com/embed/${media.youtubeVideoId}?autoplay=1&controls=1&playsinline=1&rel=0&modestbranding=1`
		: undefined

	return (
		<div
			className='fixed inset-0 z-[1000] flex items-center justify-center bg-black/72 px-4 py-8 backdrop-blur-[2px] md:px-8'
			role='dialog'
			aria-modal='true'
			aria-label={media.imageAlt}
			onClick={onClose}
		>
			<div
				className='relative w-full max-w-[1490px] overflow-hidden rounded-[24px] bg-black shadow-[0_30px_90px_rgba(0,0,0,0.65)] md:w-[82vw] lg:rounded-[35px]'
				onClick={event => event.stopPropagation()}
			>
				<button
					type='button'
					className='absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black transition hover:scale-105 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-5 md:top-5 md:h-14 md:w-14'
					aria-label='Закрыть видео'
					onClick={onClose}
				>
					<svg
						viewBox='0 0 24 24'
						className='h-8 w-8 md:h-10 md:w-10'
						fill='none'
						aria-hidden='true'
					>
						<path
							d='M5 5L19 19M19 5L5 19'
							stroke='currentColor'
							strokeWidth='2.4'
							strokeLinecap='round'
						/>
					</svg>
				</button>

				<div className='aspect-video w-full bg-black'>
					{youtubeModalSrc ? (
						<iframe
							key={media.youtubeVideoId}
							className='h-full w-full'
							src={youtubeModalSrc}
							title={media.imageAlt}
							data-manual-sound='true'
							allow='autoplay; encrypted-media; picture-in-picture; web-share'
							allowFullScreen
						/>
					) : media.videoSrc ? (
						<LazyVideo
							key={media.videoSrc}
							className='h-full w-full object-cover'
							aria-label={media.imageAlt}
							data-manual-sound='true'
							autoPlay
							controls
							playsInline
							preload='auto'
							poster={media.image}
							sourceSrc={media.videoSrc}
							eager
						/>
					) : (
						<FadeInImage
							src={media.image}
							alt={media.imageAlt}
							fill
							sizes='min(1490px, 82vw)'
							className='object-cover'
							unoptimized
						/>
					)}
				</div>
			</div>
		</div>
	)
}

function SolutionGlow() {
	return (
		<div className='solutions-glow solutions-glow-collapsed' aria-hidden='true'>
			<span className='solutions-glow-ellipse solutions-glow-collapsed-blue' />
			<span className='solutions-glow-ellipse solutions-glow-collapsed-yellow' />
			<span className='solutions-glow-ellipse solutions-glow-collapsed-pink' />
		</div>
	)
}
