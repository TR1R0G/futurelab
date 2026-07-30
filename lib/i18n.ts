import type { Language } from '@/lib/mdx'

const seoKeywords = [
	'FutureLab',
	'NazzAR',
	'CreativeTech',
	'AI',
	'AR',
	'VR',
	'WebAR',
	'3D',
	'GameDev',
	'Holography',
	'цифровой туризм',
	'музейные технологии',
	'иммерсивные продукты',
	'Самарканд',
	'Узбекистан',
]

const englishSeoKeywords =
	'FutureLab, NazzAR, CreativeTech, AI, AR, VR, WebAR, 3D, GameDev, Holography, digital tourism, museum technologies, immersive products, Samarkand, Uzbekistan'

export const seoCopy: Record<
	Language,
	{
		title: string
		description?: string
		keywords: string | string[]
		canonical?: string
		openGraph?: {
			title: string
			description: string
		}
		structuredData?: {
			description: string
			address: {
				streetAddress: string
				addressLocality: string
				addressCountry: string
			}
		}
	}
> = {
	ru: {
		title:
			'FutureLab by NazzAR — CreativeTech-хаб для AI, AR/VR, 3D и иммерсивных digital-продуктов',
		description:
			'FutureLab by NazzAR — CreativeTech-хаб в Самарканде: обучение, практика и разработка AI, AR/VR, WebAR, 3D, Holography и digital-продуктов для музеев, туризма и бизнеса.',
		keywords: seoKeywords,
		canonical: 'https://future-lab.uz/ru',
		openGraph: {
			title:
				'FutureLab by NazzAR — CreativeTech Hub для AI, AR/VR, 3D и Holography',
			description:
				'Обучение, проектная практика и разработка иммерсивных digital-продуктов для музеев, туризма, образования и бизнеса.',
		},
	},
	en: {
		title:
			'FutureLab by NazzAR — CreativeTech Hub for AI, AR/VR, 3D & Immersive Digital Products',
		description:
			'FutureLab by NazzAR — a CreativeTech hub in Samarkand: education, practice, and development of AI, AR/VR, WebAR, 3D, Holography, and digital products for museums, tourism, and business.',
		keywords: englishSeoKeywords,
		canonical: 'https://future-lab.uz/en',
		openGraph: {
			title:
				'FutureLab by NazzAR — CreativeTech Hub for AI, AR/VR, 3D & Holography',
			description:
				'Education, project practice, and development of immersive digital products for museums, tourism, education, and business.',
		},
		structuredData: {
			description:
				'CreativeTech hub in Samarkand for education, practice, and development of AI, AR/VR, WebAR, 3D, Holography, and immersive digital products.',
			address: {
				streetAddress: 'Amir Temur Street, 162',
				addressLocality: 'Samarkand',
				addressCountry: 'UZ',
			},
		},
	},
}

export const uiCopy: Record<
	Language,
	{
		projectCta: {
			text: string
			buttonText: string
		}
		directionsCta: {
			text: string
			buttonText: string
		}
		experience: {
			title: string
			intro: string[]
			stats: {
				value: string
				label: string
			}[]
			outro: string[]
			buttonText: string
			aboutText?: string
		}
		contact: {
			title: string
			cardTitle: string
			cardText: string
			emailTitle: string
			telegramTitle: string
		}
		footer: {
			address: string
			copyright?: string
		}
	}
> = {
	ru: {
		projectCta: {
			text: 'Расскажите о задаче — мы предложим формат digital-решения под ваш проект',
			buttonText: 'Обсудить решение',
		},
		directionsCta: {
			text: 'Начните путь в CreativeTech через обучение, воркшопы и проектную практику',
			buttonText: 'Начать обучение',
		},
		experience: {
			title: 'Доверие, подтверждённое внедрениями',
			intro: [
				'FutureLab развивается внутри экосистемы NazzAR Innovation Group — среды, где объединяются образование, технологии, digital-продукты и практические проекты в CreativeTech, AI, AR/VR, 3D, Holography и smart-туризме.',
				'Мы работаем с музеями, образовательными организациями, туристическими объектами и бизнесом, создавая digital-решения для реальных пространств, посетителей и клиентов.',
			],
			stats: [
				{
					value: 'Более 250',
					label:
						'AR/WebAR-решений для музеев, выставок, туристических объектов и бизнеса',
				},
				{
					value: 'Более 1 000 000',
					label: 'пользовательских взаимодействий с решениями NazzAR',
				},
				{
					value: '8+ лет опыта команды',
					label: 'победители международных конкурсов',
				},
			],
			outro: [
				'Наш опыт сформирован на проектах с высокой посещаемостью, многоязычным контентом, сложными сценариями взаимодействия и реальным использованием в музейных, туристических и коммерческих пространствах.',
				'Посмотрите проекты NazzAR, где технологии уже работают для музеев, туризма, образования и бизнеса.',
			],
			buttonText: 'Посмотреть проекты',
		},
		contact: {
			title: 'Остались вопросы?',
			cardTitle: 'Свяжитесь с командой FutureLab',
			cardText:
				'Расскажите, что вам нужно из направлений FutureLab и мы предложим подходящий формат.',
			emailTitle: 'Написать команде FutureLab',
			telegramTitle: 'Написать в Telegram',
		},
		footer: {
			address: 'Узбекистан, г. Самарканд, ул. Амира Темура, 162',
		},
	},
	en: {
		projectCta: {
			text: 'Tell us about your task — we will suggest a digital solution format for your project',
			buttonText: 'Discuss a solution',
		},
		directionsCta: {
			text: 'Start your path in CreativeTech through learning, workshops, and project practice',
			buttonText: 'Apply for selection',
		},
		experience: {
			title: 'Trust confirmed by implementations',
			intro: [
				'FutureLab is developing within the NazzAR Innovation Group ecosystem — an environment where education, technology, digital products, and practical projects come together in CreativeTech, AI, AR/VR, 3D, Holography, and smart tourism.',
				'We work with museums, educational organizations, tourist sites, and businesses, creating digital solutions for real spaces, visitors, and customers.',
			],
			stats: [
				{
					value: 'More than 250',
					label:
						'AR/WebAR solutions for museums, exhibitions, tourist sites, and businesses',
				},
				{
					value: 'More than 1,000,000',
					label: 'user interactions with NazzAR solutions',
				},
				{
					value: '8+ years of team experience',
					label: 'winners of international competitions',
				},
			],
			outro: [
				'Our experience has been shaped by projects with high visitor traffic, multilingual content, complex interaction scenarios, and real-world use in museum, tourism, and commercial spaces.',
				'View NazzAR projects where technologies are already working for museums, tourism, education, and business.',
			],
			buttonText: 'View projects',
			aboutText:
				'FutureLab by NazzAR — a CreativeTech hub where education, practice, and development come together in one ecosystem. We create digital products for museums, tourism, education, and business: WebAR guides, virtual experts, 3D content, interactive exhibitions, AI services, holographic solutions, and web platforms.',
		},
		contact: {
			title: 'Have questions?',
			cardTitle: 'Contact the FutureLab team',
			cardText:
				'Tell us what you need from FutureLab’s directions, and we will suggest a suitable format.',
			emailTitle: 'Email the FutureLab team',
			telegramTitle: 'Message us on Telegram',
		},
		footer: {
			address: 'Uzbekistan, Samarkand, Amir Temur Street, 162',
			copyright:
				'© 2026 FutureLab by NazzAR Innovation. All rights reserved.',
		},
	},
}
