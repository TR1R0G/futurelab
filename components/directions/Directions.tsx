'use client'

import { CTACard } from '@/components/infrastructure/CTACard'
import { FadeInImage } from '@/components/media/FadeInImage'
import { ExpandedImageScreen } from '@/components/media/ExpandedImageScreen'
import { gsap, registerGsapPlugins } from '@/lib/gsap'
import type { DirectionsContent } from '@/lib/mdx'
import { useEffect, useRef } from 'react'

interface DirectionsProps {
	title: string
	chips: DirectionsContent['chips']
	statement: DirectionsContent['statement']
	ctaText: string
	ctaButton: string
}

const chipLayout = [
	{
		outer: 'left-[592px] top-[236px] h-[145.529px] w-[187.99px]',
		chip: 'w-[174px] rotate-[-27.71deg]',
	},
	{
		outer: 'left-[755px] top-[301px] h-[73px] w-[249px]',
		chip: 'w-[249px]',
	},
	{
		outer: 'left-[836px] top-[166px] h-[129.824px] w-[455.636px]',
		chip: 'w-[450px] rotate-[-7.33deg]',
	},
	{
		outer: 'left-[1004px] top-[209px] h-[181.184px] w-[429.344px]',
		chip: 'w-[425px] rotate-[-15.1deg]',
	},
	{
		outer: 'left-[1127px] top-[60px] h-[138.6px] w-[286.442px]',
		chip: 'w-[277px] rotate-[14.17deg]',
	},
] as const

const gradientByLabel: Partial<Record<string, string>> = {
	'AR / VR':
		'linear-gradient(90.31142938099543deg, rgb(75, 14, 91) 0%, rgb(169, 30, 131) 23.033%, rgb(253, 154, 52) 58.393%, rgb(249, 235, 68) 100%)',
	'Web-технологии':
		'linear-gradient(90.8273010027987deg, rgb(75, 14, 91) 0%, rgb(169, 30, 131) 21.739%, rgb(253, 154, 52) 57.973%, rgb(249, 235, 68) 100%)',
}

