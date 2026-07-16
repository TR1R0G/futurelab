import type { CSSProperties } from 'react'

interface DirectionsLightProps {
	className?: string
	style?: CSSProperties
}

export function DirectionsLight({
	className = '',
	style,
}: DirectionsLightProps) {
	return (
		<div
			className={`directions-statement-light pointer-events-none absolute h-[755.68px] w-[872.67px] ${className}`}
			style={{
				filter: 'blur(160px)',
				transform: 'translateX(-50%) rotate(-12.33deg)',
				...style,
			}}
			aria-hidden='true'
		>
			<span
				className='absolute h-[700.62px] w-[231.6px] bg-[#3FA1FC]'
				style={{
					left: '425.23px',
					top: '83.61px',
					transform: 'rotate(55.69deg)',
				}}
			/>
			<span
				className='absolute h-[674.38px] w-[231.6px] bg-[#FCCC01]'
				style={{
					left: '307.48px',
					top: '180px',
					transform: 'matrix(-0.17, 0.99, 0.99, 0.17, 0, 0)',
				}}
			/>
			<span
				className='absolute h-[578.17px] w-[293.53px] bg-[#DA7FCE]'
				style={{
					left: '207.48px',
					top: '37.86px',
					transform: 'matrix(-0.7, 0.71, 0.71, 0.7, 0, 0)',
				}}
			/>
		</div>
	)
}
