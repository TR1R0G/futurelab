'use client'

interface CTACardProps {
	text: string
	buttonText: string
	variant?: 'default' | 'wide' | 'project'
	href?: string
}

export function CTACard({
	text,
	buttonText,
	variant = 'default',
	href,
}: CTACardProps) {
	const isWide = variant === 'wide'
	const isProject = variant === 'project'
	const buttonClassName = `flex w-full items-center justify-center bg-[#0051FF] px-6 text-center text-white transition-transform hover:scale-[1.01] hover:bg-[#0050f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5CFF] active:scale-[0.99] rounded-[13px] ${
		isProject
			? 'mt-10 h-[55px] max-w-[452px] text-[20px] font-medium leading-[26px] md:mt-12 md:text-[22px] lg:mt-[65px]'
			: isWide
				? 'mt-10 h-[55px] max-w-[452px] text-[20px] font-medium leading-[26px] md:mt-12 md:text-[22px] lg:mt-[65px]'
				: 'mt-10 h-[55px] max-w-[452px] text-[20px] font-medium leading-[26px] md:mt-12 md:text-[22px] lg:mt-[65px]'
	}`

	return (
		<div
			className={`infrastructure-cta mx-auto flex w-[calc(100%_-_40px)] flex-col items-center bg-[#F2F3F7] text-center md:w-[calc(100%_-_64px)] lg:w-[1190px] ${
				isProject
					? 'mt-0 h-auto rounded-[30px] px-6 py-12 md:rounded-[34px] md:px-12 md:py-14 lg:h-[253px] lg:max-w-[1190px] lg:rounded-[35px] lg:px-[77px] lg:py-0'
					: isWide
						? 'mt-0 h-auto rounded-[30px] px-6 py-12 md:rounded-[34px] md:px-12 md:py-14 lg:h-[253px] lg:max-w-[1190px] lg:rounded-[35px] lg:px-[77px] lg:py-0'
						: 'mt-24 h-auto rounded-[30px] px-6 py-12 md:mt-32 md:rounded-[34px] md:px-12 md:py-14 lg:h-[253px] lg:rounded-[35px] lg:px-[56px] lg:py-0'
			}`}
		>
			<p
				className={`font-semibold text-[#202024] ${
					isProject
						? 'max-w-[1036px] text-[22px] font-semibold leading-[1.18] md:text-[28px] lg:mt-[53px] lg:text-[33px] lg:leading-[40px]'
					: isWide
						? 'max-w-[1036px] text-[22px] font-semibold leading-[1.18] md:text-[28px] lg:mt-[53px] lg:text-[33px] lg:leading-[40px]'
						: 'max-w-[1078px] text-[22px] font-semibold leading-[1.18] md:text-[28px] lg:mt-[53px] lg:w-[1078px] lg:text-[33px] lg:leading-[40px]'
				}`}
			>
				{text}
			</p>
			{href ? (
				<a href={href} className={buttonClassName}>
					{buttonText}
				</a>
			) : (
				<button type='button' className={buttonClassName}>
					{buttonText}
				</button>
			)}
		</div>
	)
}
