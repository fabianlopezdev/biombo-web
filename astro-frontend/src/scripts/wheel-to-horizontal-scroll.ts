/**
 * Initializes horizontal scrolling functionality for the homepage layout.
 * Handles wheel events to enable horizontal scrolling with vertical mouse wheel.
 */

import { registerScript } from '@/scripts/core/initialization-manager'
import { throttle } from '@/scripts/core/dom-utilities'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'

// Register script with initialization manager
registerScript('horizontalScroll', () => {
  const container = document.getElementById('horizontal-container')
  if (!container) {
    console.warn('[HorizontalScroll] Container element not found')
    return () => {}
  }

  // Constants - calculated once
  const SCROLL_TOLERANCE = 0.5
  const NOMINAL_TOP_TOLERANCE = 5
  const MOBILE_BREAKPOINT = 992

  let headerHeight = 0
  let cachedRect: DOMRect | null = null
  let rectCacheTime = 0
  const RECT_CACHE_DURATION = 100 // Cache getBoundingClientRect for 100ms

  // Simple, reliable header height calculation
  const updateHeaderHeight = (): void => {
    try {
      const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--header-height')

      if (cssVar.endsWith('px')) {
        headerHeight = parseFloat(cssVar)
        return
      }

      if (cssVar.endsWith('rem')) {
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
        headerHeight = parseFloat(cssVar) * rootFontSize
        return
      }

      // Fallback to actual header element
      const header = document.querySelector('header')
      headerHeight = header?.offsetHeight || 0
    } catch (error) {
      console.error('[HorizontalScroll] Error calculating header height:', error)
      headerHeight = 0
    }
  }

  updateHeaderHeight()

  const handleWheel = (e: WheelEvent): void => {
    // Early return for mobile viewports
    if (window.innerWidth < MOBILE_BREAKPOINT) return

    // Early return if no vertical scroll
    if (Math.abs(e.deltaY) < 0.01) return

    // Cache getBoundingClientRect calls for performance
    const now = Date.now()
    if (!cachedRect || now - rectCacheTime > RECT_CACHE_DURATION) {
      cachedRect = container.getBoundingClientRect()
      rectCacheTime = now
    }
    const rect = cachedRect

    // Early return if cursor outside container bounds
    if (e.clientY < rect.top || e.clientY > rect.bottom) return

    const { scrollLeft, clientWidth, scrollWidth } = container
    const atLeftEdge = scrollLeft <= SCROLL_TOLERANCE
    const atRightEdge = scrollLeft + clientWidth >= scrollWidth - SCROLL_TOLERANCE
    const atNominalTop = Math.abs(rect.top - headerHeight) < NOMINAL_TOP_TOLERANCE

    const scrollingDown = e.deltaY > 0
    const scrollingUp = e.deltaY < 0

    // Handle scroll down
    if (scrollingDown) {
      if (rect.top > headerHeight + NOMINAL_TOP_TOLERANCE || atRightEdge) return
      e.preventDefault()
      container.scrollLeft += e.deltaY
      return
    }

    // Handle scroll up
    if (scrollingUp) {
      if (!atNominalTop || atLeftEdge) return
      e.preventDefault()
      container.scrollLeft += e.deltaY
    }
  }

  // Use throttle utility from domUtils
  const handleResize = throttle(() => {
    updateHeaderHeight()
    // Invalidate rect cache on resize
    cachedRect = null
  }, 100)

  // Event listeners with proper options
  const wheelOptions: AddEventListenerOptions = { passive: false, capture: false }
  const resizeOptions: AddEventListenerOptions = { passive: true }

  container.addEventListener('wheel', handleWheel, wheelOptions)
  window.addEventListener('resize', handleResize, resizeOptions)

  // Register cleanup
  const cleanup = () => {
    container.removeEventListener('wheel', handleWheel)
    window.removeEventListener('resize', handleResize)
    // Clear cache
    cachedRect = null
  }

  cleanupRegistry.register({
    id: 'horizontalScroll',
    cleanup,
  })

  // Return cleanup function for initialization manager
  return cleanup
})
