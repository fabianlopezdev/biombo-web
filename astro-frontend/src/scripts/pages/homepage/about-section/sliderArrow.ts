/* eslint-disable @typescript-eslint/unbound-method */
/* sliderArrow.ts */

import type { SliderState } from '@/scripts/pages/homepage/about-section/sliderState'
import { clamp, scrollToIndex } from '@/scripts/pages/homepage/about-section/sliderUtils'

export function initArrowNavigation(state: SliderState) {
  const { prevBtn, nextBtn, count, set } = state
  const off: (() => void)[] = []

  function jump(step: -1 | 1) {
    const target = clamp(state.current + step, 0, count - 1)
    if (target === state.current) return

    /* 1. move indicator & update aria immediately */
    set(target)

    /* 2. hand off smooth-scroll + arrow re-enable to util */
    scrollToIndex(state, target)
  }

  function onPrev() {
    jump(-1)
  }
  function onNext() {
    jump(+1)
  }

  prevBtn.addEventListener('click', onPrev)
  nextBtn.addEventListener('click', onNext)
  off.push(() => prevBtn.removeEventListener('click', onPrev))
  off.push(() => nextBtn.removeEventListener('click', onNext))

  return () => off.forEach((fn) => fn())
}
