import Image from 'next/image'
import type { ReactNode } from 'react'

export function Footer({ address }: { address: string }) {
	return (
		<footer className='footer-section font-onest relative h-auto bg-black px-16 py-16 text-white md:px-8 lg:h-[385px] lg:px-28 lg:py-0'>
			<div className='footer-inner mx-12 max-w-[1436px] lg:relative lg:h-full'>
				<Image
					src='/images/logo.svg'
					alt='futurelab by NAZZAR Innovation'
					width={264}
					height={55}
					className='footer-logo h-auto w-[210px] lg:absolute lg:left-0 lg:top-[94px]'
					priority={false}
				/>

				<div className='footer-contact-list mt-12 space-y-[11px] text-[16px] leading-[30px] text-white md:mt-14 lg:absolute lg:right-0 lg:top-24 lg:mt-0'>
					<FooterContact icon={<LocationIcon />}>{address}</FooterContact>
					<FooterContact icon={<MailIcon />} href='mailto:info@future-lab.uz'>
						info@future-lab.uz
					</FooterContact>
				</div>

				<div className='footer-line mt-16 h-px w-full bg-[#2F2F2F] lg:absolute lg:left-0 lg:top-[283px] lg:mt-0' />

				<p className='footer-copyright mt-6 text-center text-[16px] leading-[30px] text-[#949494] lg:absolute lg:left-1/2 lg:top-[310px] lg:mt-0 lg:w-[149px] lg:-translate-x-1/2'>
					© 2026 nazzar.tech
				</p>
			</div>
		</footer>
	)
}

function FooterContact({
	icon,
	href,
	children,
}: {
	icon: ReactNode
	href?: string
	children: ReactNode
}) {
	return (
		<div className='flex items-center gap-2 whitespace-nowrap'>
			<span className='flex h-[18px] w-[17px] items-center justify-center text-white'>
				{icon}
			</span>
			{href ? (
				<a
					href={href}
					className='transition-colors hover:text-[#0051FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'
				>
					{children}
				</a>
			) : (
				<span>{children}</span>
			)}
		</div>
	)
}

function LocationIcon() {
	return (
		<svg
			width='15'
			height='22'
			viewBox='0 0 15 22'
			fill='none'
			aria-hidden='true'
		>
			<path
				d='M0 7.73353C0 12.9595 5.65239 16.9716 7.5 22C9.34761 16.9716 15 12.9595 15 7.73353C15 3.46224 11.6423 0 7.5 0C3.35827 0 0 3.46224 0 7.73353ZM10.9479 7.73353C10.9479 9.69728 9.40386 11.2894 7.49941 11.2894C5.59497 11.2894 4.0509 9.69728 4.0509 7.73353C4.0509 5.76979 5.59497 4.17764 7.49941 4.17764C9.40386 4.17764 10.9479 5.76979 10.9479 7.73353Z'
				fill='currentColor'
			/>
		</svg>
	)
}

function MailIcon() {
	return (
		<svg
			width='18'
			height='14'
			viewBox='0 0 18 14'
			fill='none'
			aria-hidden='true'
		>
			<path
				d='M1.8 0.5H16.2C17.2 0.5 18 1.3 18 2.3V11.7C18 12.7 17.2 13.5 16.2 13.5H1.8C0.8 13.5 0 12.7 0 11.7V2.3C0 1.3 0.8 0.5 1.8 0.5ZM1.9 2.4L8.1 7.3C8.6 7.7 9.4 7.7 9.9 7.3L16.1 2.4H1.9Z'
				fill='currentColor'
			/>
		</svg>
	)
}
