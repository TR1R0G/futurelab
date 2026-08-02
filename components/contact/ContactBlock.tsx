import Image from 'next/image'

interface ContactBlockProps {
	title: string
	cardTitle: string
	cardText: string
	emailTitle: string
	telegramTitle: string
}

export function ContactBlock({
	title,
	cardTitle,
	cardText,
	emailTitle,
	telegramTitle,
}: ContactBlockProps) {
	return (
		<section
			id='contacts'
			className='contact-section relative overflow-hidden bg-white py-24 text-black md:py-28 min-[1440px]:py-0'
		>
			<ContactGlow />

			<div className='contact-content section-shell relative z-10'>
				<h2 className='font-heading text-[42px] font-bold leading-[1.08] tracking-normal text-black md:text-[50px] min-[1440px]:w-[698px] min-[1440px]:text-[55px] min-[1440px]:leading-[62px]'>
					{title}
				</h2>

				<div className='contact-card grid w-full rounded-[30px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:rounded-[35px]'>
					<div className='contact-card-intro'>
						<h3 className='project-mini-heading text-[26px] font-semibold leading-none text-black md:text-[30px]'>
							{cardTitle}
						</h3>
						<p className='contact-card-description max-w-[412px] text-[21px] font-medium leading-[1.7] text-[#4C4C4C] md:text-[23px]'>
							{cardText.split('\n').map((line, index) => (
								<span key={line}>
									{line}
									{index < cardText.split('\n').length - 1 ? <br /> : null}
								</span>
							))}
						</p>
					</div>

					<ContactItem
						className='contact-item-mail'
						icon='mail'
						title={emailTitle}
						value='contact@future-lab.uz'
						href='mailto:contact@future-lab.uz'
					/>

					<ContactItem
						className='contact-item-telegram'
						icon='telegram'
						title={telegramTitle}
						value='@nazzar_group'
						href='https://t.me/nazzar_group'
					/>
				</div>
			</div>
		</section>
	)
}

function ContactGlow() {
	return (
		<div
			className='contact-glow pointer-events-none absolute left-1/2 top-[378px] z-0 hidden h-[943.61px] w-[1825.34px] -translate-x-1/2 blur-[200px] min-[1440px]:block'
			style={{ marginLeft: '-1.33px' }}
			aria-hidden='true'
		>
			<span className='absolute left-[1000px] h-[837px] w-[444px] rounded-full bg-[#3FA1FC] rotate-[68.02deg] saturate-[10] brightness-[0.45]' />
			<span className='absolute brightness-[1.1] left-[286px] -top-0 h-[837px] w-[444px] rounded-full bg-[#FCCC01] [transform:matrix(-0.37,0.93,0.93,0.37,0,0)] saturate-[2.9]' />
			<span className='absolute left-[695px] top-0 h-[837px] w-[444px] rounded-full bg-[#DA7FCE] [transform:matrix(-0.84,0.55,0.55,0.84,0,0)] saturate-[2.2] brightness-[0.7]' />
		</div>
	)
}

function ContactItem({
	className,
	icon,
	title,
	value,
	href,
}: {
	className?: string
	icon: 'mail' | 'telegram'
	title: string
	value: string
	href?: string
}) {
	const isExternal = href?.startsWith('http')

	return (
		<div className={`contact-item ${className ?? ''}`}>
			{icon === 'mail' ? (
				<div className='flex h-[55px] w-[55px] items-center justify-center rounded-[13px] bg-[#0051FF]'>
					<MailIcon />
				</div>
			) : (
				<Image
					src='/images/telegram.svg'
					alt=''
					width={55}
					height={55}
					className='h-[55px] w-[55px]'
					aria-hidden='true'
				/>
			)}
			<p className='project-mini-heading mt-[26px] text-[21px] font-medium leading-[26px] text-[#4C4C4C] md:text-[22px]'>
				{title}
			</p>
			<p className='project-mini-heading mt-[13px] text-[21px] font-medium leading-[26px] text-[#4C4C4C] md:text-[22px]'>
				{href ? (
					<a
						href={href}
						target={isExternal ? '_blank' : undefined}
						rel={isExternal ? 'noopener noreferrer' : undefined}
						className='transition-colors hover:text-[#0051FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0051FF]'
					>
						{value}
					</a>
				) : (
					value
				)}
			</p>
		</div>
	)
}

function MailIcon() {
	return (
		<svg
			width='29'
			height='22'
			viewBox='0 0 29 22'
			fill='none'
			aria-hidden='true'
		>
			<path
				d='M3.2 0.6H25.8C27.3 0.6 28.5 1.8 28.5 3.3V18.7C28.5 20.2 27.3 21.4 25.8 21.4H3.2C1.7 21.4 0.5 20.2 0.5 18.7V3.3C0.5 1.8 1.7 0.6 3.2 0.6Z'
				fill='white'
			/>
			<path
				d='M3.8 4.1L13.2 12.2C14 12.9 15.1 12.9 15.9 12.2L25.3 4.1'
				fill='#0051FF'
			/>
		</svg>
	)
}
