/**
 * Accessible Skip Link Smooth Scrolling
 *
 * Provides smooth scrolling behavior for skip links while maintaining accessibility:
 * - Respects prefers-reduced-motion setting
 * - Properly manages keyboard focus
 * - Handles homepage horizontal scroll with offset
 * - Ensures WCAG compliance for keyboard and screen reader users
 */

document.addEventListener('DOMContentLoaded', () => {
  const skipLink = document.querySelector('.skip-to-main') as HTMLAnchorElement

  if (!skipLink) return

  // Check user's motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  skipLink.addEventListener('click', (event) => {
    event.preventDefault()

    // Get target element from href
    const targetId = skipLink.getAttribute('href')
    if (!targetId) return

    const targetElement = document.querySelector(targetId) as HTMLElement
    if (!targetElement) return

    // Helper function to move focus to target element
    const moveFocusToTarget = () => {
      // Ensure element can receive focus
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1')
      }
      // Move keyboard focus to target
      targetElement.focus({ preventScroll: true })
    }

    // If user prefers reduced motion, instant jump without animation
    if (prefersReducedMotion) {
      targetElement.scrollIntoView()
      moveFocusToTarget()
      return
    }

    // Smooth scrolling behavior (motion allowed)
    // Special handling for homepage horizontal scroll (#projects)
    if (targetId === '#projects') {
      const container = document.getElementById('horizontal-container') as HTMLElement
      const target = targetElement

      if (container && target) {
        // Use same calculation as hero scroll indicator
        const extraOffset = window.innerWidth * 0.3 // 30vw offset
        const baseDistance = target.offsetLeft - container.scrollLeft
        const scrollDistance = baseDistance + extraOffset

        if (Math.abs(scrollDistance) > 1) {
          container.scrollBy({
            left: scrollDistance,
            top: 0,
            behavior: 'smooth',
          })

          // Wait for scroll to complete before moving focus
          // Use timeout based on typical smooth scroll duration
          setTimeout(() => {
            moveFocusToTarget()
          }, 500)
        } else {
          // Already at target, just move focus
          moveFocusToTarget()
        }
      }
    } else {
      // Standard smooth scroll for other pages (#main, etc.)
      targetElement.scrollIntoView({ behavior: 'smooth' })

      // Wait for scroll to complete before moving focus
      setTimeout(() => {
        moveFocusToTarget()
      }, 500)
    }
  })
})
