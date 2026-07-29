'use client'

import { FadeInImage } from '@/components/media/FadeInImage'
import { gsap, registerGsapPlugins } from '@/lib/gsap'
import { useEffect, useMemo, useRef, useState } from 'react'

const GALLERY_GAP = 20
const MOBILE_GALLERY_GAP = 16
const MOBILE_SIDE_PADDING = 20
const GALLERY_FRAME_HEIGHT = 396
const GALLERY_LANDSCAPE_WIDTH = 552

const carouselPath = (path: string) => encodeURI(path)

const gallerySourceItems = [
	{
		id: 'futurelab-main-space',
		src: carouselPath('/images/block4/carousel/Shourum.jpeg'),
		alt: 'Современное пространство FutureLab для обучения, встреч и разработки digital-проектов',
		width: 552,
		position: '50% 50%',
	},
	{
		id: 'futurelab-space-vertical-1',
		src: carouselPath('/images/block4/carousel/Вертикальные/IMG_3752.JPG'),
		alt: 'Вертикальное фото пространства FutureLab',
		width: 306,
		position: '50% 50%',
	},
	{
		id: 'futurelab-coworking-zone',
		src: carouselPath('/images/block4/carousel/IMG_2708.JPG'),
		alt: 'Коворкинг FutureLab для командной работы и CreativeTech-проектов',
		width: 552,
		position: '50% 50%',
	},
	{
		id: 'futurelab-gaming-zone',
		src: carouselPath('/images/block4/carousel/Вертикальные/IMG game.png'),
		alt: 'Игровая и неформальная зона FutureLab для общения и командной работы',
		width: 306,
		position: '50% 50%',
	},
	{
		id: 'futurelab-team-work',
		src: carouselPath('/images/block4/carousel/IMG_2723.JPG'),
		alt: 'Команда FutureLab работает над AI, AR/VR, 3D и WebAR-проектом',
		width: 552,
		position: '50% 50%',
	},
	{
		id: 'futurelab-gaming-vertical',
		src: carouselPath('/images/block4/carousel/Вертикальные/IMG game2.png'),
		alt: 'Вертикальное фото игровой зоны FutureLab',
		width: 306,
		position: '50% 50%',
	},
	{
		id: 'futurelab-coworking-space',
		src: carouselPath('/images/block4/carousel/koworking zone.jpeg'),
		alt: 'Коворкинг пространство FutureLab',
		width: 552,
		position: '50% 50%',
	},
	{
		id: 'futurelab-participant-vertical',
		src: carouselPath('/images/block4/carousel/Вертикальные/IMG_4442.JPG'),
		alt: 'Вертикальное фото участника FutureLab',
		width: 306,
		position: '50% 50%',
	},
	{
		id: 'futurelab-terrace',
		src: carouselPath('/images/block4/carousel/terrassa.jpeg'),
		alt: 'Терраса FutureLab для нетворкинга, встреч и неформальной работы',
		width: 552,
		position: '50% 50%',
	},
	{
		id: 'futurelab-lab',
		src: carouselPath('/images/block4/carousel/ARVR lab.jpeg'),
		alt: 'Лаборатория FutureLab для AR/VR, AI, 3D и голографических решений',
		width: 552,
		position: '50% 50%',
	},
]

const buildGalleryItems = (items: typeof gallerySourceItems, gap: number) =>
	items.map((item, index) => ({
		...item,
		left: items
			.slice(0, index)
			.reduce((offset, previous) => offset + previous.width + gap, 0),
	}))

const getGallerySetWidth = (
	items: ReturnType<typeof buildGalleryItems>,
	gap: number,
) => items.reduce((offset, item) => offset + item.width + gap, 0)

const getMobileGalleryItems = (viewportWidth: number) => {
	const landscapeWidth = Math.min(
		GALLERY_LANDSCAPE_WIDTH,
		Math.max(280, viewportWidth - MOBILE_SIDE_PADDING * 2),
	)
	const frameHeight = Math.round(
		(landscapeWidth / GALLERY_LANDSCAPE_WIDTH) * GALLERY_FRAME_HEIGHT,
	)
	const scaledItems = gallerySourceItems.map(item => ({
		...item,
		width: Math.round((item.width / GALLERY_FRAME_HEIGHT) * frameHeight),
	}))

	return {
		frameHeight,
		gap: MOBILE_GALLERY_GAP,
		items: buildGalleryItems(scaledItems, MOBILE_GALLERY_GAP),
	}
}

