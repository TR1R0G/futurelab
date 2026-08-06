'use client'

import { useGlobalVideoSound } from '@/components/providers/SoundProvider'
import { gsap, registerGsapPlugins, ScrollTrigger } from '@/lib/gsap'
import type { Language } from '@/lib/mdx'
import { scrollToHashTarget } from '@/lib/smooth-scroll'
import Image from 'next/image'
import Link from 'next/link'
import type { MouseEvent, RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { GradientOrb } from './GradientOrb'
import { HeroActions } from './HeroActions'
import { HeroTitle } from './HeroTitle'

interface HeroProps {
	title: string
	description: string
	primaryCta: string
	secondaryCta: string
	projectsCta?: string
	headerCta: string
	imageAlt: string
	language: Language
}

export function Hero({
	title,
	description,
	primaryCta,
	secondaryCta,
	projectsCta,
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

		const section = sectionRef.current
		const header = headerRef.current
		const copy = copyRef.current
		const desc = descRef.current
		const image = imageRef.current
		const imageFrame = imageFrameRef.current
		const video = videoRef.current
		const actions = actionsRef.current
		const light = section?.querySelector<HTMLElement>('.hero-light')

		if (
			!section ||
			!header ||
			!copy ||
			!desc ||
			!image ||
			!imageFrame ||
			!video ||
			!actions ||
			!light
		) {
			return
		}

		const animationElements = [header, copy, desc, image, actions, light]
		const clearAnimationStyles = () => {
			gsap.set(animationElements, {
				clearProps: 'opacity,transform,left,right,top,width,height',
			})
			gsap.set(imageFrame, { clearProps: 'borderRadius' })
		}

		const clamp = (value: number) => Math.min(1, Math.max(0, value))
		const lerp = (start: number, end: number, progress: number) =>
			start + (end - start) * progress
		const ease = gsap.parseEase('power2.inOut')
		// Reserve the last part of Hero for the completed video and its gradient.
		const finalImageAt = 0.78
		const videoAspect = 530 / 928

		const toBox = (element: HTMLElement, stageBox: DOMRect) => {
			const rect = element.getBoundingClientRect()
			return {
				left: rect.left - stageBox.left,
				top: rect.top - stageBox.top,
				width: rect.width,
				height: rect.height,
			}
		}

		const media = gsap.matchMedia()
		let refreshFrame = 0
		let active = true
		const syncHeroTriggerCount = () => {
			section.dataset.heroScrollTriggerCount = String(
				ScrollTrigger.getAll().filter(
					trigger =>
						trigger.vars.id === 'hero-scroll' && trigger.trigger === section,
				).length,
			)
		}

		const refresh = () => {
			if (!active) return
			window.cancelAnimationFrame(refreshFrame)
			refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
		}

		const ctx = gsap.context(() => {
			media.add(
				{
					mobile: '(max-width: 719px)',
					short: '(max-width: 1199px) and (max-height: 600px)',
					tablet:
						'(min-width: 720px) and (max-width: 959px) and (min-height: 601px)',
					laptop:
						'(min-width: 960px) and (max-width: 1199px) and (min-height: 601px)',
					desktop: '(min-width: 1200px) and (max-width: 1599px)',
					largeDesktop: '(min-width: 1600px)',
				},
				context => {
					const conditions = context.conditions!
					const hideSupportingText =
						conditions.mobile || conditions.tablet || conditions.short
					const expandedRadius =
						conditions.desktop || conditions.largeDesktop ? 35 : 25
					let frame = 0
					let finalStageOffset = 0
					let finalStateApplied = false
					const syncSupportingContentClearance = () => {
						if (!conditions.desktop && !conditions.largeDesktop) return

						const stage = section.querySelector<HTMLElement>('.hero-stage')!
						const stageBox = stage.getBoundingClientRect()
						const copyBox = copy.getBoundingClientRect()
						const visibleStageHeight = Math.min(
							stageBox.height,
							window.innerHeight,
						)
						const minimumGap = Math.max(
							24,
							Math.min(40, visibleStageHeight * 0.04),
						)
						const boxes = [desc, image, actions].map(element => ({
							element,
							box: element.getBoundingClientRect(),
						}))
						const highestCenter = Math.max(
							...boxes.map(({ box }) =>
								box.top - stageBox.top + box.height / 2,
							),
						)
						const tallestSupportingElement = Math.max(
							...boxes.map(({ box }) => box.height),
						)
						const requestedCenter = Math.max(
							highestCenter,
							copyBox.bottom -
								stageBox.top +
								minimumGap +
								tallestSupportingElement / 2,
						)
						const visibleBottomPadding = Math.max(
							16,
							Math.min(32, visibleStageHeight * 0.03),
						)
						const sharedCenter = Math.min(
							requestedCenter,
							visibleStageHeight -
								visibleBottomPadding -
								tallestSupportingElement / 2,
						)

						// Description and CTA use CSS translateY(-50%); the video does not.
						desc.style.top = `${sharedCenter}px`
						actions.style.top = `${sharedCenter}px`
						const imageBox = boxes.find(({ element }) => element === image)!.box
						image.style.top = `${sharedCenter - imageBox.height / 2}px`
					}

					const measure = () => {
						const stage = section.querySelector<HTMLElement>('.hero-stage')!
						const content = section.querySelector<HTMLElement>('.hero-content')!
						const sectionBox = section.getBoundingClientRect()
						const stageBox = stage.getBoundingClientRect()
						const contentBox = content.getBoundingClientRect()
						const sectionTop = section.offsetTop
						const stagePosition = getComputedStyle(stage).position
						const stageIsSticky = stagePosition === 'sticky'
						const start = {
							desc: toBox(desc, stageBox),
							image: toBox(image, stageBox),
							actions: toBox(actions, stageBox),
							light: toBox(light, stageBox),
						}
						const columnGap = Math.max(
							24,
							Math.min(64, contentBox.width * 0.04),
						)
						const minimumSupportingWidth = 160
						const availableStageHeight =
							Math.min(stageBox.height, window.innerHeight) * 0.92
						const availableContentWidth = hideSupportingText
							? contentBox.width
							: Math.max(
									1,
									contentBox.width - 2 * minimumSupportingWidth - 2 * columnGap,
								)
						const imageWidth = Math.min(
							530,
							availableContentWidth,
							availableStageHeight * videoAspect,
						)
						const imageHeight = imageWidth / videoAspect
						const sideWidth = Math.max(
							hideSupportingText ? 1 : minimumSupportingWidth,
							(contentBox.width - imageWidth) / 2 - columnGap,
						)
						const descriptionWidth = Math.min(start.desc.width, sideWidth)
						const actionsWidth = Math.min(start.actions.width, sideWidth)
						const startsInColumns =
							start.desc.left + start.desc.width <= start.image.left ||
							start.image.left + start.image.width <= start.desc.left
						const actionsStartInColumns =
							start.image.left + start.image.width <= start.actions.left ||
							start.actions.left + start.actions.width <= start.image.left

						desc.style.width = `${descriptionWidth}px`
						actions.style.width = `${actionsWidth}px`
						image.style.width = `${imageWidth}px`
						image.style.height = `${imageHeight}px`
						const targetBase = {
							desc: toBox(desc, stageBox),
							image: toBox(image, stageBox),
							actions: toBox(actions, stageBox),
						}
						desc.style.removeProperty('width')
						actions.style.removeProperty('width')
						image.style.removeProperty('width')
						image.style.removeProperty('height')
						const flowTransitionStart = Math.max(
							0,
							stageBox.top +
								window.scrollY +
								start.actions.top +
								start.actions.height -
								sectionTop,
						)
						const videoTransitionStart = hideSupportingText
							? Math.min(
									flowTransitionStart,
									Math.max(
										0,
										start.image.top +
											start.image.height / 2 -
											window.innerHeight / 2,
									),
								)
							: 0
						const supportFadeStart = conditions.short
							? flowTransitionStart
							: videoTransitionStart
						const transitionStageTop = stageIsSticky ? 0 : -videoTransitionStart
						const startViewportCenter = {
							desc: transitionStageTop + start.desc.top + start.desc.height / 2,
							image:
								transitionStageTop + start.image.top + start.image.height / 2,
							actions:
								transitionStageTop + start.actions.top + start.actions.height / 2,
						}

						return {
							stage,
							sectionTop,
							scrollDistance: Math.max(
								1,
								sectionBox.height - window.innerHeight,
							),
							videoTransitionStart,
							supportFadeStart,
							startViewportCenter,
							start,
							lightOffset: {
								left: light.offsetLeft,
								top: light.offsetTop,
							},
							clearance: {
								descLeft: contentBox.left - stageBox.left,
								actionsLeft:
									contentBox.right - stageBox.left - start.actions.width,
							},
							requiresColumnTransition:
								!hideSupportingText &&
								(!startsInColumns || !actionsStartInColumns),
							initialRadius: parseFloat(
								getComputedStyle(imageFrame).borderRadius,
							),
							target: {
								image: {
									left: (stageBox.width - imageWidth) / 2,
									width: imageWidth,
									height: imageHeight,
								},
								desc: {
									left: contentBox.left - stageBox.left,
									width: descriptionWidth,
									height: targetBase.desc.height,
								},
								actions: {
									left: contentBox.right - stageBox.left - actionsWidth,
									width: actionsWidth,
									height: targetBase.actions.height,
								},
							},
						}
					}

					clearAnimationStyles()
					syncSupportingContentClearance()
					let geometry = measure()

					const positionElement = (
						element: HTMLElement,
						width: number,
						height: number | undefined,
						left: number,
						top: number,
						stageBox: DOMRect,
						centeredByCss = false,
					) => {
						element.style.width = `${width}px`
						if (height !== undefined) element.style.height = `${height}px`
						element.style.transform = centeredByCss ? 'translateX(-50%)' : ''
						const baseBox = toBox(element, stageBox)
						const x = left - baseBox.left
						const y = top - baseBox.top
						element.style.transform = centeredByCss
							? `translate(calc(-50% + ${x}px), ${y}px)`
							: `translate(${x}px, ${y}px)`
					}

					const update = () => {
						frame = 0
						const videoTransitionStart = hideSupportingText
							? Math.min(
								geometry.videoTransitionStart,
								geometry.scrollDistance - 1,
							)
							: 0
						const videoTransitionDistance = Math.max(
							1,
							geometry.scrollDistance - videoTransitionStart,
						)
						const progress = clamp(
							(window.scrollY - geometry.sectionTop - videoTransitionStart) /
								videoTransitionDistance,
						)
						if (progress === 0) {
							clearAnimationStyles()
							syncSupportingContentClearance()
							return
						}
						const columnTransitionAt = 0.25
						const imageProgress = geometry.requiresColumnTransition
							? clamp(
									(progress - columnTransitionAt) /
										(finalImageAt - columnTransitionAt),
								)
							: clamp(progress / finalImageAt)
						const supportProgress = geometry.requiresColumnTransition
							? clamp(progress / columnTransitionAt)
							: imageProgress
						const supportClearanceProgress = geometry.requiresColumnTransition
							? clamp(progress / (columnTransitionAt / 2))
							: supportProgress
						const supportSettleProgress = geometry.requiresColumnTransition
							? clamp(
									(progress - columnTransitionAt / 2) /
										(columnTransitionAt / 2),
								)
							: supportProgress
						const eased = ease(imageProgress)
						const supportEased = ease(supportProgress)
						const supportClearanceEased = ease(supportClearanceProgress)
						const supportSettleEased = ease(supportSettleProgress)
						const imageWidth = lerp(
							geometry.start.image.width,
							geometry.target.image.width,
							eased,
						)
						const imageHeight = lerp(
							geometry.start.image.height,
							geometry.target.image.height,
							eased,
						)
						image.style.width = `${imageWidth}px`
						image.style.height = `${imageHeight}px`
						const stageBox = geometry.stage.getBoundingClientRect()
						const targetStageTop = stageBox.top + finalStageOffset
						const viewportCenterY = window.innerHeight / 2
						const imageLeft = lerp(
							geometry.start.image.left,
							geometry.target.image.left,
							eased,
						)
						const imageViewportCenterY = lerp(
							geometry.startViewportCenter.image,
							viewportCenterY,
							eased,
						)
						const imageTop =
							imageViewportCenterY - imageHeight / 2 - targetStageTop
						const imageCenterX = imageLeft + imageWidth / 2
						const imageCenterY = imageTop + imageHeight / 2
						const startLightCenterX =
							geometry.start.light.left + geometry.start.light.width / 2
						const startLightCenterY =
							geometry.start.light.top + geometry.start.light.height / 2
						const lightCenterX = lerp(startLightCenterX, imageCenterX, eased)
						const lightCenterY = lerp(startLightCenterY, imageCenterY, eased)
						const gradientScale = Math.max(
							geometry.target.image.width / geometry.start.light.width,
							geometry.target.image.height / geometry.start.light.height,
						)

						header.style.opacity = String(1 - clamp(progress * 3))
						header.style.transform = `translateY(${-90 * eased}px)`
						copy.style.opacity = String(1 - clamp(progress * 3))
						copy.style.transform = `translateY(${-150 * eased}px)`

						positionElement(
							image,
							imageWidth,
							imageHeight,
							imageLeft,
							imageTop,
							stageBox,
							true,
						)
						imageFrame.style.borderRadius = `${lerp(
							geometry.initialRadius,
							expandedRadius,
							eased,
						)}px`

						if (hideSupportingText) {
							const supportFadeStart = Math.min(
								geometry.supportFadeStart,
								geometry.scrollDistance - 1,
							)
							const supportFadeProgress = clamp(
								(window.scrollY - geometry.sectionTop - supportFadeStart) /
									Math.max(1, geometry.scrollDistance - supportFadeStart),
							)
							desc.style.opacity = String(1 - clamp(supportFadeProgress * 5))
							actions.style.opacity = String(1 - clamp(supportFadeProgress * 5))
						} else {
							const supportOpacity = geometry.requiresColumnTransition
								? progress < 0.04
									? 1 - clamp(progress / 0.04)
									: progress <= columnTransitionAt
										? 0
										: clamp((progress - columnTransitionAt) / 0.05)
								: 1
							desc.style.opacity = String(supportOpacity)
							actions.style.opacity = String(supportOpacity)

							const descriptionWidth = lerp(
								geometry.start.desc.width,
								geometry.target.desc.width,
								supportSettleEased,
							)
							const descriptionLeft = geometry.requiresColumnTransition
								? lerp(
										lerp(
											geometry.start.desc.left,
											geometry.clearance.descLeft,
											supportClearanceEased,
										),
										geometry.target.desc.left,
										supportSettleEased,
									)
								: lerp(
										geometry.start.desc.left,
										geometry.target.desc.left,
										supportEased,
									)
							const descriptionViewportCenterY = lerp(
								geometry.startViewportCenter.desc,
								viewportCenterY,
								supportSettleEased,
							)
							desc.style.width = `${descriptionWidth}px`
							const descriptionHeight = desc.getBoundingClientRect().height
							positionElement(
								desc,
								descriptionWidth,
								undefined,
								descriptionLeft,
								descriptionViewportCenterY -
									descriptionHeight / 2 -
									targetStageTop,
								stageBox,
								false,
							)

							const actionsWidth = lerp(
								geometry.start.actions.width,
								geometry.target.actions.width,
								supportSettleEased,
							)
							const actionsLeft = geometry.requiresColumnTransition
								? lerp(
										lerp(
											geometry.start.actions.left,
											geometry.clearance.actionsLeft,
											supportClearanceEased,
										),
										geometry.target.actions.left,
										supportSettleEased,
									)
								: lerp(
										geometry.start.actions.left,
										geometry.target.actions.left,
										supportEased,
									)
							const actionsViewportCenterY = lerp(
								geometry.startViewportCenter.actions,
								viewportCenterY,
								supportSettleEased,
							)
							actions.style.width = `${actionsWidth}px`
							const actionsHeight = actions.getBoundingClientRect().height
							positionElement(
								actions,
								actionsWidth,
								undefined,
								actionsLeft,
								actionsViewportCenterY -
									actionsHeight / 2 -
									targetStageTop,
								stageBox,
								false,
							)
						}

						light.style.transform = `rotate(-12.33deg) scale(${lerp(
							1,
							gradientScale,
							eased,
						)})`
						light.style.left = `${
							geometry.lightOffset.left + lightCenterX - startLightCenterX
						}px`
						light.style.top = `${
							geometry.lightOffset.top + lightCenterY - startLightCenterY
						}px`
						light.style.opacity = '1'
						if (!finalStateApplied) finalStageOffset = 0
					}

					const requestUpdate = () => {
						if (frame) return
						frame = window.requestAnimationFrame(update)
					}
					const applyUpdate = () => {
						if (frame) window.cancelAnimationFrame(frame)
						frame = 0
						update()
					}
					const remeasureAndUpdate = () => {
						if (frame) window.cancelAnimationFrame(frame)
						frame = 0
						clearAnimationStyles()
						syncSupportingContentClearance()
						geometry = measure()
						const triggerEnd = geometry.sectionTop + geometry.scrollDistance
						finalStateApplied = window.scrollY >= triggerEnd
						finalStageOffset = finalStateApplied
							? window.scrollY - triggerEnd
							: 0
						update()
					}

					const trigger = ScrollTrigger.create({
						id: 'hero-scroll',
						trigger: section,
						start: () => section.offsetTop,
						end: () => {
							const sectionBox = section.getBoundingClientRect()
							return (
								section.offsetTop +
								Math.max(1, sectionBox.height - window.innerHeight)
							)
						},
						invalidateOnRefresh: true,
						onRefreshInit: remeasureAndUpdate,
						onRefresh: (self) => {
							finalStateApplied = window.scrollY >= self.end
							finalStageOffset = finalStateApplied
								? window.scrollY - self.end
								: 0
							applyUpdate()
							requestUpdate()
						},
						onUpdate: (self) => {
							if (self.progress < 1) {
								finalStateApplied = false
								finalStageOffset = 0
								requestUpdate()
								return
							}
							if (!finalStateApplied) {
								finalStateApplied = true
								finalStageOffset = Math.max(0, window.scrollY - self.end)
								requestUpdate()
							}
						},
					})

					const initializedPastEnd = window.scrollY >= trigger.end
					finalStateApplied = initializedPastEnd
					finalStageOffset = initializedPastEnd
						? window.scrollY - trigger.end
						: 0
					applyUpdate()
					requestUpdate()
					syncHeroTriggerCount()

					return () => {
						if (frame) window.cancelAnimationFrame(frame)
						trigger.kill()
						syncHeroTriggerCount()
						clearAnimationStyles()
					}
				},
			)
		}, sectionRef)

		void document.fonts.ready.then(refresh)
		const metadataIsReady = video.readyState >= HTMLMediaElement.HAVE_METADATA
		if (metadataIsReady) {
			refresh()
		} else {
			video.addEventListener('loadedmetadata', refresh, { once: true })
		}
		window.addEventListener('orientationchange', refresh)

		return () => {
			active = false
			window.cancelAnimationFrame(refreshFrame)
			if (!metadataIsReady) {
				video.removeEventListener('loadedmetadata', refresh)
			}
			window.removeEventListener('orientationchange', refresh)
			media.revert()
			ctx.revert()
			clearAnimationStyles()
			delete section.dataset.heroScrollTriggerCount
		}
	}, [language, heroVideoSrc])

	return (
		<section ref={sectionRef} className='hero-section relative w-full bg-black'>
			<div className='hero-stage sticky top-0 w-full bg-black'>
				<div className='absolute inset-0 z-0'>
					<GradientOrb />
				</div>

				<HeroHeader cta={headerCta} headerRef={headerRef} language={language} />

				<div className='hero-content'>
					<div ref={copyRef} className='hero-copy relative z-10'>
						<HeroTitle title={title} />
					</div>

					<div className='hero-support'>
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
							<HeroActions
								primaryCta={primaryCta}
								secondaryCta={secondaryCta}
								projectsCta={projectsCta}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
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
	const handleContactClick = (event: MouseEvent<HTMLAnchorElement>) => {
		scrollToHashTarget(event, '#contacts')
	}

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
						alt='FutureLab by NazzAR Innovation — CreativeTech Hub'
						width={144}
						height={30}
						priority
					/>
				</a>
				<a
					href='#contacts'
					onClick={handleContactClick}
					className='hero-header-button bg-[#0B5CFF] font-medium text-white'
				>
					{cta}
				</a>
			</div>
			<div className='hero-language' aria-label='Language'>
				<Link
					href='/en'
					className={language === 'en' ? 'font-bold' : 'font-normal'}
					aria-current={language === 'en' ? 'true' : undefined}
				>
					Eng
				</Link>
				<span className='hero-language-divider' aria-hidden='true' />
				<Link
					href='/uz'
					className={language === 'uz' ? 'font-bold' : 'font-normal'}
					aria-current={language === 'uz' ? 'true' : undefined}
				>
					O‘zbek
				</Link>
				<span className='hero-language-divider' aria-hidden='true' />
				<Link
					href='/ru'
					className={language === 'ru' ? 'font-bold' : 'font-normal'}
					aria-current={language === 'ru' ? 'true' : undefined}
				>
					Рус
				</Link>
			</div>
		</header>
	)
}
