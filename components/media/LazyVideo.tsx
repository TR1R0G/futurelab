import {
	forwardRef,
	useEffect,
	useRef,
	useState,
	type VideoHTMLAttributes,
} from 'react'

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'preload'> & {
	sourceSrc: string
	sourceType?: string
	eager?: boolean
	preload?: 'none' | 'metadata' | 'auto'
	loadMargin?: string
}

export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(
	function LazyVideo(
		{
			sourceSrc,
			sourceType = 'video/mp4',
			eager = false,
			preload = 'metadata',
			loadMargin = '900px 0px',
			children,
			...props
		},
		forwardedRef,
	) {
		const localRef = useRef<HTMLVideoElement | null>(null)
		const [shouldLoad, setShouldLoad] = useState(eager)

		const setRefs = (node: HTMLVideoElement | null) => {
			localRef.current = node

			if (typeof forwardedRef === 'function') {
				forwardedRef(node)
			} else if (forwardedRef) {
				forwardedRef.current = node
			}
		}

		useEffect(() => {
			if (eager) {
				setShouldLoad(true)
				return
			}

			const video = localRef.current
			if (!video) return

			const observer = new IntersectionObserver(
				entries => {
					if (entries.some(entry => entry.isIntersecting)) {
						setShouldLoad(true)
						observer.disconnect()
					}
				},
				{ rootMargin: loadMargin },
			)

			observer.observe(video)

			return () => observer.disconnect()
		}, [eager, loadMargin])

		useEffect(() => {
			if (!shouldLoad) return

			const video = localRef.current
			if (!video) return

			video.load()

			if (video.autoplay) {
				void video.play().catch(() => undefined)
			}
		}, [shouldLoad, sourceSrc])

		return (
			<video ref={setRefs} preload={shouldLoad ? preload : 'none'} {...props}>
				{shouldLoad ? <source src={sourceSrc} type={sourceType} /> : null}
				{children}
			</video>
		)
	},
)