export function Directions({
	title,
	chips,
	statement,
	ctaText,
	ctaButton,
}: DirectionsProps) {
	const sectionRef = useRef<HTMLElement>(null)

	useEffect(() => {
		registerGsapPlugins()

		const section = sectionRef.current
		if (!section) return

		const media = gsap.matchMedia()
		const ctx = gsap.context(() => {
			media.add('(prefers-reduced-motion: no-preference)', () => {
				gsap.from('.directions-statement-line', {
					y: 52,
					opacity: 0,
					duration: 0.9,
					stagger: 0.09,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: '.directions-statement',
						start: 'top 72%',
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
			className='directions-section relative z-[80] isolate overflow-visible bg-black px-5 pb-28 pt-20 md:px-8 md:pb-36 md:pt-24 lg:pb-44 lg:pt-20 xl:pt-[380px]'
		>
			<div className='directions-board relative mx-auto h-auto max-w-[1436px] overflow-visible md:h-[398px]'>
				<div
					className='pointer-events-none absolute left-0 top-[7px] hidden h-[391px] w-full rounded-[35px] md:block'
					style={{
						backgroundImage:
							'linear-gradient(30.47874796640454deg, rgb(75, 14, 91) 2.4712%, rgb(169, 30, 131) 18.71%, rgb(253, 154, 52) 44.047%, rgb(249, 235, 68) 68.37%)',
					}}
					aria-hidden='true'
				/>
				<div className='relative min-h-[420px] overflow-visible rounded-[35px] bg-[#1D1D1D] p-8 md:h-[391px] md:min-h-0 md:p-0'>
					<h2 className='directions-board-title relative z-10 text-[30px] font-semibold leading-none text-white md:absolute md:left-10 md:top-10 md:text-[33px] md:leading-10'>
						{title}
					</h2>

					<div className='mt-12 flex flex-wrap gap-4 md:hidden'>
						{chips.map(chip => (
							<DirectionChip key={chip.label} chip={chip} />
						))}
					</div>

					<div className='hidden md:block'>
						{chips.map((chip, index) => (
							<div
								key={chip.label}
								className={`directions-chip-slot directions-chip-slot-${index} absolute flex items-center justify-center ${chipLayout[index].outer}`}
							>
								<DirectionChip
									chip={chip}
									className={chipLayout[index].chip}
								/>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className='directions-statement sticky top-[12svh] mx-auto mt-32 max-w-[1436px] text-center md:mt-44 lg:mt-52'>
				<div
					className='directions-statement-light pointer-events-none absolute -top-[228px] left-1/2 hidden h-[755.68px] w-[872.67px] lg:block'
					style={{
						filter: 'blur(175px)',
						transform: 'translateX(calc(-50% - 70.67px)) rotate(-12.33deg)',
					}}
					aria-hidden='true'
				>
					<span
						className='absolute h-[700.62px] w-[231.6px] bg-[#3FA1FC]'
						style={{
							left: '225.23px',
							top: '183.61px',
							transform: 'rotate(55.69deg)',
						}}
					/>
					<span
						className='absolute h-[674.38px] w-[231.6px] bg-[#FCCC01]'
						style={{
							left: '107.48px',
							top: '449.7px',
							transform: 'matrix(-0.17, 0.99, 0.99, 0.17, 0, 0)',
						}}
					/>
					<span
						className='absolute h-[578.17px] w-[293.53px] bg-[#DA7FCE]'
						style={{
							left: '107.48px',
							top: '117.86px',
							transform: 'matrix(-0.7, 0.71, 0.71, 0.7, 0, 0)',
						}}
					/>
				</div>

				<div className='directions-statement-copy relative z-10 text-[32px] font-semibold leading-[1.48] tracking-normal text-white md:text-[44px] lg:text-[55px] lg:leading-[78px]'>
					<span className='directions-inline-image pointer-events-none absolute left-1/2 top-[155px] z-20 hidden h-[91px] w-[52px] translate-x-[90px] overflow-hidden rounded-[8px] lg:block'>
						<FadeInImage
							src={statement.imageSrc}
							alt={statement.imageAlt}
							fill
							sizes='52px'
							className='object-cover'
							unoptimized
						/>
					</span>
					{statement.linesBeforeImage.map(line => (
						<p key={line} className='directions-statement-line'>
							{line}
						</p>
					))}

					<p className='directions-statement-line'>
						{statement.imageLead}
						<span
							className='directions-inline-image-spacer mx-5 inline-block h-0 w-[38px] md:mx-7 md:w-[52px]'
							aria-hidden='true'
						/>
						<span className='directions-inline-image mx-5 inline-flex translate-y-[0.18em] overflow-hidden rounded-[8px] align-baseline shadow-[0_10px_34px_rgba(0,0,0,0.45)] md:mx-7 lg:hidden'>
							<FadeInImage
								src={statement.imageSrc}
								alt={statement.imageAlt}
								width={58}
								height={88}
								className='h-[58px] w-[38px] object-cover md:h-[78px] md:w-[52px] lg:h-[91px] lg:w-[52px]'
								unoptimized
							/>
						</span>
						{statement.imageTail}
					</p>

					{statement.linesAfterImage.map(line => (
						<p key={line} className='directions-statement-line'>
							{line}
						</p>
					))}
				</div>
			</div>

			<ExpandedImageScreen
				src={statement.imageSrc}
				alt={statement.imageAlt}
				className='-mt-[58svh]'
				movingTextSelector='.directions-statement-copy'
				sourceSelector='.directions-inline-image'
			/>

			<div className='directions-post-image relative z-[100] flex min-h-[36svh] flex-col justify-center bg-black pb-20 pt-20 md:pb-24 md:pt-24 lg:pb-28 lg:pt-28'>
				<CTACard
					variant='wide'
					text={ctaText}
					buttonText={ctaButton}
				/>

				<div
					className='mx-auto mt-[90px] h-1 w-[calc(100%_-_40px)] max-w-[1436px] rounded-sm bg-[linear-gradient(90deg,#4B0E5B_0%,#A91E83_29.9%,#FD9A34_65.67%,#F9EB44_100%)] md:mt-[110px] md:w-[calc(100%_-_64px)] lg:mt-[130px]'
					aria-hidden='true'
				/>
			</div>
		</section>
	)
}

function DirectionChip({
	chip,
	className = 'w-full',
}: {
	chip: DirectionsContent['chips'][number]
	className?: string
}) {
	const baseClass =
		'directions-chip flex h-[58px] items-center justify-center rounded-full px-7 text-center text-[20px] font-medium leading-[1.7] md:h-[73px] md:rounded-[36.5px] md:text-[23px]'

	if (chip.variant === 'gradient') {
		return (
			<div
				className={`${baseClass} ${className} text-black`}
				style={{ backgroundImage: gradientByLabel[chip.label] }}
			>
				{chip.label}
			</div>
		)
	}

	if (chip.variant === 'outline') {
		return (
			<div
				className={`${baseClass} ${className} border-2 border-[#EBEBEB] bg-[#1D1D1D] text-[#EBEBEB]`}
			>
				{chip.label}
			</div>
		)
	}

	return (
		<div className={`${baseClass} ${className} bg-[#F2F3F7] text-[#4C4C4C]`}>
			{chip.label}
		</div>
	)
}
