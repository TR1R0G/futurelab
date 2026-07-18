import type { MouseEvent } from 'react'

export function scrollToHashTarget(
	event: MouseEvent<HTMLAnchorElement>,
	hash: string,
) {
	if (!hash.startsWith('#')) return

	const target = document.getElementById(hash.slice(1))

	if (!target) return

	event.preventDefault()
	window.dispatchEvent(
		new CustomEvent('futurelab:smooth-scroll-to', {
			detail: { target },
		}),
	)
	window.history.pushState(null, '', hash)
}
