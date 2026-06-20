# Agent Notes

## Project

Next.js 16 App Router site with a GSAP-animated landing page.

## Conventions

- Keep animation-heavy components as client components (`"use client"`).
- Register GSAP plugins inside `useEffect` via `lib/gsap.ts`.
- Lenis is wired to GSAP's ticker in `components/providers/SmoothScroll.tsx`.
- Content for the hero is stored in `content/hero.mdx` frontmatter.
- Tailwind v4 uses CSS-first configuration in `app/globals.css`.

## Build

```bash
npm run build
```
