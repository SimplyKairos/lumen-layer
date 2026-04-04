import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'

type RevealState<T extends HTMLElement> = {
  ref: RefObject<T | null>
  visible: boolean
  reduceMotion: boolean
}

type RevealStyleOptions = {
  visible: boolean
  reduceMotion: boolean
  delay?: number
  duration?: number
  translateY?: number
  blur?: number
}

export function useScrollReveal<T extends HTMLElement>(): RevealState<T> {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => {
      const prefersReducedMotion = media.matches
      setReduceMotion(prefersReducedMotion)

      if (prefersReducedMotion) {
        setVisible(true)
      }
    }

    update()
    media.addEventListener('change', update)

    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (reduceMotion || visible || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          setVisible(true)
          observer.unobserve(entry.target)
        })
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [reduceMotion, visible])

  return { ref, visible, reduceMotion }
}

export function getRevealStyle({
  visible,
  reduceMotion,
  delay = 0,
  duration = 800,
  translateY = 24,
  blur = 6,
}: RevealStyleOptions): CSSProperties {
  if (reduceMotion) {
    return {
      opacity: 1,
      transform: 'translateY(0)',
      filter: 'blur(0)',
    }
  }

  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)'

  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${translateY}px)`,
    filter: visible ? 'blur(0)' : `blur(${blur}px)`,
    transition: [
      `opacity ${duration}ms ${easing} ${delay}ms`,
      `transform ${duration}ms ${easing} ${delay}ms`,
      `filter ${duration}ms ${easing} ${delay}ms`,
    ].join(', '),
    willChange: 'opacity, transform, filter',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
  }
}
