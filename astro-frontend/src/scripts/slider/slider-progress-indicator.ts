/* eslint-disable @typescript-eslint/unbound-method */
/* sliderProgressBar.ts */

import type { SliderState } from '@/scripts/slider/slider-state-manager'
import { throttle, clamp, scrollToIndex } from '@/scripts/slider/slider-utilities'

export function initProgressBar(state: SliderState) {
  const { slider, progressBar, indicator, count, set } = state
  const off: (() => void)[] = []

  let isDragging = false
  let originalSnapType = ''

  /* click → pick segment ----------------------------------------- */
  function onClick(e: MouseEvent) {
    if (e.target === indicator || isDragging) return
    const r = progressBar.getBoundingClientRect()
    const pct = (e.clientX - r.left) / r.width
    const idx = clamp(Math.floor(pct * count), 0, count - 1)
    scrollToIndex(state, idx, true)
    set(idx)
  }
  progressBar.addEventListener('click', onClick)
  off.push(() => progressBar.removeEventListener('click', onClick))

  /* indicator drag handlers --------------------------------------- */
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return // Only primary button

    isDragging = true

    indicator.setPointerCapture(e.pointerId)
    indicator.style.cursor = 'grabbing'
    progressBar.style.cursor = 'grabbing'

    // Disable transitions for immediate feedback
    indicator.style.transition = 'none'

    // Disable scroll-snap for smooth dragging
    originalSnapType = slider.style.scrollSnapType
    slider.style.scrollSnapType = 'none'

    e.preventDefault()
    e.stopPropagation()
  }

  function onPointerMove(e: PointerEvent) {
    if (!isDragging) return

    const barRect = progressBar.getBoundingClientRect()
    const barWidth = barRect.width

    // Calculate new position as percentage (0-1)
    const currentX = e.clientX
    const pct = clamp((currentX - barRect.left) / barWidth, 0, 1)

    // Update indicator position immediately
    const indicatorOffset = pct * (count - 1)
    indicator.style.transform = `translateX(${indicatorOffset * 100}%)`

    // Scroll the slider to match
    const max = slider.scrollWidth - slider.clientWidth
    const targetScroll = pct * max
    slider.scrollLeft = targetScroll

    // Update progress bar aria value
    const idx = clamp(Math.round(pct * (count - 1)), 0, count - 1)
    progressBar.setAttribute('aria-valuenow', String(idx))

    e.preventDefault()
  }

  function onPointerUp(e: PointerEvent) {
    if (!isDragging) return

    isDragging = false
    indicator.releasePointerCapture(e.pointerId)
    indicator.style.cursor = ''
    progressBar.style.cursor = ''

    // Re-enable transitions
    indicator.style.transition = ''

    // Restore scroll-snap
    slider.style.scrollSnapType = originalSnapType

    // Wait for snap to complete, then sync indicator position
    // Using scrollend event if supported, otherwise fallback to timeout
    const syncAfterSnap = () => {
      const max = slider.scrollWidth - slider.clientWidth
      const pct = max ? slider.scrollLeft / max : 0
      const idx = clamp(Math.round(pct * (count - 1)), 0, count - 1)

      // Call set to update state
      set(idx)

      // Force update indicator transform even if index hasn't changed
      // This is needed because we've been manually manipulating the transform during drag
      indicator.style.transform = `translateX(${idx * 100}%)`
    }

    // Check if scrollend event is supported
    if ('onscrollend' in slider) {
      // Use scrollend event for precise timing
      const handleScrollEnd = () => {
        syncAfterSnap()
        slider.removeEventListener('scrollend', handleScrollEnd)
      }
      slider.addEventListener('scrollend', handleScrollEnd)
    } else {
      // Fallback: wait for snap animation to complete (typically ~300ms)
      setTimeout(syncAfterSnap, 350)
    }

    e.preventDefault()
    e.stopPropagation()
  }

  // Add drag event listeners to indicator
  indicator.addEventListener('pointerdown', onPointerDown)
  indicator.addEventListener('pointermove', onPointerMove)
  indicator.addEventListener('pointerup', onPointerUp)
  indicator.addEventListener('pointercancel', onPointerUp)

  // Also listen on document for moves outside indicator
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)

  off.push(() => {
    indicator.removeEventListener('pointerdown', onPointerDown)
    indicator.removeEventListener('pointermove', onPointerMove)
    indicator.removeEventListener('pointerup', onPointerUp)
    indicator.removeEventListener('pointercancel', onPointerUp)
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  })

  /* user drag sync ------------------------------------------------ */
  const sync = throttle(() => {
    if (state.isAnimating || isDragging) return // Don't sync while dragging indicator
    const max = slider.scrollWidth - slider.clientWidth
    const pct = max ? slider.scrollLeft / max : 0
    const idx = clamp(Math.round(pct * (count - 1)), 0, count - 1)
    set(idx)
  })
  slider.addEventListener('scroll', sync)
  off.push(() => slider.removeEventListener('scroll', sync))

  return () => off.forEach((fn) => fn())
}
