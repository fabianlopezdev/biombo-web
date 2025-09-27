// Draggable scrolling functionality for filter pills in ProjectsPageLayout
import { registerScript } from '@/scripts/core/initialization-manager'
import { throttle } from '@/scripts/core/dom-utilities'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'
import { stateManager } from '@/scripts/core/state-manager'

// Extend Window interface to include our global variables
declare global {
  interface Window {
    activeFilters: Set<string>
    announceFilterResults: () => void
    isDragEvent?: boolean
  }
}

// Export to make this a module (required for global augmentation)
export {}

function initFilterPillsDrag(): () => void {
  // Determine which element to make draggable based on viewport
  const isMobile = window.matchMedia('(max-width: 991px)').matches
  const scrollableElement = isMobile
    ? document.querySelector<HTMLElement>('.projects-nav-filter')
    : document.querySelector<HTMLElement>('.projects-filter-wrapper')

  if (!scrollableElement) {
    console.warn('[FilterPillsDrag] Scrollable element not found')
    return () => {} // Return empty cleanup
  }

  let isDragging = false
  let startX: number | null = null
  let startY: number | null = null
  let scrollLeft = 0
  const dragThreshold = 6 // pixels - minimum movement to consider it a drag

  // Event handlers
  const handleMouseDown = (e: MouseEvent): void => {
    startX = e.pageX
    startY = e.pageY
    scrollLeft = scrollableElement.scrollLeft
    isDragging = false
    scrollableElement.style.cursor = 'grab'
  }

  const handleMouseLeave = (): void => {
    startX = null
    startY = null
    isDragging = false
    scrollableElement.style.cursor = 'grab'
  }

  const handleMouseUp = (): void => {
    startX = null
    startY = null

    // Set flag to prevent filter activation if we were dragging
    if (isDragging) {
      // Use state manager instead of window property
      stateManager.set('filter:isDragEvent', true)
      // Reset flag after a short delay to allow click event to be processed
      setTimeout(() => {
        stateManager.delete('filter:isDragEvent')
      }, 10)
    }

    isDragging = false
    scrollableElement.style.cursor = 'grab'
  }

  // Throttle mousemove for better performance
  const handleMouseMove = throttle((e: MouseEvent): void => {
    if (startX === null || startX === undefined || startY === null) return

    const diffX = Math.abs(e.pageX - startX)
    const diffY = Math.abs(e.pageY - startY)

    // Start dragging only after moving beyond threshold
    if (diffX > dragThreshold || diffY > dragThreshold) {
      if (!isDragging) {
        isDragging = true
        scrollableElement.style.cursor = 'grabbing'
      }

      e.preventDefault()
      const walk = (e.pageX - startX) * 2 // Scroll speed multiplier
      scrollableElement.scrollLeft = scrollLeft - walk
    }
  }, 16) // ~60fps

  // Add event listeners
  scrollableElement.addEventListener('mousedown', handleMouseDown)
  scrollableElement.addEventListener('mouseleave', handleMouseLeave)
  scrollableElement.addEventListener('mouseup', handleMouseUp)
  scrollableElement.addEventListener('mousemove', handleMouseMove)

  // Set initial cursor
  scrollableElement.style.cursor = 'grab'

  // Handle window resize to update draggable element
  let resizeTimer: number | undefined
  const handleResize = (): void => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      const newIsMobile = window.matchMedia('(max-width: 991px)').matches
      if (newIsMobile !== isMobile) {
        location.reload() // Simple reload to re-initialize with correct element
      }
    }, 250)
  }

  window.addEventListener('resize', handleResize)

  // Return cleanup function
  return (): void => {
    // Remove event listeners
    scrollableElement.removeEventListener('mousedown', handleMouseDown)
    scrollableElement.removeEventListener('mouseleave', handleMouseLeave)
    scrollableElement.removeEventListener('mouseup', handleMouseUp)
    scrollableElement.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('resize', handleResize)

    // Clear timer
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }

    // Reset cursor
    scrollableElement.style.cursor = ''

    // Clear state
    stateManager.delete('filter:isDragEvent')
  }
}

// Register script with proper cleanup
registerScript('filterPillsDrag', () => {
  const cleanup = initFilterPillsDrag()

  // Register cleanup with centralized registry
  cleanupRegistry.register({
    id: 'filterPillsDrag',
    cleanup,
  })

  return cleanup
})
