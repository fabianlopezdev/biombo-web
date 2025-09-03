/**
 * Initializes horizontal scrolling functionality for the homepage layout.
 * Handles wheel events to enable horizontal scrolling with vertical mouse wheel.
 */

// Self-executing script for horizontal scroll functionality
document.addEventListener('DOMContentLoaded', () => {
  // Skip horizontal scroll initialization on touch devices
  const isTouch = document.documentElement.classList.contains('touch-device')
  if (isTouch) {
    return
  }

  // Type definitions for window
  interface ExtendedWindow extends Window {
    horizontalScrollCleanup?: () => void
  }
  const win = window as ExtendedWindow

  const container = document.getElementById('horizontal-container') as HTMLElement
  if (!container) return

  // Constants - calculated once
  const SCROLL_TOLERANCE = 0.5
  const NOMINAL_TOP_TOLERANCE = 5

  let headerHeight = 0

  // Simple, reliable header height calculation
  const updateHeaderHeight = () => {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--header-height')

    if (cssVar.endsWith('px')) {
      headerHeight = parseFloat(cssVar)
    } else if (cssVar.endsWith('rem')) {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
      headerHeight = parseFloat(cssVar) * rootFontSize
    } else {
      // Fallback to actual header element
      const header = document.querySelector('header')
      headerHeight = header?.offsetHeight || 0
    }
  }

  updateHeaderHeight()

  const handleWheel = (e: WheelEvent) => {
    const rect = container.getBoundingClientRect()

    // Quick boundary check
    if (e.clientY < rect.top || e.clientY > rect.bottom) return

    const { scrollLeft, clientWidth, scrollWidth } = container
    const atLeftEdge = scrollLeft <= SCROLL_TOLERANCE
    const atRightEdge = scrollLeft + clientWidth >= scrollWidth - SCROLL_TOLERANCE
    const atNominalTop = Math.abs(rect.top - headerHeight) < NOMINAL_TOP_TOLERANCE

    const scrollingDown = e.deltaY > 0
    const scrollingUp = e.deltaY < 0

    if (scrollingDown && rect.top <= headerHeight + NOMINAL_TOP_TOLERANCE && !atRightEdge) {
      e.preventDefault()
      container.scrollLeft += e.deltaY
    } else if (scrollingUp && atNominalTop && !atLeftEdge) {
      e.preventDefault()
      container.scrollLeft += e.deltaY
    }
  }

  // Throttled resize handler
  let resizeTimer: ReturnType<typeof setTimeout> | undefined
  const handleResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(updateHeaderHeight, 100)
  }

  // Event listeners
  container.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('resize', handleResize, { passive: true })

  // Cleanup (for SPAs)
  win.horizontalScrollCleanup = () => {
    container.removeEventListener('wheel', handleWheel)
    window.removeEventListener('resize', handleResize)
    clearTimeout(resizeTimer)
  }
})
