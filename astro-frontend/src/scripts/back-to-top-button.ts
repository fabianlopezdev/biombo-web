// Back to top functionality for footer links
import { registerScript } from '@/scripts/core/initialization-manager'
import { elementCache } from '@/scripts/core/dom-utilities'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'

registerScript('backToTop', () => {
  // Find all back-to-top links
  const backToTopLinks = document.querySelectorAll<HTMLAnchorElement>('.back-to-top-link')

  // Early return if no links found
  if (backToTopLinks.length === 0) {
    console.debug('[BackToTop] No back-to-top links found')
    return () => {}
  }

  // Use element cache for horizontal container
  const horizontalContainer = elementCache.get('horizontalContainer')

  const handleClick = (event: Event): void => {
    // Early return if not an anchor element
    if (!(event.currentTarget instanceof HTMLAnchorElement)) return

    try {
      // 1. Stop the link from its default "jump" behavior
      event.preventDefault()

      // 2. Instantly reset the horizontal container to the beginning if it exists
      if (horizontalContainer && horizontalContainer.isConnected) {
        horizontalContainer.scrollLeft = 0
      }

      // 3. Smoothly scroll the main page to the very top
      // Check if smooth scrolling is supported
      const supportsSmooth = 'scrollBehavior' in document.documentElement.style

      if (supportsSmooth) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      } else {
        // Fallback for browsers that don't support smooth scrolling
        window.scrollTo(0, 0)
      }
    } catch (error) {
      console.error('[BackToTop] Error handling click:', error)
      // Fallback to basic scroll
      window.scrollTo(0, 0)
    }
  }

  // Add listener to all back-to-top links
  const listeners: Array<() => void> = []

  backToTopLinks.forEach((link) => {
    link.addEventListener('click', handleClick)
    listeners.push(() => link.removeEventListener('click', handleClick))
  })

  // Cleanup function
  const cleanup = () => {
    listeners.forEach((fn) => fn())
    listeners.length = 0
  }

  // Register with cleanup registry
  cleanupRegistry.register({
    id: 'backToTop',
    cleanup,
  })

  // Return cleanup function
  return cleanup
})
