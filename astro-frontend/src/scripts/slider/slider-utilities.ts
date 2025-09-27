/* ------------------------------------------------------------------ */
/*  Utilities                                                         */
/* ------------------------------------------------------------------ */

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

/* throttle: leading+trailing, default 40 ms ------------------------ */
export function throttle<T extends (...a: unknown[]) => void>(
  fn: T,
  delay = 40,
): (...a: Parameters<T>) => void {
  let last = 0
  let trailing: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    const now = Date.now()
    const remain = delay - (now - last)
    if (remain <= 0) {
      if (trailing) clearTimeout(trailing)
      last = now
      fn(...args)
    } else if (!trailing) {
      trailing = setTimeout(() => {
        trailing = null
        last = Date.now()
        fn(...args)
      }, remain)
    }
  }
}

/* prefers-reduced-motion helper ------------------------------------ */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------------ */
/*  Programmatic smooth-scroll helper                                 */
/* ------------------------------------------------------------------ */

import type { SliderState } from '@/scripts/slider/slider-state-manager'

export function scrollToIndex(state: SliderState, index: number, smooth = true): void {
  const { slider, count, prevBtn, nextBtn } = state
  const max = slider.scrollWidth - slider.clientWidth
  const pct = count > 1 ? index / (count - 1) : 0
  const target = pct * max

  /* flag: JS-initiated motion */
  state.isAnimating = true

  /* keep arrows disabled until scroll completes */
  prevBtn.disabled = nextBtn.disabled = true
  prevBtn.tabIndex = nextBtn.tabIndex = -1

  const enableArrows = () => {
    state.isAnimating = false
    prevBtn.disabled = state.current === 0
    nextBtn.disabled = state.current === count - 1
    prevBtn.tabIndex = prevBtn.disabled ? -1 : 0
    nextBtn.tabIndex = nextBtn.disabled ? -1 : 0
  }

  if ('onscrollend' in slider) {
    slider.addEventListener('scrollend', enableArrows, { once: true })
  } else {
    setTimeout(enableArrows, 450) // fallback for old Chromium
  }

  slider.scrollTo({
    left: target,
    behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
  })
}
