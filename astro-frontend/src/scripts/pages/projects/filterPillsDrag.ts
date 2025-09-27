// Draggable scrolling functionality for filter pills in ProjectsPageLayout

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

function initFilterPillsDrag(): void {
  // Determine which element to make draggable based on viewport
  const isMobile = window.matchMedia('(max-width: 991px)').matches
  const scrollableElement = isMobile
    ? document.querySelector<HTMLElement>('.projects-nav-filter')
    : document.querySelector<HTMLElement>('.projects-filter-wrapper')

  if (!scrollableElement) return

  let isDragging = false
  let startX: number | null = null
  let startY: number | null = null
  let scrollLeft = 0
  const dragThreshold = 6 // pixels - minimum movement to consider it a drag

  scrollableElement.addEventListener('mousedown', (e: MouseEvent) => {
    startX = e.pageX
    startY = e.pageY
    scrollLeft = scrollableElement.scrollLeft
    isDragging = false
    scrollableElement.style.cursor = 'grab'
  })

  scrollableElement.addEventListener('mouseleave', () => {
    startX = null
    startY = null
    isDragging = false
    scrollableElement.style.cursor = 'grab'
  })

  scrollableElement.addEventListener('mouseup', () => {
    startX = null
    startY = null

    // Set flag to prevent filter activation if we were dragging
    if (isDragging) {
      window.isDragEvent = true
      // Reset flag after a short delay to allow click event to be processed
      setTimeout(() => {
        window.isDragEvent = false
      }, 10)
    }

    isDragging = false
    scrollableElement.style.cursor = 'grab'
  })

  scrollableElement.addEventListener('mousemove', (e: MouseEvent) => {
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
  })

  // Set initial cursor
  scrollableElement.style.cursor = 'grab'

  // Handle window resize to update draggable element
  let resizeTimer: number
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      const newIsMobile = window.matchMedia('(max-width: 991px)').matches
      if (newIsMobile !== isMobile) {
        location.reload() // Simple reload to re-initialize with correct element
      }
    }, 250)
  })
}

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFilterPillsDrag)
} else {
  initFilterPillsDrag()
}

// Re-initialize on Astro page navigation
document.addEventListener('astro:page-load', initFilterPillsDrag)
