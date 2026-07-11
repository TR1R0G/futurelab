'use client'

import { DirectionsLight } from '@/components/directions/DirectionsLight'
import { FadeInImage } from '@/components/media/FadeInImage'
import { useGlobalVideoSound } from '@/components/providers/SoundProvider'
import { gsap, registerGsapPlugins } from '@/lib/gsap'
import { useEffect, useRef } from 'react'

interface ExpandedImageScreenProps {
	src: string
	alt: string
	videoSrc?: string
	className?: string
	movingTextSelector?: string
	fadingElementSelector?: string
	sourceSelector?: string
}

export function ExpandedImageScreen({
	src,
	alt,
	videoSrc,
	className = '',
	movingTextSelector,
	fadingElementSelector,
	sourceSelector,
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
		if (!section || !stage || !frame || !gradient) return

		const positionEase = gsap.parseEase('power2.inOut')
		const fullSizeAt = 0.82
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

		const readTargetRect = () => {
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
				top: Math.max(32, Math.round((window.innerHeight - height) / 2)),
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

			const placeFrameAtSource = () => {
				startRect = readSourceRect()
				hasStartRect = true
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
					return
				}

				const sectionTop = sectionRect.top + window.scrollY
				const scrollDelta = window.scrollY - sectionTop

				if (scrollDelta < 0) {
					gsap.set(getSourceElements(), { opacity: 1 })
					gsap.set(frame, { autoAlpha: 0 })
					if (movingText) {
						gsap.set(movingText, { y: 0, opacity: 1 })
					}
					gsap.set(fadingElements, { opacity: 1 })
					gsap.set(gradient, { opacity: 1, scale: 1 })
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
					gsap.set(fadingElements, { opacity: 1 })
					gsap.set(gradient, { opacity: 1, scale: 1 })
					return
				}

				if (!hasStartRect) {
					startRect = readSourceRect()
					hasStartRect = true
				}

				const imageProgress = clamp(imageScrollProgress / fullSizeAt)
				const easedProgress = positionEase(imageProgress)
				const rect = mixRect(startRect, target, easedProgress)

				gsap.set(getSourceElements(), { opacity: 0 })
				gsap.set(frame, {
					...rect,
					autoAlpha: 1,
					borderRadius: mix(12, 35, easedProgress),
				})

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
						opacity: mix(1, 0.16, fadeProgress),
					})
					gsap.set(fadingElements, {
						opacity: mix(1, 0, fadeProgress),
					})
				}

				gsap.set(gradient, {
					opacity: 1,
					scale: 1,
				})
				ensureVideoPlayback()
			}

			const requestUpdate = () => {
				if (frameId) return
				frameId = window.requestAnimationFrame(update)
			}

			const handleResize = () => {
				hasStartRect = false
				placeFrameAtSource()
				requestUpdate()
			}

			gsap.set(frame, {
				force3D: true,
				willChange: 'left, top, width, height, border-radius, opacity',
			})

			placeFrameAtSource()
			update()

			window.addEventListener('scroll', requestUpdate, { passive: true })
			window.addEventListener('resize', handleResize)

			return () => {
				if (frameId) window.cancelAnimationFrame(frameId)
				window.removeEventListener('scroll', requestUpdate)
				window.removeEventListener('resize', handleResize)
			}
		}, section)

		return () => {
			ctx.revert()
		}
	}, [fadingElementSelector, movingTextSelector, sourceSelector])

	return (
		<section
			ref={sectionRef}
			className={`expanded-image-section relative z-[90] ml-[calc(50%_-_50vw)] h-[300svh] w-screen bg-transparent ${className}`}
		>
			<div
				ref={stageRef}
				className='expanded-image-stage sticky top-0 h-[100svh] overflow-hidden bg-transparent'
			>
				<div
					ref={gradientRef}
					className='video-gradient-field absolute inset-0'
				>
					<DirectionsLight className='expanded-image-light left-1/2 top-[calc(50%_-_377.84px)] hidden lg:block' />
				</div>

				<div
					ref={frameRef}
					className='absolute z-10 h-[min(86svh,928px)] w-[min(85vw,calc(min(86svh,928px)*0.57112))] overflow-hidden rounded-[35px] opacity-0 shadow-2xl shadow-black/45'
				>
					{videoSrc ? (
						<video
							ref={videoRef}
							key={videoSrc}
							className='h-full w-full object-cover'
							aria-label={alt}
							autoPlay
							loop
							playsInline
							preload='auto'
							poster={src}
							disablePictureInPicture
						>
							<source src={videoSrc} type='video/mp4' />
						</video>
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
