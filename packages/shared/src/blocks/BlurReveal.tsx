import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'

const EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
const INITIAL_PAUSE_MS = 200

interface BlurRevealTextProps {
  text: string
  startDelay?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
  editProps?: Record<string, any>
  disabled?: boolean
}

export function BlurRevealText({
  text,
  startDelay = 0,
  as: Element = 'span',
  className,
  style,
  editProps,
  disabled,
}: BlurRevealTextProps) {
  const [active, setActive] = useState(false)

  const words = useMemo(() => {
    if (disabled || !text) return null
    const split = text.split(' ')
    const total = split.length
    return split.map((word, index) => {
      const progress = total === 0 ? 0 : index / total
      const exponentialDelay = Math.pow(progress, 0.8) * 0.5
      const baseDelay = index * 0.06
      const microVariation = (Math.random() - 0.5) * 0.05
      return {
        text: word,
        duration: 2.2 + Math.cos(index * 0.3) * 0.3,
        delay: baseDelay + exponentialDelay + microVariation,
        blur: 12 + Math.floor(Math.random() * 8),
        scale: 0.9 + Math.sin(index * 0.2) * 0.05,
      }
    })
  }, [text, disabled])

  useEffect(() => {
    if (disabled) return
    const t = setTimeout(() => setActive(true), INITIAL_PAUSE_MS)
    return () => clearTimeout(t)
  }, [disabled])

  if (disabled || !words) {
    return (
      <Element {...editProps} className={className} style={style}>
        {text}
      </Element>
    )
  }

  return (
    <Element {...editProps} className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            transitionProperty: 'filter, transform, opacity',
            transitionDuration: `${word.duration}s`,
            transitionDelay: `${startDelay + word.delay}s`,
            transitionTimingFunction: EASING,
            opacity: active ? 1 : 0,
            filter: active
              ? 'blur(0px) brightness(1)'
              : `blur(${word.blur}px) brightness(0.6)`,
            transform: active
              ? 'translateY(0) scale(1) rotateX(0deg)'
              : `translateY(20px) scale(${word.scale}) rotateX(-15deg)`,
            marginRight: '0.35em',
            willChange: 'filter, transform, opacity',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          {word.text}
        </span>
      ))}
    </Element>
  )
}

interface BlurRevealWrapProps {
  children: ReactNode
  startDelay?: number
  duration?: number
  className?: string
  style?: CSSProperties
  disabled?: boolean
}

export function BlurRevealWrap({
  children,
  startDelay = 0,
  duration = 1.6,
  className,
  style,
  disabled,
}: BlurRevealWrapProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (disabled) return
    const t = setTimeout(() => setActive(true), INITIAL_PAUSE_MS)
    return () => clearTimeout(t)
  }, [disabled])

  if (disabled) {
    return <div className={className} style={style}>{children}</div>
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        transitionProperty: 'filter, transform, opacity',
        transitionDuration: `${duration}s`,
        transitionDelay: `${startDelay}s`,
        transitionTimingFunction: EASING,
        opacity: active ? 1 : 0,
        filter: active ? 'blur(0px) brightness(1)' : 'blur(14px) brightness(0.6)',
        transform: active ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
        willChange: 'filter, transform, opacity',
      }}
    >
      {children}
    </div>
  )
}