export function ImageGallery({ alts }: { alts: string[] }) {
	const galleryRef = useRef<HTMLDivElement>(null)
	const trackRef = useRef<HTMLDivElement>(null)
	const [viewportWidth, setViewportWidth] = useState<number | null>(null)

	useEffect(() => {
		const updateViewportWidth = () => {
			setViewportWidth(window.innerWidth)
		}

		updateViewportWidth()
		window.addEventListener('resize', updateViewportWidth)

		return () => {
			window.removeEventListener('resize', updateViewportWidth)
		}
	}, [])

	const isMobile = viewportWidth !== null && viewportWidth < 720
	const galleryLayout = useMemo(() => {
		if (isMobile) {
			return getMobileGalleryItems(viewportWidth)
		}

		return {
			frameHeight: GALLERY_FRAME_HEIGHT,
			gap: GALLERY_GAP,
			items: buildGalleryItems(gallerySourceItems, GALLERY_GAP),
		}
	}, [isMobile, viewportWidth])
	const galleryItems = galleryLayout.items
	const galleryItemsWithAlts = galleryItems.map((item, index) => ({
		...item,
		alt: alts[index] ?? item.alt,
	}))
	const gallerySetWidth = getGallerySetWidth(galleryItems, galleryLayout.gap)
	const galleryHeight = galleryLayout.frameHeight + 144
	const galleryMarginLeft =
		isMobile && viewportWidth !== null
			? Math.max(0, (viewportWidth - galleryItems[0].width) / 2)
			: undefined

	useEffect(() => {
		registerGsapPlugins()

		const gallery = galleryRef.current
		const track = trackRef.current
		if (!gallery || !track) return

		const firstSet = track.querySelector<HTMLElement>(
			"[data-gallery-set='original']",
		)
		if (!firstSet) return

		let tween: gsap.core.Tween | null = null
		let frameId = 0
		let isSlowed = false

		const createTween = () => {
			frameId = 0

			const setWidth = firstSet.offsetWidth
			if (setWidth <= 0) {
				frameId = window.requestAnimationFrame(createTween)
				return
			}

			tween?.kill()
			gsap.set(track, { x: 0 })
			tween = gsap.to(track, {
				x: -setWidth,
				duration: 28,
				ease: 'none',
				repeat: -1,
			})
			tween.timeScale(isSlowed ? 0.28 : 1)
		}

		const requestCreateTween = () => {
			if (frameId) return
			frameId = window.requestAnimationFrame(createTween)
		}

		const slowDown = () => {
			isSlowed = true
			tween?.timeScale(0.28)
		}
		const speedUp = () => {
			isSlowed = false
			tween?.timeScale(1)
		}
		const resumeOnVisible = () => {
			if (document.hidden) return
			tween?.resume()
			requestCreateTween()
		}

		createTween()

		gallery.addEventListener('pointerenter', slowDown)
		gallery.addEventListener('pointerleave', speedUp)
		gallery.addEventListener('focusin', slowDown)
		gallery.addEventListener('focusout', speedUp)
		window.addEventListener('resize', requestCreateTween)
		document.addEventListener('visibilitychange', resumeOnVisible)

		return () => {
			if (frameId) window.cancelAnimationFrame(frameId)
			gallery.removeEventListener('pointerenter', slowDown)
			gallery.removeEventListener('pointerleave', speedUp)
			gallery.removeEventListener('focusin', slowDown)
			gallery.removeEventListener('focusout', speedUp)
			window.removeEventListener('resize', requestCreateTween)
			document.removeEventListener('visibilitychange', resumeOnVisible)
			tween?.kill()
		}
	}, [gallerySetWidth])

	return (
		<div
			ref={galleryRef}
			className='infrastructure-gallery relative mt-16 h-[540px] w-full overflow-hidden pt-[72px] md:mt-24 lg:mt-28'
			style={isMobile ? { height: galleryHeight } : undefined}
			aria-label='Фотографии пространства FutureLab'
		>
			<div
				ref={trackRef}
				className='infrastructure-gallery-track flex h-[396px] w-max will-change-transform'
				style={
					isMobile
						? {
								height: galleryLayout.frameHeight,
								marginLeft: galleryMarginLeft,
							}
						: undefined
				}
			>
				{[0, 1].map(setIndex => (
					<div
						key={`set-${setIndex}`}
						data-gallery-set={setIndex === 0 ? 'original' : 'clone'}
						className='relative h-[396px] shrink-0'
						style={{ width: gallerySetWidth }}
						aria-hidden={setIndex === 1}
					>
						{galleryItems.map(backplate => (
							<div
								key={`set-${setIndex}-backplate-${backplate.id}`}
								className='absolute top-0 h-[396px]'
								style={{
									left: backplate.left,
									width: backplate.width,
									height: galleryLayout.frameHeight,
									backgroundColor: '#000',
								}}
							/>
						))}

						{galleryItemsWithAlts.map(image => (
							<div
								key={`set-${setIndex}-${image.id}`}
								className={`infrastructure-gallery-item absolute top-0 h-[396px] overflow-hidden will-change-transform ${
									isMobile ? 'rounded-[18px]' : ''
								}`}
								style={{
									left: image.left,
									width: image.width,
									height: galleryLayout.frameHeight,
								}}
							>
								<FadeInImage
									src={image.src}
									alt={setIndex === 0 ? image.alt : ''}
									fill
									className={isMobile ? 'object-contain' : 'object-cover'}
									style={{ objectPosition: image.position }}
									sizes={`${image.width}px`}
								/>
							</div>
						))}
					</div>
				))}
			</div>

			<div
				className='pointer-events-none absolute inset-y-0 left-0 z-10 w-[242px] bg-[linear-gradient(270deg,rgba(0,0,0,0)_0%,#000_100%)]'
				aria-hidden='true'
			/>
			<div
				className='pointer-events-none absolute inset-y-0 right-0 z-10 w-[242px] bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,#000_100%)]'
				aria-hidden='true'
			/>
			<GalleryCurveOverlay position='top' />
			<GalleryCurveOverlay position='bottom' />
		</div>
	)
}

function GalleryCurveOverlay({ position }: { position: 'top' | 'bottom' }) {
	const isTop = position === 'top'

	return (
		<svg
			className={`pointer-events-none absolute inset-x-0 z-20 h-[48px] w-full ${
				isTop ? 'top-[72px]' : 'bottom-[72px]'
			}`}
			viewBox='0 0 1920 48'
			preserveAspectRatio='none'
			aria-hidden='true'
		>
			<path
				d={
					isTop
						? 'M0 0H1920C1440 22 480 22 0 0Z'
						: 'M0 48C480 26 1440 26 1920 48H0Z'
				}
				fill='black'
			/>
		</svg>
	)
}
