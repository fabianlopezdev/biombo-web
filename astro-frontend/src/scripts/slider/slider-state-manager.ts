/* sliderState.ts — single source of truth                          */

import { clamp, prefersReducedMotion } from '@/scripts/slider/slider-utilities'
import { throttle } from '@/scripts/core/dom-utilities'

export interface SliderState {
  current: number
  readonly count: number
  isAnimating: boolean
  readonly slider: HTMLDivElement
  readonly indicator: HTMLDivElement
  readonly progressBar: HTMLDivElement
  readonly prevBtn: HTMLButtonElement
  readonly nextBtn: HTMLButtonElement
  set(index: number): void
  destroy(): void
}

/* helper: enable / disable arrows + keyboard focus ---------------- */
function setArrowStates(state: SliderState) {
  const { prevBtn, nextBtn, current, count } = state
  const first = current === 0
  const last = current === count - 1

  prevBtn.disabled = first
  nextBtn.disabled = last
  prevBtn.tabIndex = first ? -1 : 0
  nextBtn.tabIndex = last ? -1 : 0
  prevBtn.classList.toggle('is-disabled', first)
  nextBtn.classList.toggle('is-disabled', last)
}

/* helper: position right arrow at viewport edge ------------------- */
function positionRightArrow(state: SliderState): void {
  const container = state.slider.parentElement
  if (!container) {
    console.warn('[SliderState] Container element not found')
    return
  }

  try {
    const containerRect = container.getBoundingClientRect()
    const viewportWidth = window.innerWidth

    // Calculate where the right arrow should be positioned
    // It should be at viewport edge minus padding, relative to the container
    const rightPosition = viewportWidth - containerRect.left - 16 - 48 // 16px from edge + 48px arrow width

    state.nextBtn.style.left = `${rightPosition}px`
    state.nextBtn.style.right = 'auto'
    state.nextBtn.classList.add('viewport-positioned')
  } catch (error) {
    console.error('[SliderState] Error positioning arrow:', error)
  }
}

export function createState(root: HTMLElement, count: number): SliderState {
  // Query helper with error handling
  const q = <T extends Element>(sel: string): T => {
    const el = root.querySelector<T>(sel)
    if (!el) {
      throw new Error(`[SliderState] Required element not found: ${sel}`)
    }
    return el
  }

  let slider: HTMLDivElement
  let indicator: HTMLDivElement
  let progressBar: HTMLDivElement
  let prevBtn: HTMLButtonElement
  let nextBtn: HTMLButtonElement

  try {
    slider = q<HTMLDivElement>('[data-slider]')
    indicator = q<HTMLDivElement>('.slider__indicator')
    progressBar = q<HTMLDivElement>('.slider__progress')
    prevBtn = q<HTMLButtonElement>('.slider__arrow--prev')
    nextBtn = q<HTMLButtonElement>('.slider__arrow--next')
  } catch (error) {
    console.error('[SliderState] Initialization failed:', error)
    // Return a minimal state object that won't crash
    return {
      current: 0,
      count: 0,
      isAnimating: false,
      slider: document.createElement('div'),
      indicator: document.createElement('div'),
      progressBar: document.createElement('div'),
      prevBtn: document.createElement('button'),
      nextBtn: document.createElement('button'),
      set() {},
      destroy() {},
    } as SliderState
  }

  /* ARIA & initial sizes ------------------------------------------ */
  const stepPct = 100 / count
  indicator.style.width = `${stepPct}%`
  if (prefersReducedMotion()) indicator.style.transition = 'none'

  progressBar.setAttribute('role', 'progressbar')
  progressBar.setAttribute('aria-valuemin', '0')
  progressBar.setAttribute('aria-valuemax', String(count - 1))
  progressBar.setAttribute('aria-valuenow', '0')
  prevBtn.setAttribute('aria-label', 'Previous image')
  nextBtn.setAttribute('aria-label', 'Next image')

  // Throttle resize handler for performance
  const handleResize = throttle(() => positionRightArrow(st), 100)

  const st: SliderState = {
    current: 0,
    count,
    isAnimating: false,
    slider,
    indicator,
    progressBar,
    prevBtn,
    nextBtn,

    set(i: number): void {
      const idx = clamp(i, 0, count - 1)
      if (idx === st.current) return
      st.current = idx

      indicator.style.transform = `translateX(${idx * 100}%)`
      progressBar.setAttribute('aria-valuenow', String(idx))
      setArrowStates(st)
    },

    destroy(): void {
      // Remove event listeners
      window.removeEventListener('resize', handleResize)

      // Reset styles
      indicator.style.transform = ''
      indicator.style.width = ''
      indicator.style.transition = ''
      nextBtn.style.left = ''
      nextBtn.style.right = ''
      nextBtn.classList.remove('viewport-positioned')

      // Reset ARIA attributes
      progressBar.removeAttribute('role')
      progressBar.removeAttribute('aria-valuemin')
      progressBar.removeAttribute('aria-valuemax')
      progressBar.removeAttribute('aria-valuenow')
      prevBtn.removeAttribute('aria-label')
      nextBtn.removeAttribute('aria-label')

      // Reset button states
      prevBtn.disabled = false
      nextBtn.disabled = false
      prevBtn.tabIndex = 0
      nextBtn.tabIndex = 0
      prevBtn.classList.remove('is-disabled')
      nextBtn.classList.remove('is-disabled')
    },
  }

  setArrowStates(st)
  positionRightArrow(st)

  // Reposition on window resize
  window.addEventListener('resize', handleResize)

  return st
}
