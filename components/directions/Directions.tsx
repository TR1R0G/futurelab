'use client'

import { CTACard } from '@/components/infrastructure/CTACard'
import { ExpandedImageScreen } from '@/components/media/ExpandedImageScreen'
import { LazyVideo } from '@/components/media/LazyVideo'
import { registerGsapPlugins, ScrollTrigger } from '@/lib/gsap'
import type { DirectionsContent, Language } from '@/lib/mdx'
import { useEffect, useRef } from 'react'
import { DirectionsLight } from './DirectionsLight'

interface DirectionsProps {
	title: string
	chips: DirectionsContent['chips']
	statement: DirectionsContent['statement']
	ctaText: string
	ctaButton: string
	language: Language
}

const directionGradients = {
	primary:
		'linear-gradient(90deg, #4B0E5B 0%, #A91E83 23%, #FD9A34 58%, #F9EB44 100%)',
	secondary:
		'linear-gradient(90deg, #4B0E5B 0%, #A91E83 22%, #FD9A34 58%, #F9EB44 100%)',
} as const

const DIRECTIONS_CANVAS_WIDTH = 696
const DIRECTIONS_CANVAS_HEIGHT = 256
const DIRECTIONS_NARROW_CANVAS_WIDTH = 430
const DIRECTIONS_NARROW_CANVAS_HEIGHT = 390
const DIRECTIONS_ULTRA_NARROW_CANVAS_HEIGHT = 780
const DIRECTIONS_DESKTOP_BOARD_HEIGHT = 340
const DIRECTIONS_CANVAS_TOP = 70
const DIRECTIONS_CANVAS_RIGHT = -14
const DIRECTIONS_CANVAS_VISUAL_TOP = 16
const DIRECTIONS_CANVAS_VISUAL_HEIGHT =
	DIRECTIONS_CANVAS_HEIGHT - DIRECTIONS_CANVAS_VISUAL_TOP
const DIRECTIONS_CANONICAL_FONT_SIZE = 13.44
const DIRECTIONS_MIN_VISUAL_FONT_SIZE = 10
const DIRECTIONS_NARROW_MIN_VISUAL_FONT_SIZE = 8.5
const DIRECTIONS_RESPONSIVE_PROPERTIES = [
	'--directions-chip-scale',
	'--directions-chip-canvas-width',
	'--directions-chip-canvas-height',
	'--directions-responsive-board-height',
	'--directions-chip-canvas-top',
	'--directions-chip-canvas-right',
	'--directions-chip-mobile-top',
	'--directions-chip-mobile-height',
	'--directions-responsive-font-size',
] as const

