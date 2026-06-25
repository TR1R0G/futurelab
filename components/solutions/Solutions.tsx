'use client'

import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { SolutionsContent } from '@/lib/mdx'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'

interface SolutionsProps {
	title: string
	description: string
	cards: SolutionsContent['cards']
}

const SOLUTION_CARD_TOP = 555
const SOLUTION_CARD_IMAGE_TOP = 1059
const SOLUTION_EXPANDED_GLOW_TOP = 1415.47
const SOLUTION_EXPANDED_IMAGE_TOP = 1598
const SOLUTION_BLOCK_HEIGHT = 2020.92

export function Solutions({ title, description, cards }: SolutionsProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const mediaRefs = useRef<Array<HTMLDivElement | null>>([])

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		if (!section) return

		const mediaQuery = window.matchMedia('(min-width: 1024px)')
		const ease = gsap.parseEase('power2.inOut')
		const clamp = (value: number) => Math.min(1, Math.max(0, value))
		const lerp = (from: number, to: number, progress: number) =>
			from + (to - from) * progress
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
				end: {
					left: 0,
					top: SOLUTION_EXPANDED_IMAGE_TOP + offset,
					width: 1436,
					height: 809,
					borderRadius: 35,
				},
			}
		}

		const applyState = (media: HTMLDivElement, index: number, progress: number) => {
			const { start, end } = getLayout(index)
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
				mediaRefs.current.forEach(media => media?.removeAttribute('style'))
				return
			}

			const sectionTop = section.getBoundingClientRect().top + window.scrollY

			mediaRefs.current.forEach((media, index) => {
				if (!media) return

				const { cardTop } = getLayout(index)
				const animationStart = sectionTop + cardTop + 5
				const animationEnd = animationStart + 870
				const progress = clamp(
					(window.scrollY - animationStart) / (animationEnd - animationStart),
				)

				applyState(media, index, progress)
			})
		}

		const requestUpdate = () => {
			if (frame) return
			frame = window.requestAnimationFrame(update)
		}

		const handleResize = () => {
			mediaRefs.current.forEach(media => media?.removeAttribute('style'))
			requestUpdate()
		}

		const ctx = gsap.context(() => {
			mediaRefs.current.forEach((media, index) => {
				if (media) applyState(media, index, 0)
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

	const sectionHeight =
		SOLUTION_CARD_TOP + cards.length * SOLUTION_BLOCK_HEIGHT + 820

	return (
		<section
			ref={sectionRef}
			className='solutions-section relative z-[120] isolate -mt-20 overflow-hidden bg-black px-5 py-24 md:px-8 lg:-mt-[270px] lg:px-0 lg:py-0'
			style={{ minHeight: `${sectionHeight}px` }}
		>
			<div
				className='relative mx-auto max-w-[1436px]'
				style={{ height: `${sectionHeight}px` }}
			>
				<div className='lg:absolute lg:left-0 lg:top-[150px] lg:w-[857px]'>
					<h2 className='whitespace-pre-line text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-white md:text-[56px] lg:text-[65px] lg:leading-[73px]'>
						{title}
					</h2>
				</div>

				<p className='mt-10 max-w-[944px] text-[18px] font-medium leading-[1.24] text-[#C4C4C4] md:text-[21px] lg:absolute lg:left-0 lg:top-[366px] lg:mt-0 lg:text-[23px] lg:leading-[28px]'>
					{description}
				</p>

				{cards.map((card, index) => {
					const top = SOLUTION_CARD_TOP + index * SOLUTION_BLOCK_HEIGHT
					const expandedTop =
						SOLUTION_EXPANDED_GLOW_TOP + index * SOLUTION_BLOCK_HEIGHT
					const imageTop = SOLUTION_CARD_IMAGE_TOP + index * SOLUTION_BLOCK_HEIGHT

					return (
						<div key={card.title}>
							<SolutionCard
								card={card}
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
								top={imageTop}
							/>
						</div>
					)
				})}
			</div>
		</section>
	)
}

function SolutionCard({
	card,
	className = '',
	style,
}: {
	card: SolutionsContent['cards'][number]
	className?: string
	style?: CSSProperties
}) {
	return (
		<article
			className={`solutions-card-outline relative min-h-[680px] overflow-visible rounded-[35px] bg-black lg:h-[680px] lg:w-full ${className}`}
			style={style}
		>
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
		</article>
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
	top,
}: {
	mediaRef: (element: HTMLDivElement | null) => void
	image: string
	imageAlt: string
	top: number
}) {
	return (
		<div
			ref={mediaRef}
			className='solutions-transition-media relative z-20 mt-20 h-[391px] w-full overflow-hidden rounded-[35px] shadow-2xl shadow-black/40 lg:absolute lg:left-[371px] lg:top-[1059px] lg:mt-0 lg:h-[391px] lg:w-[694px]'
			style={{ top }}
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
