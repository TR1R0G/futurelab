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

export const seoCopy: Record<
	Language,
	{
		title: string
		description?: string
		keywords: string[]
		canonical?: string
		openGraph?: {
			title: string
			description: string
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
		keywords: seoKeywords,
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
		}
	}
> = {
	ru: {
		projectCta: {
			text: 'Обсудим и предложим решение под Ваш проект',
			buttonText: 'Обсудить проект',
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
			text: 'Let’s discuss your project and propose the right solution',
			buttonText: 'Discuss a project',
		},
		directionsCta: {
			text: 'Start your path in a digital profession through real projects',
			buttonText: 'Start learning',
		},
		experience: {
			title: 'Experience and trust confirmed by results',
			intro: [
				'Future Lab is part of NazzAR Innovation Group, with many years of experience delivering AR projects.',
				'We work with cultural, educational, and tourism projects, creating digital solutions for real spaces and large audiences.',
			],
			stats: [
				{
					value: 'Over 250',
					label:
						'implemented AR solutions\nin museums, exhibitions,\nand tourist locations',
				},
				{
					value: 'Over 1,000,000',
					label: 'users have interacted\nwith our solutions',
				},
				{
					value: '8+ years of experience',
					label: 'winners of international\ncompetitions',
				},
			],
			outro: [
				'Our experience is built on AR solutions for projects with high attendance and complex interaction scenarios.',
				'Explore projects where we have already successfully implemented AR and VR solutions.',
			],
			buttonText: 'View projects',
		},
		contact: {
			title: 'Any questions?',
			cardTitle: 'Contact us',
			cardText: 'Reach out with questions\nand partnership proposals!',
			emailTitle: 'Write to the futurelab team',
			telegramTitle: 'Start a chat in Telegram',
		},
		footer: {
			address: 'Uzbekistan, Samarkand, Amir Temur St., 162',
		},
	},
}
