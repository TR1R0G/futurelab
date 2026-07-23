'use client'

import { CTACard } from '@/components/infrastructure/CTACard'
import { ExpandedImageScreen } from '@/components/media/ExpandedImageScreen'
import { LazyVideo } from '@/components/media/LazyVideo'
import type { DirectionsContent, Language } from '@/lib/mdx'
import { useEffect, useRef } from 'react'
import { DirectionsLight } from './DirectionsLight'

interface DirectionsProps {
	title: string
	chips: DirectionsContent['chips']
	statement: DirectionsContent['statement']
	ctaText: string
	ctaButton: string
	language: Language
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
	'AR | VR':
		'linear-gradient(90.31142938099543deg, rgb(75, 14, 91) 0%, rgb(169, 30, 131) 23.033%, rgb(253, 154, 52) 58.393%, rgb(249, 235, 68) 100%)',
	'Web-технологии':
		'linear-gradient(90.8273010027987deg, rgb(75, 14, 91) 0%, rgb(169, 30, 131) 21.739%, rgb(253, 154, 52) 57.973%, rgb(249, 235, 68) 100%)',
	'Web technologies':
		'linear-gradient(90.8273010027987deg, rgb(75, 14, 91) 0%, rgb(169, 30, 131) 21.739%, rgb(253, 154, 52) 57.973%, rgb(249, 235, 68) 100%)',
}

