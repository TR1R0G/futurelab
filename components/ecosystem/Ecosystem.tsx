'use client'

import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { EcosystemContent } from '@/lib/mdx'
import { useEffect, useRef } from 'react'
import { EcosystemCard } from './EcosystemCard'
import { StarIcon } from './EcosystemIcons'

interface EcosystemProps {
	title: string
	subtitle: string
	cards: EcosystemContent['cards']
}

export function Ecosystem({ title, subtitle, cards }: EcosystemProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const trackRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		const wrapper = wrapperRef.current
		const track = trackRef.current
		if (!section || !wrapper || !track) return

		const ctx = gsap.context(() => {
			const getScrollDistance = () => track.scrollWidth - wrapper.clientWidth

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
		}, section)

		return () => ctx.revert()
	}, [])

	return (
		<section
			ref={sectionRef}
			className='ecosystem-section relative h-screen w-full bg-black'
		>
			<div
				ref={wrapperRef}
				className='absolute left-4 right-4 top-[15vh] h-[65vh] overflow-hidden rounded-2xl bg-[#B24ECC] md:left-6 md:right-6 md:rounded-[32px] lg:left-8 lg:right-8 lg:rounded-[40px]'
			>
				<div
					ref={trackRef}
					className='ecosystem-track flex h-full w-max items-stretch gap-4 md:gap-8 lg:gap-12'
				>
					<div className='ecosystem-title-panel flex shrink-0 flex-col justify-between ml-40 py-12 md:pl-16 md:pr-8 md:py-16 lg:pl-20 lg:pr-12 lg:py-20'>
						<div>
							<h2 className='max-w-xl text-2xl font-bold leading-tight text-white md:text-3xl lg:text-7xl'>
								{title}
							</h2>
							<p className='mt-4 max-w-md text-base leading-relaxed text-white/85 md:mt-6 md:text-lg lg:text-2xl'>
								{subtitle}
							</p>
						</div>
						<StarIcon className='mt-8 h-14 w-14 text-white/90 md:mt-10 md:h-16 md:w-16 lg:h-20 lg:w-20' />
					</div>

					{cards.map(card => (
						<EcosystemCard key={card.title} card={card} />
					))}
				</div>
			</div>
		</section>
	)
}
