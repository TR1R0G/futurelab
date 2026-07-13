import type { Language } from '@/lib/mdx'

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
			text: 'Начните путь в цифровой профессии через реальные проекты',
			buttonText: 'Начать обучение',
		},
		experience: {
			title: 'Опыт и доверие, подтверждённые результатами',
			intro: [
				'Future Lab входит в группу NazzAR Innovation Group с многолетним опытом реализации AR-проектов.',
				'Мы работаем с культурными, образовательными и туристическими проектами, создавая цифровые решения для реальных пространств и большой аудитории.',
			],
			stats: [
				{
					value: 'Более 250',
					label:
						'реализованных AR-решений\nв музеях, выставках\nи туристических объектах',
				},
				{
					value: 'Более 1 000 000',
					label: 'пользователей\nвзаимодействовали с нашими\nрешениями',
				},
				{
					value: '8+ лет опыта',
					label: 'победители международных\nконкурсов',
				},
			],
			outro: [
				'Наш опыт сформирован на реализации AR-решений для проектов с высокой посещаемостью и сложными сценариями взаимодействия.',
				'Посмотрите проекты, где мы уже успешно внедрили AR и VR-решения.',
			],
			buttonText: 'Перейти',
		},
		contact: {
			title: 'Остались вопросы?',
			cardTitle: 'Свяжитесь с нами',
			cardText: 'Обращайтесь по вопросам\nи предложениям о сотрудничестве!',
			emailTitle: 'Написать команде futurelab',
			telegramTitle: 'Начать чат в Telegram',
		},
		footer: {
			address: 'Узбекистан, Самарканд, ул. Амира Темура, 162',
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