export function Directions({
	title,
	chips,
	statement,
	ctaText,
	ctaButton,
	language,
}: DirectionsProps) {
	const academyVideoSrc =
		language === 'en'
			? '/videos/academy/academy-en.mp4'
			: '/videos/academy/academy-ru.mp4'
	const compactStatement = `${statement.inlineBefore} ${statement.inlineAfter}`
	const boardCardRef = useRef<HTMLDivElement>(null)
	const chipViewportRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const boardCard = boardCardRef.current
		const chipViewport = chipViewportRef.current
		if (!boardCard || !chipViewport) return

		registerGsapPlugins()

		let updateFrame = 0
		let refreshTimer = 0
		let previousScale = -1
		let previousMobile = false
		let previousNarrow = false
		let previousUltraNarrow = false

		const clearResponsiveProperties = () => {
			DIRECTIONS_RESPONSIVE_PROPERTIES.forEach(property =>
				boardCard.style.removeProperty(property),
			)
		}

		const scheduleRefresh = () => {
			window.clearTimeout(refreshTimer)
			refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 80)
		}

		const updateResponsiveCanvas = () => {
			const isResponsive = window.matchMedia('(max-width: 1279px)').matches
			if (!isResponsive) {
				if (previousScale !== -1) {
					clearResponsiveProperties()
					previousScale = -1
					scheduleRefresh()
				}
				return
			}

			const viewportWidth = chipViewport.clientWidth
			if (viewportWidth <= 0) return

			const isMobile = window.matchMedia('(max-width: 844px)').matches
			const isNarrow = window.matchMedia('(max-width: 456px)').matches
			const isUltraNarrow = window.matchMedia('(max-width: 319px)').matches
			const canvasWidth = isNarrow
				? DIRECTIONS_NARROW_CANVAS_WIDTH
				: DIRECTIONS_CANVAS_WIDTH
			const canvasHeight = isUltraNarrow
				? DIRECTIONS_ULTRA_NARROW_CANVAS_HEIGHT
				: isNarrow
					? DIRECTIONS_NARROW_CANVAS_HEIGHT
					: DIRECTIONS_CANVAS_HEIGHT
			const canvasVisualTop = isNarrow
				? 0
				: DIRECTIONS_CANVAS_VISUAL_TOP
			const canvasVisualHeight = isUltraNarrow
				? DIRECTIONS_ULTRA_NARROW_CANVAS_HEIGHT
				: isNarrow
					? DIRECTIONS_NARROW_CANVAS_HEIGHT
					: DIRECTIONS_CANVAS_VISUAL_HEIGHT
			const canonicalFontSize = isNarrow
				? 14.5
				: DIRECTIONS_CANONICAL_FONT_SIZE
			const scale = Math.min(1, viewportWidth / canvasWidth)

			if (
				Math.abs(scale - previousScale) < 0.001 &&
				isMobile === previousMobile &&
				isNarrow === previousNarrow &&
				isUltraNarrow === previousUltraNarrow
			) {
				return
			}

			const minimumVisualFontSize = Math.min(
				DIRECTIONS_MIN_VISUAL_FONT_SIZE,
				Math.max(
					DIRECTIONS_NARROW_MIN_VISUAL_FONT_SIZE,
					window.innerWidth / 60,
				),
			)
			const responsiveFontSize = Math.max(
				canonicalFontSize,
				minimumVisualFontSize / scale,
			)

			boardCard.style.setProperty(
				'--directions-chip-canvas-width',
				`${canvasWidth}px`,
			)
			boardCard.style.setProperty(
				'--directions-chip-canvas-height',
				`${canvasHeight}px`,
			)
			boardCard.style.setProperty(
				'--directions-chip-scale',
				scale.toFixed(5),
			)
			boardCard.style.setProperty(
				'--directions-responsive-board-height',
				`${DIRECTIONS_DESKTOP_BOARD_HEIGHT * scale}px`,
			)
			boardCard.style.setProperty(
				'--directions-chip-canvas-top',
				`${DIRECTIONS_CANVAS_TOP * scale}px`,
			)
			boardCard.style.setProperty(
				'--directions-chip-canvas-right',
				`${DIRECTIONS_CANVAS_RIGHT * scale}px`,
			)
			boardCard.style.setProperty(
				'--directions-chip-mobile-top',
				`${-canvasVisualTop * scale}px`,
			)
			boardCard.style.setProperty(
				'--directions-chip-mobile-height',
				`${canvasVisualHeight * scale}px`,
			)
			boardCard.style.setProperty(
				'--directions-responsive-font-size',
				`${responsiveFontSize}px`,
			)

			previousScale = scale
			previousMobile = isMobile
			previousNarrow = isNarrow
			previousUltraNarrow = isUltraNarrow
			scheduleRefresh()
		}

		const scheduleUpdate = () => {
			window.cancelAnimationFrame(updateFrame)
			updateFrame = window.requestAnimationFrame(updateResponsiveCanvas)
		}

		const resizeObserver = new ResizeObserver(scheduleUpdate)
		resizeObserver.observe(chipViewport)
		window.addEventListener('orientationchange', scheduleUpdate)
		void document.fonts.ready.then(scheduleUpdate)
		scheduleUpdate()

		return () => {
			resizeObserver.disconnect()
			window.removeEventListener('orientationchange', scheduleUpdate)
			window.cancelAnimationFrame(updateFrame)
			window.clearTimeout(refreshTimer)
			clearResponsiveProperties()
		}
	}, [])

	return (
		<section className='directions-section relative z-[80] isolate overflow-visible bg-black px-5 pb-28 pt-6 md:px-8 md:pb-36 md:pt-8 min-[960px]:pt-40 lg:pb-44 lg:pt-52 xl:pt-36 min-[1600px]:pt-[380px]'>
			<div className='directions-board relative mx-auto h-auto max-w-[1436px] overflow-visible'>
				<div
					className='directions-board-gradient pointer-events-none absolute left-0 top-[7px] h-[391px] w-full rounded-[35px]'
					style={{
						backgroundImage:
							'linear-gradient(30.47874796640454deg, rgb(75, 14, 91) 2.4712%, rgb(169, 30, 131) 18.71%, rgb(253, 154, 52) 44.047%, rgb(249, 235, 68) 68.37%)',
					}}
					aria-hidden='true'
				/>
				<div
					ref={boardCardRef}
					className='directions-board-card relative min-h-[420px] overflow-visible rounded-[35px] bg-[#1D1D1D] p-8'
				>
					<h2 className='directions-board-title project-mini-heading relative z-10 text-[30px] font-semibold leading-none text-white'>
						{title}
					</h2>

					<div
						ref={chipViewportRef}
						className='directions-chip-viewport'
					>
						<div className='directions-chip-canvas'>
							<div className='directions-chip-layer z-10'>
								{chips.map(chip => (
									<div
										key={chip.id}
										className={`directions-chip-slot directions-chip-slot--${chip.id}`}
									>
										<DirectionChip chip={chip} />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className='directions-statement sticky top-[12svh] isolate mx-auto mt-12 max-w-[1436px] text-center md:mt-16 min-[960px]:mt-44 lg:mt-52'>
				<DirectionsLight className='left-1/2 top-[calc(38svh_-_377.84px)] z-0 block max-[719px]:left-[calc(50%_-_32px)] max-[719px]:top-[33px] max-[719px]:[--directions-light-blur:75px] max-[719px]:[--directions-light-scale:.447] min-[720px]:max-[959px]:[--directions-light-blur:100px] min-[720px]:max-[959px]:[--directions-light-scale:.72] min-[960px]:[--directions-light-scale:1]' />

				<div className='directions-statement-copy relative isolate z-10 text-[32px] font-semibold leading-[1.18] tracking-normal text-white md:text-[37px] md:leading-[1.24] min-[960px]:max-[1369px]:text-[clamp(31px,3.3vw,44px)] min-[960px]:max-[1369px]:leading-[1.42] min-[1370px]:text-[55px] min-[1370px]:leading-[78px]'>
					<div className='directions-statement-desktop hidden min-[960px]:block'>
						<p className='directions-statement-text'>
							<span data-directions-inline-before>{statement.inlineBefore}</span>{' '}
							<span className='directions-inline-image relative z-20 inline-flex h-[91px] w-[52px] overflow-hidden rounded-[8px] align-middle shadow-[0_10px_34px_rgba(0,0,0,0.45)]'>
								<AcademyInlineVideo
									poster={statement.imageSrc}
									videoSrc={academyVideoSrc}
								/>
							</span>{' '}
							<span data-directions-inline-after>{statement.inlineAfter}</span>
						</p>
					</div>

					<div className='directions-statement-compact min-[960px]:hidden'>
						<p className='directions-statement-text'>{compactStatement}</p>

						<div className='mt-9 flex justify-center md:mt-12'>
							<span className='directions-inline-image relative z-20 inline-flex overflow-hidden rounded-[8px] shadow-[0_10px_34px_rgba(0,0,0,0.45)]'>
								<AcademyInlineVideo
									poster={statement.imageSrc}
									videoSrc={academyVideoSrc}
									className='h-[92px] w-[52px] md:h-[132px] md:w-[76px]'
								/>
							</span>
						</div>
					</div>
				</div>
			</div>

			<ExpandedImageScreen
				src={statement.imageSrc}
				videoSrc={academyVideoSrc}
				alt={statement.imageAlt}
				className='-mt-[40svh]'
				movingTextSelector='.directions-statement-copy'
				fadingElementSelector='.directions-statement > .directions-statement-light'
				sourceSelector='.directions-inline-image'
				showGradient={false}
			/>

			<div className='directions-post-image relative z-[200] isolate flex min-h-[40svh] flex-col justify-start overflow-hidden'>
				<div
					className='pointer-events-none absolute inset-0 z-0'
					aria-hidden='true'
				/>
				<div
					className='pointer-events-none absolute inset-x-[-20px] top-[-24svh] z-0 h-[80svh]  md:inset-x-[-32px]'
					aria-hidden='true'
				/>
				<div
					className='pointer-events-none absolute inset-x-0 bottom-[-60svh] z-0 h-[60svh] '
					aria-hidden='true'
				/>
				<div className='directions-cta-wrapper relative z-10 w-full'>
					<CTACard
						variant='wide'
						text={ctaText}
						buttonText={ctaButton}
						href='https://creativetech.uz/'
					/>
				</div>

				<div
					className='directions-post-image-divider relative z-10 mx-auto h-1 w-[calc(100%_-_40px)] max-w-[1436px] rounded-sm bg-[linear-gradient(90deg,#4B0E5B_0%,#A91E83_29.9%,#FD9A34_65.67%,#F9EB44_100%)] md:w-[calc(100%_-_64px)]'
					aria-hidden='true'
				/>
			</div>
		</section>
	)
}

function AcademyInlineVideo({
	poster,
	videoSrc,
	className = 'h-full w-full',
}: {
	poster: string
	videoSrc: string
	className?: string
}) {
	const videoRef = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		void video.play().catch(() => undefined)
	}, [videoSrc])

	return (
		<LazyVideo
			ref={videoRef}
			className={`${className} block object-cover`}
			aria-hidden='true'
			autoPlay
			data-manual-sound='true'
			disablePictureInPicture
			loop
			muted
			playsInline
			poster={poster}
			preload='metadata'
			sourceSrc={videoSrc}
		/>
	)
}

function DirectionChip({
	chip,
	className = 'w-full',
}: {
	chip: DirectionsContent['chips'][number]
	className?: string
}) {
	const baseClass =
		'directions-chip flex min-h-[64px] w-full items-center justify-center rounded-full px-7 py-[14px] text-center text-[20px] font-medium leading-[1.15] md:min-h-[73px] md:rounded-[36.5px] md:text-[23px]'

	if (chip.variant === 'gradient') {
		return (
			<div
				className={`${baseClass} ${className} text-black`}
				style={{
					backgroundImage:
						directionGradients[chip.gradient ?? 'primary'],
				}}
			>
				{chip.label}
			</div>
		)
	}

	if (chip.variant === 'outline') {
		return (
			<div
				className={`${baseClass} ${className} border-2 border-[#EBEBEB] bg-[#1D1D1D] text-[#EBEBEB]`}
			>
				{chip.label}
			</div>
		)
	}

	return (
		<div className={`${baseClass} ${className} bg-[#F2F3F7] text-[#4C4C4C]`}>
			{chip.label}
		</div>
	)
}
