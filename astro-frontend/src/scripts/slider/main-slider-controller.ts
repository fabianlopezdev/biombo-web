/* aboutSlider.ts */

import { createState } from '@/scripts/slider/slider-state-manager'
import { initArrowNavigation } from '@/scripts/slider/slider-arrow-navigation'
import { initProgressBar } from '@/scripts/slider/slider-progress-indicator'
import { initDragToScroll } from '@/scripts/slider/slider-drag-handler'
import { initKeyboardNavigation } from '@/scripts/slider/slider-keyboard-navigation'

export type AboutSliderInstance = {
  destroy: () => void
}

interface HTMLElementWithSlider extends HTMLElement {
  __aboutSlider?: AboutSliderInstance
}

export function initAboutSlider(about: HTMLElementWithSlider, count: number) {
  const state = createState(about, count)
  const destroyFns = [
    initArrowNavigation(state),
    initProgressBar(state),
    initDragToScroll(state),
    initKeyboardNavigation(state)
  ]

  /* observe only the slider's parent for removal ----------------- */
  const parent = about.parentNode || document.body
  const mo = new MutationObserver((recs) => {
    const removed = recs.some((r) => Array.from(r.removedNodes).includes(about))
    if (!removed) return
    mo.disconnect()
    state.destroy() // Clean up state
    destroyFns.forEach((fn) => fn())
  })
  mo.observe(parent, { childList: true })

  return {
    destroy() {
      mo.disconnect()
      state.destroy() // Clean up state
      destroyFns.forEach((fn) => fn())
    },
  }
}

/* auto-boot -------------------------------------------------------- */
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll<HTMLElementWithSlider>('.about-slider').forEach((el) => {
      if (el.__aboutSlider) return
      const count = Number(el.dataset.imageCount || 0)
      el.__aboutSlider = initAboutSlider(el, count)
    })
  })
}
