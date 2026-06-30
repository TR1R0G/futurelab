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
			className='ecosystem-section relative w-full overflow-hidden bg-black'
			style={
				{
					'--ecosystem-block-height': `${ECOSYSTEM_BLOCK_HEIGHT}px`,
				} as CSSProperties
			}
		>
			<div
				ref={wrapperRef}
				className='ecosystem-wrapper absolute left-0 overflow-hidden rounded-[28px] bg-[#B24ECC] md:rounded-[35px] lg:rounded-[35px]'
			>
				<div
					ref={trackRef}
					className='ecosystem-track relative overflow-hidden rounded-[28px] bg-[#B24ECC] md:rounded-[35px] lg:rounded-[35px]'
				>
					<div className='absolute left-[135px] top-[54px] w-[260px] md:left-[155px] md:top-[86px] md:w-[420px] lg:left-[242px] lg:top-[100px] lg:w-[615px]'>
						<h2 className='font-heading whitespace-pre-line text-[21px] font-bold leading-[1.05] tracking-normal text-white md:text-[40px] md:leading-[44px] lg:text-[65px] lg:leading-[73px]'>
							{displayTitle}
						</h2>
					</div>

					<p className='absolute left-[135px] top-[188px] w-[260px] text-[11px] font-medium leading-[1.22] text-white md:left-[155px] md:top-[240px] md:w-[430px] md:text-[16px] md:leading-[20px] lg:left-[242px] lg:top-[359px] lg:w-[455px] lg:text-[23px] lg:leading-[28px]'>
						{subtitle}
					</p>

					<EcosystemIcon
						src='/images/block3/icon1.svg'
						className='absolute left-[135px] top-[330px] md:left-[155px] md:top-[365px] lg:left-[242px] lg:top-[534px]'
					/>

					<div>
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
	const compact = [
		{
			icon: 'left-[420px] top-[72px] md:left-[532px] md:top-[86px]',
			title:
				'left-[420px] top-[155px] w-[190px] md:left-[532px] md:top-[203px] md:w-[260px]',
			description:
				'left-[420px] top-[222px] w-[180px] md:left-[532px] md:top-[300px] md:w-[260px]',
		},
		{
			icon: 'left-[710px] top-[72px] md:left-[878px] md:top-[86px]',
			title:
				'left-[710px] top-[155px] w-[220px] md:left-[878px] md:top-[203px] md:w-[310px]',
			description:
				'left-[710px] top-[222px] w-[220px] md:left-[878px] md:top-[300px] md:w-[310px]',
		},
		{
			icon: 'left-[1050px] top-[72px] md:left-[1274px] md:top-[86px]',
			title:
				'left-[1050px] top-[155px] w-[190px] md:left-[1274px] md:top-[203px] md:w-[260px]',
			description:
				'left-[1050px] top-[222px] w-[190px] md:left-[1274px] md:top-[300px] md:w-[260px]',
		},
	][index] ?? {
		icon: 'left-[420px] top-[72px] md:left-[532px] md:top-[86px]',
		title:
			'left-[420px] top-[155px] w-[190px] md:left-[532px] md:top-[203px] md:w-[260px]',
		description:
			'left-[420px] top-[222px] w-[180px] md:left-[532px] md:top-[300px] md:w-[260px]',
	}

	return (
		<article className='static'>
			<EcosystemIcon
				src={iconMap[card.icon] ?? iconMap.workspace}
				className={`absolute ${compact.icon} ${position.icon}`}
			/>
			<h3
				className={`absolute text-[14px] font-semibold leading-[1.16] text-white md:text-[24px] md:leading-[29px] lg:text-[33px] lg:leading-[40px] ${compact.title} ${position.title}`}
			>
				{card.title}
			</h3>
			<p
				className={`absolute text-[11px] font-medium leading-[1.22] text-white md:text-[16px] md:leading-[20px] lg:text-[23px] lg:leading-[28px] ${compact.description} ${position.description}`}
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
			className={`h-[42px] w-[42px] md:h-[64px] md:w-[64px] lg:h-[83px] lg:w-[83px] ${className}`}
			aria-hidden='true'
		/>
	)
}
