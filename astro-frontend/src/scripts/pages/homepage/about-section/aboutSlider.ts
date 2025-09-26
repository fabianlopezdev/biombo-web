/* aboutSlider.ts */

import { createState } from '@/scripts/pages/homepage/about-section/sliderState'
import { initArrowNavigation } from '@/scripts/pages/homepage/about-section/sliderArrow'
import { initProgressBar } from '@/scripts/pages/homepage/about-section/sliderProgressBar'
import { initDragToScroll } from '@/scripts/pages/homepage/about-section/sliderDrag'

export type AboutSliderInstance = {
  destroy: () => void
}

interface HTMLElementWithSlider extends HTMLElement {
  __aboutSlider?: AboutSliderInstance
}

export function initAboutSlider(about: HTMLElementWithSlider, count: number) {
  const state = createState(about, count)
  const destroyFns = [initArrowNavigation(state), initProgressBar(state), initDragToScroll(state)]

  /* observe only the slider’s parent for removal ----------------- */
  const parent = about.parentNode || document.body
  const mo = new MutationObserver((recs) => {
    const removed = recs.some((r) => Array.from(r.removedNodes).includes(about))
    if (!removed) return
    mo.disconnect()
    destroyFns.forEach((fn) => fn())
  })
  mo.observe(parent, { childList: true })

  return {
    destroy() {
      mo.disconnect()
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
