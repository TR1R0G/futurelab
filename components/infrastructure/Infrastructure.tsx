'use client'

import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { InfrastructureContent } from '@/lib/mdx'
import { useEffect, useRef } from 'react'
import { CTACard } from './CTACard'
import { ImageGallery } from './ImageGallery'
import { InfrastructureCard } from './InfrastructureCard'

interface InfrastructureProps {
	title: string
	subtitle: string
	ctaText: string
	ctaButton: string
	cards: InfrastructureContent['cards']
}

export function Infrastructure({
	title,
	subtitle,
	ctaText,
	ctaButton,
	cards,
}: InfrastructureProps) {
	const sectionRef = useRef<HTMLElement>(null)

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		if (!section) return

		const media = gsap.matchMedia()

		const ctx = gsap.context(() => {
			media.add('(prefers-reduced-motion: no-preference)', () => {
				gsap
					.timeline({
						scrollTrigger: {
							trigger: section,
							start: 'top 72%',
							once: true,
						},
					})
					.from('.infrastructure-heading > *', {
						y: 44,
						opacity: 0,
						duration: 0.8,
						stagger: 0.12,
						ease: 'power3.out',
					})
					.from(
						'.infrastructure-card',
						{
							y: 70,
							opacity: 0,
							rotate: index => [-2, 1.5, -1][index] ?? 0,
							duration: 0.85,
							stagger: 0.14,
							ease: 'power3.out',
						},
						'-=0.42',
					)

				gsap.from('.infrastructure-cta', {
					y: 54,
					opacity: 0,
					scale: 0.97,
					duration: 0.9,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: '.infrastructure-cta',
						start: 'top 88%',
						once: true,
					},
				})

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
			className='infrastructure-section w-full overflow-hidden bg-black pb-24 md:pb-32 lg:pb-40'
		>
			<div className='infrastructure-heading mx-auto max-w-[1436px] px-5 md:px-8 xl:px-0'>
				<h2 className='font-heading max-w-3xl text-[36px] font-bold leading-[1.08] text-white md:text-5xl lg:max-w-[800px] lg:text-[56px]'>
					{title}
				</h2>
				<p className='mt-8 max-w-2xl text-base font-medium text-white/60 md:text-lg'>
					{subtitle}
				</p>
			</div>

			<div className='infrastructure-cards mx-auto mt-12 grid max-w-[1436px] gap-8 px-5 md:mt-16 md:gap-10 md:px-8 min-[1200px]:grid-cols-3 xl:px-0'>
				{cards.map(card => (
					<InfrastructureCard key={card.title} card={card} />
				))}
			</div>

			<ImageGallery />

			<CTACard text={ctaText} buttonText={ctaButton} />

			<div className='infrastructure-separator-wrap py-24 md:py-32'>
				<div
					className='infrastructure-separator mx-auto h-[5px] w-[calc(100%_-_40px)] max-w-[1436px] rounded-full bg-[linear-gradient(90deg,#4B0E5B_0%,#A91E83_29.9%,#FD9A34_65.67%,#F9EB44_100%)] shadow-[0_0_18px_rgba(253,154,52,0.28)] md:w-[calc(100%_-_64px)]'
					aria-hidden='true'
				/>
			</div>
		</section>
	)
}
