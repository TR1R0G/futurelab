'use client'

import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { EcosystemContent } from '@/lib/mdx'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'

const ECOSYSTEM_BLOCK_HEIGHT = 717
interface EcosystemProps {
	title: string
	subtitle: string
	cards: EcosystemContent['cards']
}

export function Ecosystem({ title, subtitle, cards }: EcosystemProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const trackRef = useRef<HTMLDivElement>(null)
	const displayTitle =
		title === 'Единая экосистема разработки и роста'
			? 'Единая экосистема\nразработки\nи роста'
			: title === 'Unified ecosystem for development and growth'
			? 'Unified ecosystem\nfor development\nand growth'
			: title

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		const wrapper = wrapperRef.current
		const track = trackRef.current
		if (!section || !wrapper || !track) return

		const media = gsap.matchMedia()
		const ctx = gsap.context(() => {
			media.add('(min-width: 1024px)', () => {
				const getScrollDistance = () =>
					Math.max(0, track.scrollWidth - wrapper.clientWidth)

				const tween = gsap.to(track, {
					x: () => -getScrollDistance(),
					ease: 'none',
					scrollTrigger: {
						trigger: section,
						start: 'top top',
						end: () => `+=${getScrollDistance()}`,
						pin: true,
						scrub: 1,
						anticipatePin: 1,
						invalidateOnRefresh: true,
					},
				})

				return () => {
					tween.kill()
				}
			})
		}, section)

		return () => {
			media.revert()
			ctx.revert()
		}
	}, [])

	return (
		<section
			ref={sectionRef}
			className='ecosystem-section relative h-auto w-full overflow-hidden bg-black py-16 lg:h-screen lg:py-0'
			style={{
				'--ecosystem-block-height': `${ECOSYSTEM_BLOCK_HEIGHT}px`,
			} as CSSProperties}
		>
			<div
				ref={wrapperRef}
				className='ecosystem-wrapper relative mx-5 overflow-hidden rounded-[28px] bg-[#B24ECC] md:mx-8 md:rounded-[35px] lg:absolute lg:left-0 lg:top-[calc((100svh-var(--ecosystem-block-height))/2)] lg:m-0 lg:h-[var(--ecosystem-block-height)] lg:w-full'
			>
				<div
					ref={trackRef}
					className='ecosystem-track relative min-h-[720px] w-full overflow-hidden rounded-[28px] bg-[#B24ECC] px-8 py-12 md:rounded-[35px] md:px-12 md:py-16 lg:h-[717px] lg:min-h-[717px] lg:w-[2781px] lg:p-0'
				>
					<div className='ecosystem-title-block lg:absolute lg:left-[242px] lg:top-[100px] lg:w-[615px]'>
						<h2 className='font-heading whitespace-pre-line text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-white md:text-[54px] lg:text-[65px] lg:leading-[73px]'>
							{displayTitle}
						</h2>
					</div>

					<p className='ecosystem-subtitle mt-8 max-w-[455px] text-[18px] font-medium leading-[1.35] text-white md:text-[21px] lg:absolute lg:left-[242px] lg:top-[359px] lg:mt-0 lg:text-[23px] lg:leading-[28px]'>
						{subtitle}
					</p>

					<EcosystemIcon
						src='/images/block3/icon1.svg'
						className='ecosystem-anchor-icon mt-16 lg:absolute lg:left-[242px] lg:top-[534px] lg:mt-0'
					/>

					<div className='mt-16 grid gap-12 md:grid-cols-3 lg:mt-0 lg:block'>
						{cards.map((card, index) => (
							<EcosystemFeature key={card.title} card={card} index={index} />
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

const desktopPositions = [
	{
		icon: 'lg:left-[980px] lg:top-[280px]',
		title: 'lg:left-[980px] lg:top-[419px] lg:w-[452px]',
		description: 'lg:left-[980px] lg:top-[533px] lg:w-[330px]',
	},
	{
		icon: 'lg:left-[1595px] lg:top-[100px]',
		title: 'lg:left-[1595px] lg:top-[240px] lg:w-[452px]',
		description: 'lg:left-[1595px] lg:top-[354px] lg:w-[452px]',
	},
	{
		icon: 'lg:left-[2210px] lg:top-[280px]',
		title: 'lg:left-[2210px] lg:top-[419px] lg:w-[348px]',
		description: 'lg:left-[2210px] lg:top-[533px] lg:w-[348px]',
	},
]

const iconMap: Record<string, string> = {
	workspace: '/images/block3/icon2.svg',
	training: '/images/block3/icon3.svg',
	products: '/images/block3/icon4.svg',
}

function EcosystemFeature({
	card,
	index,
}: {
	card: EcosystemContent['cards'][number]
	index: number
}) {
	const position = desktopPositions[index] ?? desktopPositions[0]

	return (
		<article className={`ecosystem-feature ecosystem-feature-${index} relative min-h-[280px] lg:static`}>
			<EcosystemIcon
				src={iconMap[card.icon] ?? iconMap.workspace}
				className={`ecosystem-feature-icon lg:absolute ${position.icon}`}
			/>
			<h3
				className={`ecosystem-feature-title mt-10 max-w-[452px] text-[28px] font-semibold leading-[1.18] text-white lg:absolute lg:mt-0 lg:text-[33px] lg:leading-[40px] ${position.title}`}
			>
				{card.title}
			</h3>
			<p
				className={`ecosystem-feature-description mt-7 max-w-[452px] text-[18px] font-medium leading-[1.35] text-white md:text-[21px] lg:absolute lg:mt-0 lg:text-[23px] lg:leading-[28px] ${position.description}`}
			>
				{card.description}
			</p>
		</article>
	)
}

function EcosystemIcon({
	src,
	className = '',
}: {
	src: string
	className?: string
}) {
	return (
		<Image
			src={src}
			alt=''
			width={83}
			height={84}
			className={`h-[83px] w-[83px] ${className}`}
			aria-hidden='true'
		/>
	)
}
