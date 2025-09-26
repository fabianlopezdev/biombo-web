/* sliderState.ts — single source of truth                          */

import { clamp, prefersReducedMotion } from '@/scripts/pages/homepage/about-section/sliderUtils'

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
function positionRightArrow(state: SliderState) {
  const container = state.slider.parentElement
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  const viewportWidth = window.innerWidth

  // Calculate where the right arrow should be positioned
  // It should be at viewport edge minus padding, relative to the container
  const rightPosition = viewportWidth - containerRect.left - 16 - 48 // 16px from edge + 48px arrow width

  state.nextBtn.style.left = `${rightPosition}px`
  state.nextBtn.style.right = 'auto'
  state.nextBtn.classList.add('viewport-positioned')
}

export function createState(root: HTMLElement, count: number): SliderState {
  const q = <T extends Element>(sel: string) => root.querySelector<T>(sel)!

  const slider = q<HTMLDivElement>('[data-slider]')
  const indicator = q<HTMLDivElement>('.slider__indicator')
  const progressBar = q<HTMLDivElement>('.slider__progress')
  const prevBtn = q<HTMLButtonElement>('.slider__arrow--prev')
  const nextBtn = q<HTMLButtonElement>('.slider__arrow--next')

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

  const st: SliderState = {
    current: 0,
    count,
    isAnimating: false,
    slider,
    indicator,
    progressBar,
    prevBtn,
    nextBtn,

    set(i) {
      const idx = clamp(i, 0, count - 1)
      if (idx === st.current) return
      st.current = idx

      indicator.style.transform = `translateX(${idx * 100}%)`
      progressBar.setAttribute('aria-valuenow', String(idx))
      setArrowStates(st)
    },
  }

  setArrowStates(st)
  positionRightArrow(st)

  // Reposition on window resize
  window.addEventListener('resize', () => positionRightArrow(st))

  return st
}
