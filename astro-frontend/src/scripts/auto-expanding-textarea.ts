// Auto-expand textarea functionality for contact form
import { registerScript } from '@/scripts/core/initialization-manager'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'
import { throttle } from '@/scripts/core/dom-utilities'

registerScript('autoExpandTextarea', () => {
  const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea.auto-expand')

  // Early return if no textareas found
  if (textareas.length === 0) {
    console.debug('[AutoExpandTextarea] No auto-expand textareas found')
    return () => {}
  }

  const listeners: Array<() => void> = []

  textareas.forEach((textarea) => {
    // Function to adjust height with error handling
    const adjustHeight = (): void => {
      try {
        // Early return if element is not in DOM
        if (!textarea.isConnected) return

        // Store scroll position to prevent jump
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop

        // Reset height to get accurate scrollHeight
        textarea.style.height = 'auto'

        // Calculate new height
        const newHeight = Math.min(
          textarea.scrollHeight,
          parseInt(getComputedStyle(textarea).maxHeight) || Infinity,
        )

        // Set new height
        textarea.style.height = `${newHeight}px`

        // Restore scroll position
        window.scrollTo(0, scrollTop)
      } catch (error) {
        console.error('[AutoExpandTextarea] Error adjusting height:', error)
      }
    }

    // Throttle for performance on rapid input
    const throttledAdjust = throttle(adjustHeight, 16) // ~60fps

    // Add event listener
    textarea.addEventListener('input', throttledAdjust)

    // Store cleanup
    listeners.push(() => {
      textarea.removeEventListener('input', throttledAdjust)
      // Reset inline styles on cleanup
      textarea.style.height = ''
    })

    // Initial adjustment
    try {
      adjustHeight()
    } catch (error) {
      console.error('[AutoExpandTextarea] Error during initial adjustment:', error)
    }
  })

  // Cleanup function
  const cleanup = () => {
    listeners.forEach((fn) => fn())
    listeners.length = 0
  }

  // Register with cleanup registry
  cleanupRegistry.register({
    id: 'autoExpandTextarea',
    cleanup,
  })

  return cleanup
})
