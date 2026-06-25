'use client'

import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { SolutionsContent } from '@/lib/mdx'
import Image from 'next/image'
import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

interface SolutionsProps {
	title: string
	description: string
	card: SolutionsContent['card']
}

export function Solutions({ title, description, card }: SolutionsProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const mediaRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		const media = mediaRef.current
		if (!section || !media) return

		const mediaQuery = window.matchMedia('(min-width: 1024px)')
		const ease = gsap.parseEase('power2.inOut')
		const start = {
			left: 371,
			top: 1059,
			width: 694,
			height: 391,
			borderRadius: 35,
		}
		const end = {
			left: 0,
			top: 1598,
			width: 1436,
			height: 809,
			borderRadius: 35,
		}
		const clamp = (value: number) => Math.min(1, Math.max(0, value))
		const lerp = (from: number, to: number, progress: number) =>
			from + (to - from) * progress
		let frame = 0

		const applyState = (progress: number) => {
			const eased = ease(progress)

			media.style.left = `${lerp(start.left, end.left, eased)}px`
			media.style.top = `${lerp(start.top, end.top, eased)}px`
			media.style.width = `${lerp(start.width, end.width, eased)}px`
			media.style.height = `${lerp(start.height, end.height, eased)}px`
			media.style.borderRadius = `${lerp(
				start.borderRadius,
				end.borderRadius,
				eased,
			)}px`
		}

		const update = () => {
			frame = 0

			if (!mediaQuery.matches) {
				media.removeAttribute('style')
				return
			}

			const sectionTop = section.getBoundingClientRect().top + window.scrollY
			const animationStart = sectionTop + 560
			const animationEnd = Math.max(
				animationStart + 1,
				sectionTop + section.offsetHeight - window.innerHeight,
			)
			const progress = clamp(
				(window.scrollY - animationStart) / (animationEnd - animationStart),
			)

			applyState(progress)
		}

		const requestUpdate = () => {
			if (frame) return
			frame = window.requestAnimationFrame(update)
		}

		const handleResize = () => {
			media.removeAttribute('style')
			requestUpdate()
		}

		const ctx = gsap.context(() => {
			applyState(0)
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
	}, [])

	return (
		<section
			ref={sectionRef}
			className='solutions-section relative isolate -mt-20 overflow-hidden bg-black px-5 py-24 md:px-8 lg:-mt-[270px] lg:min-h-[2580px] lg:px-0 lg:py-0'
		>
			<div className='relative mx-auto max-w-[1436px] lg:h-[2580px]'>
				<div className='lg:absolute lg:left-0 lg:top-[150px] lg:w-[857px]'>
					<h2 className='whitespace-pre-line text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-white md:text-[56px] lg:text-[65px] lg:leading-[73px]'>
						{title}
					</h2>
				</div>

				<p className='mt-10 max-w-[944px] text-[18px] font-medium leading-[1.24] text-[#C4C4C4] md:text-[21px] lg:absolute lg:left-0 lg:top-[366px] lg:mt-0 lg:text-[23px] lg:leading-[28px]'>
					{description}
				</p>

				<article className='solutions-card-outline relative mt-16 min-h-[680px] overflow-visible rounded-[35px] bg-black md:mt-20 lg:absolute lg:left-0 lg:top-[555px] lg:mt-0 lg:h-[680px] lg:w-full'>
					<div className='relative z-20 px-8 pt-14 md:px-[72px] md:pt-[86px] lg:px-0 lg:pt-0'>
						<h3 className='text-[38px] font-semibold leading-tight text-[#DE5CFF] md:text-[48px] lg:absolute lg:left-[121px] lg:top-[88px] lg:w-[575px] lg:text-[55px] lg:leading-[66px]'>
							{card.title}
						</h3>

						<p className='mt-10 max-w-[821px] whitespace-pre-line text-[18px] font-medium leading-[1.24] text-[#C4C4C4] md:text-[21px] lg:absolute lg:left-[121px] lg:top-[204px] lg:mt-0 lg:text-[23px] lg:leading-[28px]'>
							{card.description}
						</p>
					</div>

					<LearnMoreButton label={card.cta} />

					<CollapsedGlow />
				</article>

				<ExpandedGlow />
				<TransitionMedia
					mediaRef={mediaRef}
					image={card.image}
					imageAlt={card.imageAlt}
				/>
			</div>
		</section>
	)
}

function LearnMoreButton({ label }: { label: string }) {
	return (
		<button
			type='button'
			aria-label={label}
			className='absolute left-[1107px] top-[160px] z-30 hidden h-[252.42px] w-[252.42px] text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0051FF] active:scale-[0.98] lg:block'
		>
			<span className='absolute left-[22.21px] top-[22.21px] h-[207px] w-[207px] rounded-full bg-[#0051FF]' />
			<svg
				className='learn-more-title-ring absolute left-[37.71px] top-[37.71px] h-[176px] w-[176px] overflow-visible'
				viewBox='0 0 176 176'
				aria-hidden='true'
			>
				<defs>
					<path
						id='learn-more-circle'
						d='M88 88 m -62 0 a 62 62 0 1 1 124 0 a 62 62 0 1 1 -124 0'
					/>
				</defs>
				<text className='fill-white text-[22px] font-semibold tracking-[0.035em]'>
					<textPath
						href='#learn-more-circle'
						startOffset='0%'
						textLength='330'
						lengthAdjust='spacing'
					>
						{label} • {label} •
					</textPath>
				</text>
			</svg>
			<Image
				src='/images/block6/arrow.svg'
				alt=''
				width={16}
				height={16}
				className='absolute left-[118.21px] top-[118.2px] h-[16px] w-[16px]'
				aria-hidden='true'
			/>
		</button>
	)
}

function CollapsedGlow() {
	return (
		<div className='pointer-events-none absolute left-1/2 top-[420px] z-10 h-[870px] w-[954px] -translate-x-1/2 lg:left-[calc(50%+5.16px)] lg:top-[262.79px]'>
			<SolutionGlow variant='collapsed' />
		</div>
	)
}

function ExpandedGlow() {
	return (
		<div className='pointer-events-none relative mt-20 hidden h-[1160px] w-full lg:absolute lg:left-0 lg:top-[1415.47px] lg:mt-0 lg:block'>
			<SolutionGlow variant='expanded' />
		</div>
	)
}

function TransitionMedia({
	mediaRef,
	image,
	imageAlt,
}: {
	mediaRef: RefObject<HTMLDivElement | null>
	image: string
	imageAlt: string
}) {
	return (
		<div
			ref={mediaRef}
			className='solutions-transition-media relative z-20 mt-20 h-[391px] w-full overflow-hidden rounded-[35px] shadow-2xl shadow-black/40 lg:absolute lg:left-[371px] lg:top-[1059px] lg:mt-0 lg:h-[391px] lg:w-[694px]'
		>
			<Image
				src={image}
				alt={imageAlt}
				fill
				sizes='(min-width: 1024px) 1436px, calc(100vw - 40px)'
				className='object-cover'
			/>
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
