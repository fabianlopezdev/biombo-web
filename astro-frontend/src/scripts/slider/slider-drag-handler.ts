import type { SliderState } from '@/scripts/slider/slider-state-manager'

/**
 * Enable click-and-drag or touch-swipe to scroll the slider.
 * Works alongside existing arrow and progress-bar logic.
 */
export function initDragToScroll(state: SliderState) {
  const { slider } = state
  const off: Array<() => void> = []

  let pointerId = -1
  let startX = 0
  let startScroll = 0
  let snapBackup = ''

  function onPointerDown(e: PointerEvent) {
    /* Only primary buttons / touches */
    if (e.button !== 0) return

    pointerId = e.pointerId
    startX = e.clientX
    startScroll = slider.scrollLeft
    snapBackup = slider.style.scrollSnapType // store existing value

    slider.setPointerCapture(pointerId)
    slider.style.scrollSnapType = 'none' // disable snap while dragging
    slider.classList.add('is-dragging')
    e.preventDefault() // stop image drag
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerId !== pointerId || e.buttons !== 1) return
    const dx = e.clientX - startX
    slider.scrollLeft = startScroll - dx // invert for LTR
  }

  function onPointerUp(e: PointerEvent) {
    if (e.pointerId !== pointerId) return
    slider.releasePointerCapture(pointerId)
    slider.style.scrollSnapType = snapBackup // restore snap
    slider.classList.remove('is-dragging')
    pointerId = -1
  }

  slider.addEventListener('pointerdown', onPointerDown, { passive: false })
  slider.addEventListener('pointermove', onPointerMove, { passive: false })
  slider.addEventListener('pointerup', onPointerUp)
  slider.addEventListener('pointercancel', onPointerUp)

  off.push(() => slider.removeEventListener('pointerdown', onPointerDown))
  off.push(() => slider.removeEventListener('pointermove', onPointerMove))
  off.push(() => slider.removeEventListener('pointerup', onPointerUp))
  off.push(() => slider.removeEventListener('pointercancel', onPointerUp))

  return () => off.forEach((fn) => fn())
}
