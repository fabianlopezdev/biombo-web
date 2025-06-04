/* eslint-disable @typescript-eslint/unbound-method */
/* sliderProgressBar.ts */

import type { SliderState } from '@/scripts/pages/homepage/about-section/sliderState'
import { throttle, clamp, scrollToIndex } from '@/scripts/pages/homepage/about-section/sliderUtils'

export function initProgressBar(state: SliderState) {
  const { slider, progressBar, indicator, count, set } = state
  const off: (() => void)[] = []

  /* click → pick segment ----------------------------------------- */
  function onClick(e: MouseEvent) {
    if (e.target === indicator) return
    const r = progressBar.getBoundingClientRect()
    const pct = (e.clientX - r.left) / r.width
    const idx = clamp(Math.floor(pct * count), 0, count - 1)
    scrollToIndex(state, idx, true)
    set(idx)
  }
  progressBar.addEventListener('click', onClick)
  off.push(() => progressBar.removeEventListener('click', onClick))

  /* user drag sync ------------------------------------------------ */
  const sync = throttle(() => {
    if (state.isAnimating) return
    const max = slider.scrollWidth - slider.clientWidth
    const pct = max ? slider.scrollLeft / max : 0
    const idx = clamp(Math.round(pct * (count - 1)), 0, count - 1)
    set(idx)
  })
  slider.addEventListener('scroll', sync)
  off.push(() => slider.removeEventListener('scroll', sync))

  return () => off.forEach((fn) => fn())
}
