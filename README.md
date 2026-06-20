# Future Lab

Главный лендинг студии цифровых технологий и развития молодых специалистов.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **GSAP** + ScrollTrigger + SplitText
- **Lenis** smooth scroll
- **MDX** для редактируемого контента

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Структура

- `app/page.tsx` — серверный компонент страницы, загружает MDX
- `components/hero/` — клиентские компоненты Hero с анимациями GSAP
- `components/providers/SmoothScroll.tsx` — инициализация Lenis + GSAP ticker
- `content/hero.mdx` — редактируемый контент первого экрана
- `lib/gsap.ts` — регистрация плагинов GSAP
