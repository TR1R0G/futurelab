'use client'

import { DirectionsLight } from '@/components/directions/DirectionsLight'
import { FadeInImage } from '@/components/media/FadeInImage'
import { LazyVideo } from '@/components/media/LazyVideo'
import { useGlobalVideoSound } from '@/components/providers/SoundProvider'
import { ScrollTrigger, gsap, registerGsapPlugins } from '@/lib/gsap'
import { useEffect, useRef } from 'react'

interface ExpandedImageScreenProps {
	src: string
	alt: string
	videoSrc?: string
	className?: string
	movingTextSelector?: string
	fadingElementSelector?: string
	sourceSelector?: string
	showGradient?: boolean
}

export function ExpandedImageScreen({
	src,
	alt,
	videoSrc,
	className = '',
	movingTextSelector,
	fadingElementSelector,
	sourceSelector,
	showGradient = true,
}: ExpandedImageScreenProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const stageRef = useRef<HTMLDivElement>(null)
	const frameRef = useRef<HTMLDivElement>(null)
	const gradientRef = useRef<HTMLDivElement>(null)
	const videoRef = useRef<HTMLVideoElement>(null)

	useGlobalVideoSound(videoRef, [videoSrc])

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		void video.play().catch(() => undefined)
	}, [videoSrc])

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		const stage = stageRef.current
		const frame = frameRef.current
		const gradient = gradientRef.current
		if (!section || !stage || !frame) return

		const positionEase = gsap.parseEase('power2.inOut')
		const previousFullSizeAt = 0.82
		const fullSizeAt = 1
		const previousScrollableViewportCount = 2
		const requiredScrollViewportCount =
			previousScrollableViewportCount * previousFullSizeAt
		const gradientExitStart = 0.92
		const imageScrollRangeMultiplier = 2.5
		const clamp = (value: number) => Math.min(1, Math.max(0, value))
		const isRectInViewport = (rect: DOMRect) =>
			rect.bottom > 0 &&
			rect.top < window.innerHeight &&
			rect.right > 0 &&
			rect.left < window.innerWidth

		const getSourceElements = () =>
			sourceSelector
				? Array.from(document.querySelectorAll<HTMLElement>(sourceSelector))
				: []

		const getVisibleSourceElement = () =>
			getSourceElements().find(source => {
				const rect = source.getBoundingClientRect()
				return rect.width > 0 && rect.height > 0
			}) ?? null

		const toStageRect = (rect: {
			left: number
			top: number
			width: number
			height: number
		}) => {
			const stageRect = stage.getBoundingClientRect()

			return {
				left: rect.left - stageRect.left,
				top: rect.top - stageRect.top,
				width: rect.width,
				height: rect.height,
			}
		}

		const ensureVideoPlayback = () => {
			const video = videoRef.current
			if (!video || !video.paused) return

			const shouldRestoreAudio = !video.muted && video.volume > 0
			video.muted = true
			video.volume = 0

			void video
				.play()
				.then(() => {
					if (!shouldRestoreAudio) return

					video.muted = false
					video.volume = 1
				})
				.catch(() => undefined)
		}

		const readSourceRect = () => {
			const source = getVisibleSourceElement()
			const rect = source?.getBoundingClientRect()

			if (rect && rect.width > 0 && rect.height > 0) {
				return toStageRect({
					left: rect.left,
					top: rect.top,
					width: rect.width,
					height: rect.height,
				})
			}

			const target = readTargetRect()
			return {
				left: target.left + target.width / 2,
				top: target.top + target.height / 2,
				width: Math.max(42, target.width * 0.1),
				height: Math.max(64, target.height * 0.1),
			}
		}

		const mix = (start: number, end: number, progress: number) =>
			start + (end - start) * progress

		const mixRect = (
			start: ReturnType<typeof readTargetRect>,
			end: ReturnType<typeof readTargetRect>,
			progress: number,
		) => ({
			left: mix(start.left, end.left, progress),
			top: mix(start.top, end.top, progress),
			width: mix(start.width, end.width, progress),
			height: mix(start.height, end.height, progress),
		})

		const readMediaAspectRatio = () => {
			const video = videoRef.current
			if (video?.videoWidth && video.videoHeight) {
				return video.videoWidth / video.videoHeight
			}

			const source = getVisibleSourceElement()
			const sourceRect = source?.getBoundingClientRect()
			if (sourceRect && sourceRect.width > 0 && sourceRect.height > 0) {
				return sourceRect.width / sourceRect.height
			}

			return 530 / 928
		}

		const readTargetRect = () => {
			if (window.innerWidth < 720) {
				const horizontalInset = 20
				const verticalInset = 20
				const aspectRatio = readMediaAspectRatio()
				const maxWidth = Math.max(1, window.innerWidth - horizontalInset * 2)
				const maxHeight = Math.max(1, window.innerHeight - verticalInset * 2)
				let width = maxWidth
				let height = width / aspectRatio

				if (height > maxHeight) {
					height = maxHeight
					width = height * aspectRatio
				}

				return {
					left: Math.round((window.innerWidth - width) / 2),
					top: Math.max(0, Math.round(window.innerHeight - height)),
					width: Math.round(width),
					height: Math.round(height),
				}
			}

			const visualGroupWidth = 1013.91
			const visualGroupHeight = 946.61
			const visualScale = Math.min(
				1,
				(window.innerWidth * 0.9) / visualGroupWidth,
				(window.innerHeight * 0.92) / visualGroupHeight,
			)
			const width = Math.round(530 * visualScale)
			const height = Math.round(928 * visualScale)

			return {
				left: Math.round((window.innerWidth - width) / 2),
				top: Math.max(0, Math.round(window.innerHeight - height)),
				width,
				height,
			}
		}

		const ctx = gsap.context(() => {
			const movingText = movingTextSelector
				? document.querySelector<HTMLElement>(movingTextSelector)
				: null
			const fadingElements = fadingElementSelector
				? Array.from(
						document.querySelectorAll<HTMLElement>(fadingElementSelector),
					)
				: []
			let frameId = 0
			let startRect = readSourceRect()
			let hasStartRect = false
			let lastScrollY = window.scrollY
			let lastFrameTop: number | null = null

			const syncSectionHeight = () => {
				const viewportHeight = window.innerHeight
				const animationScrollDistance =
					viewportHeight * requiredScrollViewportCount

				section.style.setProperty(
					'--expanded-image-section-height',
					`${Math.round(viewportHeight + animationScrollDistance)}px`,
				)
			}

			const resetGradient = (autoAlpha = 0) => {
				if (!gradient) return

				gsap.set(gradient, {
					autoAlpha,
					x: 0,
					y: 0,
					scale: 1,
					clearProps: autoAlpha === 0 ? 'zIndex,position' : undefined,
				})
			}

			const placeFrameAtSource = () => {
				startRect = readSourceRect()
				hasStartRect = true
				lastFrameTop = startRect.top
				gsap.set(getSourceElements(), { opacity: 0 })
				gsap.set(frame, {
					...startRect,
					autoAlpha: 1,
					borderRadius: 8,
				})
				ensureVideoPlayback()
			}

			const update = () => {
				frameId = 0

				const sectionRect = section.getBoundingClientRect()
				const sourceElement = getVisibleSourceElement()
				const sourceRect = sourceElement?.getBoundingClientRect()
				const isAnimationVisible =
					(sectionRect.bottom > 0 && sectionRect.top < window.innerHeight) ||
					(sourceRect ? isRectInViewport(sourceRect) : false)

				if (!isAnimationVisible) {
					gsap.set(getSourceElements(), { opacity: 1 })
					gsap.set(frame, { autoAlpha: 0 })
					hasStartRect = false
					lastFrameTop = null
					lastScrollY = window.scrollY
					resetGradient(0)
					return
				}

				const sectionTop = sectionRect.top + window.scrollY
				const scrollDelta = window.scrollY - sectionTop

				if (scrollDelta < 0) {
					gsap.set(getSourceElements(), { opacity: 1 })
					gsap.set(frame, { autoAlpha: 0 })
					hasStartRect = false
					lastFrameTop = null
					lastScrollY = window.scrollY
					if (movingText) {
						gsap.set(movingText, { y: 0, opacity: 1 })
					}
					gsap.set(fadingElements, { autoAlpha: 1 })
					resetGradient(0)
					return
				}

				const maxScroll = Math.max(1, section.offsetHeight - window.innerHeight)
				const baseMaxScroll = Math.max(
					1,
					maxScroll / imageScrollRangeMultiplier,
				)
				const progress = clamp(scrollDelta / baseMaxScroll)
				const imageScrollProgress = clamp(scrollDelta / maxScroll)
				const target = readTargetRect()

				if (progress <= 0.001) {
					placeFrameAtSource()
					if (movingText) {
						gsap.set(movingText, { y: 0, opacity: 1 })
					}
					gsap.set(fadingElements, { autoAlpha: 1 })
					resetGradient(1)
					return
				}

				if (!hasStartRect) {
					startRect = readSourceRect()
					hasStartRect = true
				}

				const imageProgress = clamp(imageScrollProgress / fullSizeAt)
				const gradientExitProgress = clamp(
					(imageScrollProgress - gradientExitStart) / (1 - gradientExitStart),
				)
				if (imageProgress < 0.12) {
					const currentSourceRect = readSourceRect()
					startRect = {
						...currentSourceRect,
						top: Math.max(startRect.top, currentSourceRect.top),
					}
				}
				const easedProgress = positionEase(imageProgress)
				const rect = mixRect(startRect, target, easedProgress)
				const scrollingDown = window.scrollY >= lastScrollY
				const topLockProgress = clamp((imageProgress - 0.12) / 0.16)
				const lockedTop =
					scrollingDown && lastFrameTop != null
						? Math.max(rect.top, lastFrameTop)
						: rect.top
				const nextRect = {
					...rect,
					top: mix(lockedTop, rect.top, topLockProgress),
				}

				gsap.set(getSourceElements(), { opacity: 0 })
				gsap.set(frame, {
					...nextRect,
					autoAlpha: 1,
					borderRadius: mix(12, 35, easedProgress),
				})
				lastFrameTop = nextRect.top
				lastScrollY = window.scrollY

				if (movingText) {
					const firstPhase = clamp(progress / 0.42)
					const secondPhase = clamp((progress - 0.42) / 0.5)
					const fadeProgress = positionEase(secondPhase)
					const textY = mix(
						mix(0, -window.innerHeight * 0.08, positionEase(firstPhase)),
						-window.innerHeight * 0.78,
						fadeProgress,
					)

					gsap.set(movingText, {
						y: textY,
						opacity: 1,
					})
					gsap.set(fadingElements, {
						autoAlpha: mix(1, 0, gradientExitProgress),
					})
				}

				if (gradient) {
					const targetCenterX = target.left + target.width / 2
					const targetCenterY = target.top + target.height / 2
					const frameCenterX = nextRect.left + nextRect.width / 2
					const frameCenterY = nextRect.top + nextRect.height / 2
					const followX = frameCenterX - targetCenterX
					const followY = frameCenterY - targetCenterY
					const initialGradientScale = Math.max(
						0.36,
						Math.min(
							1,
							startRect.width / target.width,
							startRect.height / target.height,
						),
					)
					const releaseEase = positionEase(gradientExitProgress)

					if (gradientExitProgress >= 0.999) {
						resetGradient(0)
					} else {
						gsap.set(gradient, {
							autoAlpha: mix(1, 0, gradientExitProgress),
							x: mix(followX, 0, easedProgress),
							y:
								mix(followY, 0, easedProgress) +
								mix(0, -window.innerHeight * 0.35, releaseEase),
							scale: mix(initialGradientScale, 1, easedProgress),
						})
					}
				}
				ensureVideoPlayback()
			}

			const requestUpdate = () => {
				if (frameId) return
				frameId = window.requestAnimationFrame(update)
			}

			const handleResize = () => {
				syncSectionHeight()
				hasStartRect = false
				placeFrameAtSource()
				requestUpdate()
			}

			const video = videoRef.current
			const refreshOnReady = () => {
				syncSectionHeight()
				requestUpdate()
				ScrollTrigger.refresh()
			}

			syncSectionHeight()

			gsap.set(frame, {
				force3D: true,
				willChange: 'left, top, width, height, border-radius, opacity',
			})

			placeFrameAtSource()
			update()

			window.addEventListener('scroll', requestUpdate, { passive: true })
			window.addEventListener('resize', handleResize)
			window.addEventListener('orientationchange', handleResize)
			ScrollTrigger.addEventListener('refreshInit', syncSectionHeight)
			video?.addEventListener('loadedmetadata', refreshOnReady)
			video?.addEventListener('loadeddata', refreshOnReady)
			void document.fonts?.ready.then(refreshOnReady)

			return () => {
				if (frameId) window.cancelAnimationFrame(frameId)
				window.removeEventListener('scroll', requestUpdate)
				window.removeEventListener('resize', handleResize)
				window.removeEventListener('orientationchange', handleResize)
				ScrollTrigger.removeEventListener('refreshInit', syncSectionHeight)
				video?.removeEventListener('loadedmetadata', refreshOnReady)
				video?.removeEventListener('loadeddata', refreshOnReady)
				section.style.removeProperty('--expanded-image-section-height')
				resetGradient(0)
			}
		}, section)

		return () => {
			ctx.revert()
		}
	}, [fadingElementSelector, movingTextSelector, sourceSelector])

	return (
		<section
			ref={sectionRef}
			className={`expanded-image-section relative z-[90] ml-[calc(50%_-_50vw)] h-[var(--expanded-image-section-height,264svh)] w-screen bg-transparent ${className}`}
		>
			<div
				ref={stageRef}
				className='expanded-image-stage sticky top-0 h-[100svh] overflow-hidden bg-transparent'
			>
				{showGradient ? (
					<div
						ref={gradientRef}
						className='video-gradient-field absolute inset-0'
					>
						<DirectionsLight className='expanded-image-light left-1/2 top-[calc(50%_-_377.84px)] block max-[719px]:[--directions-light-scale:.46] min-[720px]:max-[959px]:[--directions-light-scale:.72] min-[960px]:[--directions-light-scale:1]' />
					</div>
				) : null}

				<div
					ref={frameRef}
					className='absolute z-10 h-[min(86svh,928px)] w-[min(85vw,calc(min(86svh,928px)*0.57112))] overflow-hidden rounded-[35px] opacity-0 shadow-2xl shadow-black/45'
				>
					{videoSrc ? (
						<LazyVideo
							ref={videoRef}
							key={videoSrc}
							className='h-full w-full object-cover'
							aria-label={alt}
							autoPlay
							loop
							playsInline
							preload='metadata'
							poster={src}
							disablePictureInPicture
							sourceSrc={videoSrc}
						/>
					) : (
						<FadeInImage
							src={src}
							alt={alt}
							fill
							className='object-cover'
							sizes='85vw'
							unoptimized
						/>
					)}
				</div>
			</div>
		</section>
	)
}
