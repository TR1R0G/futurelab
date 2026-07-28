'use client'

import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { EcosystemContent } from '@/lib/mdx'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'

const ECOSYSTEM_BLOCK_HEIGHT = 717
const ECOSYSTEM_SCROLL_SLOWDOWN = 2.4
const ECOSYSTEM_COMPACT_SCROLL_SLOWDOWN = 3.4
const ECOSYSTEM_SCROLL_HOLD_RATIO = 0.22

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
		title === 'Экосистема FutureLab: обучение, практика и внедрение'
			? 'Экосистема FutureLab:\nобучение, практика и\nвнедрение'
			: title === 'Unified ecosystem for development and growth'
				? 'Unified ecosystem\nfor development\nand growth'
				: title

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		const wrapper = wrapperRef.current
		const track = trackRef.current
		if (!section || !wrapper || !track) return

		const getTravel = () => Math.max(0, track.scrollWidth - wrapper.clientWidth)
		const getPinDistance = (slowdown: number) =>
			Math.max(
				window.innerHeight * 1.2,
				getTravel() * slowdown,
			) / (1 - ECOSYSTEM_SCROLL_HOLD_RATIO)

		const media = gsap.matchMedia()
		const ctx = gsap.context(() => {
			media.add('(max-width: 719px)', () => {
				const timeline = gsap.timeline({
					scrollTrigger: {
						trigger: wrapper,
						start: 'center center',
						end: () => `+=${getPinDistance(ECOSYSTEM_COMPACT_SCROLL_SLOWDOWN)}`,
						pin: section,
						scrub: true,
						anticipatePin: 1,
						invalidateOnRefresh: true,
					},
				})

				timeline.to(track, {
					x: () => -getTravel(),
					ease: 'none',
					duration: 1 - ECOSYSTEM_SCROLL_HOLD_RATIO,
				})
				timeline.to({}, { duration: ECOSYSTEM_SCROLL_HOLD_RATIO })

				return () => {
					timeline.kill()
				}
			})

			media.add('(min-width: 720px) and (max-width: 1023px)', () => {
				const timeline = gsap.timeline({
					scrollTrigger: {
						trigger: wrapper,
						start: 'center center',
						end: () => `+=${getPinDistance(ECOSYSTEM_COMPACT_SCROLL_SLOWDOWN)}`,
						pin: section,
						scrub: true,
						anticipatePin: 1,
						invalidateOnRefresh: true,
					},
				})

				timeline.to(track, {
					x: () => -getTravel(),
					ease: 'none',
					duration: 1 - ECOSYSTEM_SCROLL_HOLD_RATIO,
				})
				timeline.to({}, { duration: ECOSYSTEM_SCROLL_HOLD_RATIO })

				return () => {
					timeline.kill()
				}
			})

			media.add('(min-width: 1024px)', () => {
				const timeline = gsap.timeline({
					scrollTrigger: {
						trigger: section,
						start: 'top top',
						end: () => `+=${getPinDistance(ECOSYSTEM_SCROLL_SLOWDOWN)}`,
						pin: true,
						scrub: true,
						anticipatePin: 1,
						invalidateOnRefresh: true,
					},
				})

				timeline.to(track, {
					x: () => -getTravel(),
					ease: 'none',
					duration: 1 - ECOSYSTEM_SCROLL_HOLD_RATIO,
				})
				timeline.to({}, { duration: ECOSYSTEM_SCROLL_HOLD_RATIO })

				return () => {
					timeline.kill()
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
				className='ecosystem-wrapper absolute left-0 top-0 h-full w-full overflow-hidden rounded-[28px] bg-[#B24ECC] md:rounded-[35px]'
			>
				<div ref={trackRef} className='ecosystem-track'>
					<div className='ecosystem-column ecosystem-intro-column'>
						<div className='ecosystem-intro-copy'>
							<h2 className='ecosystem-title font-heading whitespace-pre-line text-white'>
								{displayTitle}
							</h2>
							<p className='ecosystem-description text-white'>
								{subtitle}
							</p>
						</div>
						<EcosystemIcon
							src='/images/block3/icon1.svg'
							className='ecosystem-intro-icon'
						/>
					</div>

					{cards.map((card, index) => (
						<EcosystemFeature key={card.title} card={card} index={index} />
					))}
				</div>
			</div>
		</section>
	)
}

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
	return (
		<article
			className={`ecosystem-column ecosystem-feature-column ecosystem-feature-column-${
				index + 1
			}`}
		>
			<EcosystemIcon
				src={iconMap[card.icon] ?? iconMap.workspace}
				className='ecosystem-feature-icon'
			/>
			<h3 className='ecosystem-feature-title project-mini-heading text-white'>
				{card.title}
			</h3>
			<p className='ecosystem-feature-description text-white/85'>
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
			className={className}
			aria-hidden='true'
		/>
	)
}