export function Directions({
	title,
	chips,
	statement,
	ctaText,
	ctaButton,
	language,
}: DirectionsProps) {
	const academyVideoSrc =
		language === 'en'
			? '/videos/academy/academy-en.mp4'
			: '/videos/academy/academy-ru.mp4'
	const desktopStatementLine =
		language === 'en'
			? {
					lead: 'program create',
					tail: 'a space',
				}
			: {
					lead: 'программа формируют',
					tail: 'пространство',
				}
	const tabletStatementLines =
		language === 'en'
			? [
					'By combining knowledge, practice, and new',
					'formats of interaction, the Academy and',
					'acceleration program create a space',
					'for sustainable professional growth,',
					'initiative development, and ideas able',
					'to adapt to the challenges of the future',
				]
			: [
					'Объединяя знания, практику и новые',
					'форматы взаимодействия, Академия и',
					'акселерационная программа формируют',
					'пространство для устойчивого',
					'профессионального роста, развития',
					'инициатив и появления идей, способных',
					'адаптироваться к вызовам будущего',
				]
	const mobileStatementLines =
		language === 'en'
			? [
					'By combining',
					'knowledge, practice',
					'and new formats',
					'of interaction,',
					'the Academy and',
					'acceleration program',
					'create a space',
					'for sustainable',
					'professional growth,',
					'initiative development,',
					'and ideas able',
					'to adapt to the',
					'challenges of the future',
				]
			: [
					'Объединяя знания,',
					'практику и новые',
					'форматы',
					'взаимодействия,',
					'Академия и',
					'акселерационная',
					'программа формируют',
					'пространство',
					'для устойчивого',
					'профессионального',
					'роста, развития',
					'инициатив и',
					'появления идей,',
					'способных',
					'адаптироваться к',
					'вызовам будущего',
				]

	return (
		<section className='directions-section relative z-[80] isolate overflow-visible bg-black px-5 pb-28 pt-6 md:px-8 md:pb-36 md:pt-8 min-[960px]:pt-40 lg:pb-44 lg:pt-52 xl:pt-36 min-[1600px]:pt-[380px]'>
			<div className='directions-board relative mx-auto h-auto max-w-[1436px] overflow-visible'>
				<div
					className='directions-board-gradient pointer-events-none absolute left-0 top-[7px] h-[391px] w-full rounded-[35px]'
					style={{
						backgroundImage:
							'linear-gradient(30.47874796640454deg, rgb(75, 14, 91) 2.4712%, rgb(169, 30, 131) 18.71%, rgb(253, 154, 52) 44.047%, rgb(249, 235, 68) 68.37%)',
					}}
					aria-hidden='true'
				/>
				<div className='directions-board-card relative min-h-[420px] overflow-visible rounded-[35px] bg-[#1D1D1D] p-8'>
					<h2 className='directions-board-title relative z-10 text-[30px] font-semibold leading-none text-white'>
						{title}
					</h2>

					<div className='directions-chip-layer absolute inset-0 z-10'>
						{chips.map((chip, index) => (
							<div
								key={chip.label}
								className={`directions-chip-slot directions-chip-slot-${index} absolute flex items-center justify-center ${chipLayout[index].outer}`}
							>
								<DirectionChip chip={chip} className={chipLayout[index].chip} />
							</div>
						))}
					</div>
				</div>
			</div>

			<div className='directions-statement sticky top-[12svh] isolate mx-auto mt-12 max-w-[1436px] text-center md:mt-16 min-[960px]:mt-44 lg:mt-52'>
				<DirectionsLight className='left-1/2 top-[calc(38svh_-_377.84px)] z-0 block max-[719px]:left-[calc(50%_-_32px)] max-[719px]:top-[33px] max-[719px]:[--directions-light-blur:75px] max-[719px]:[--directions-light-scale:.447] min-[720px]:max-[959px]:[--directions-light-blur:100px] min-[720px]:max-[959px]:[--directions-light-scale:.72] min-[960px]:[--directions-light-scale:1]' />

				<div className='directions-statement-copy relative isolate z-10 text-[32px] font-semibold leading-[1.18] tracking-normal text-white md:text-[37px] md:leading-[1.24] min-[960px]:max-[1369px]:text-[clamp(31px,3.3vw,44px)] min-[960px]:max-[1369px]:leading-[1.42] min-[1370px]:text-[55px] min-[1370px]:leading-[78px]'>
					<span className='directions-inline-image pointer-events-none absolute left-1/2 top-[155px] z-20 hidden h-[91px] w-[52px] translate-x-[90px] overflow-hidden rounded-[8px] min-[1370px]:block'>
						<AcademyInlineVideo
							poster={statement.imageSrc}
							videoSrc={academyVideoSrc}
						/>
					</span>
					<div className='directions-statement-large-desktop hidden min-[1370px]:block'>
						{statement.linesBeforeImage.map(line => (
							<p key={line} className='directions-statement-line'>
								{line}
							</p>
						))}

						<p className='directions-statement-line'>
							{statement.imageLead}
							<span
								className='directions-inline-image-spacer mx-5 inline-block h-0 w-[52px] md:mx-7'
								aria-hidden='true'
							/>
							{statement.imageTail}
						</p>

						{statement.linesAfterImage.map(line => (
							<p key={line} className='directions-statement-line'>
								{line}
							</p>
						))}
					</div>

					<div className='directions-statement-desktop hidden min-[960px]:block min-[1370px]:hidden'>
						{statement.linesBeforeImage.map(line => (
							<p
								key={line}
								className='directions-statement-line whitespace-nowrap'
							>
								{line}
							</p>
						))}

						<p className='directions-statement-line whitespace-nowrap'>
							{desktopStatementLine.lead}
							<span className='directions-inline-image relative z-20 mx-5 inline-flex translate-y-[0.18em] overflow-hidden rounded-[8px] align-baseline shadow-[0_10px_34px_rgba(0,0,0,0.45)] md:mx-7'>
								<AcademyInlineVideo
									poster={statement.imageSrc}
									videoSrc={academyVideoSrc}
									className='h-[91px] w-[52px]'
								/>
							</span>
							{desktopStatementLine.tail}
						</p>

						{statement.linesAfterImage.map(line => (
							<p
								key={line}
								className='directions-statement-line whitespace-nowrap'
							>
								{line}
							</p>
						))}
					</div>

					<div className='directions-statement-tablet hidden min-[720px]:block min-[960px]:hidden'>
						{tabletStatementLines.map(line => (
							<p key={line} className='directions-statement-line'>
								{line}
							</p>
						))}

						<div className='mt-9 flex justify-center md:mt-12'>
							<span className='directions-inline-image relative z-20 inline-flex overflow-hidden rounded-[8px] shadow-[0_10px_34px_rgba(0,0,0,0.45)]'>
								<AcademyInlineVideo
									poster={statement.imageSrc}
									videoSrc={academyVideoSrc}
									className='h-[92px] w-[52px] md:h-[132px] md:w-[76px]'
								/>
							</span>
						</div>
					</div>

					<div className='directions-statement-mobile min-[720px]:hidden'>
						{mobileStatementLines.map(line => (
							<p key={line} className='directions-statement-line'>
								{line}
							</p>
						))}

						<div className='mt-9 flex justify-center'>
							<span className='directions-inline-image relative z-20 inline-flex overflow-hidden rounded-[8px] shadow-[0_10px_34px_rgba(0,0,0,0.45)]'>
								<AcademyInlineVideo
									poster={statement.imageSrc}
									videoSrc={academyVideoSrc}
									className='h-[92px] w-[52px]'
								/>
							</span>
						</div>
					</div>
				</div>
			</div>

			<ExpandedImageScreen
				src={statement.imageSrc}
				videoSrc={academyVideoSrc}
				alt={statement.imageAlt}
				className='-mt-[40svh]'
				movingTextSelector='.directions-statement-copy'
				fadingElementSelector='.directions-statement > .directions-statement-light'
				sourceSelector='.directions-inline-image'
				showGradient={false}
			/>

			<div className='directions-post-image relative z-[200] isolate flex min-h-[40svh] flex-col justify-center overflow-hidden'>
				<div
					className='pointer-events-none absolute inset-0 z-0'
					aria-hidden='true'
				/>
				<div
					className='pointer-events-none absolute inset-x-[-20px] top-[-24svh] z-0 h-[80svh]  md:inset-x-[-32px]'
					aria-hidden='true'
				/>
				<div
					className='pointer-events-none absolute inset-x-0 bottom-[-60svh] z-0 h-[60svh] '
					aria-hidden='true'
				/>
				<div className='relative z-10 w-full'>
					<CTACard variant='wide' text={ctaText} buttonText={ctaButton} />
				</div>

				<div
					className='relative z-10 mx-auto mt-[90px] h-1 w-[calc(100%_-_40px)] max-w-[1436px] rounded-sm bg-[linear-gradient(90deg,#4B0E5B_0%,#A91E83_29.9%,#FD9A34_65.67%,#F9EB44_100%)] md:mt-[110px] md:w-[calc(100%_-_64px)] lg:mt-[130px]'
					aria-hidden='true'
				/>
			</div>
		</section>
	)
}

function AcademyInlineVideo({
	poster,
	videoSrc,
	className = 'h-full w-full',
}: {
	poster: string
	videoSrc: string
	className?: string
}) {
	const videoRef = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		void video.play().catch(() => undefined)
	}, [videoSrc])

	return (
		<LazyVideo
			ref={videoRef}
			className={`${className} block object-cover`}
			aria-hidden='true'
			autoPlay
			data-manual-sound='true'
			disablePictureInPicture
			loop
			muted
			playsInline
			poster={poster}
			preload='metadata'
			sourceSrc={videoSrc}
		/>
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
