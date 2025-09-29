/* slider-keyboard-navigation.ts - Keyboard controls for slider navigation */

import type { SliderState } from '@/scripts/slider/slider-state-manager'
import { clamp, scrollToIndex } from '@/scripts/slider/slider-utilities'

/**
 * Initialize keyboard navigation for the slider
 * Supports arrow keys for sequential navigation and Home/End for jumping
 */
export function initKeyboardNavigation(state: SliderState) {
  const { slider, count } = state
  const cleanupFns: (() => void)[] = []

  // Early return if no slides
  if (count <= 1) return () => {}

  // Make slider focusable if not already
  if (!slider.hasAttribute('tabindex')) {
    slider.setAttribute('tabindex', '0')
    slider.setAttribute('role', 'region')
    slider.setAttribute('aria-label', 'Image carousel. Use arrow keys to navigate.')
  }

  /**
   * Navigate to a specific slide index
   * Includes bounds checking and animation state management
   */
  function navigateToSlide(targetIndex: number) {
    // Early return if already animating
    if (state.isAnimating) return

    // Clamp to valid range
    const target = clamp(targetIndex, 0, count - 1)

    // Early return if already at target
    if (target === state.current) return

    // Update state and scroll
    state.set(target)
    scrollToIndex(state, target)
  }

  /**
   * Handle keyboard events with proper key detection
   */
  function handleKeydown(event: KeyboardEvent) {
    // Early return if not focused on slider or its children
    const activeElement = document.activeElement
    if (activeElement !== slider && !slider.contains(activeElement)) return

    // Early return if animating
    if (state.isAnimating) return

    // Handle different key presses
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        navigateToSlide(state.current - 1)
        break

      case 'ArrowRight':
        event.preventDefault()
        navigateToSlide(state.current + 1)
        break

      case 'Home':
        event.preventDefault()
        navigateToSlide(0)
        break

      case 'End':
        event.preventDefault()
        navigateToSlide(count - 1)
        break

      default:
        // Don't prevent default for other keys
        return
    }
  }

  /**
   * Handle focus events for visual feedback
   */
  function handleFocus() {
    slider.classList.add('keyboard-focused')
  }

  function handleBlur() {
    slider.classList.remove('keyboard-focused')
  }

  // Attach event listeners
  document.addEventListener('keydown', handleKeydown)
  slider.addEventListener('focus', handleFocus)
  slider.addEventListener('blur', handleBlur)

  // Store cleanup functions
  cleanupFns.push(
    () => document.removeEventListener('keydown', handleKeydown),
    () => slider.removeEventListener('focus', handleFocus),
    () => slider.removeEventListener('blur', handleBlur),
    () => {
      // Clean up attributes on destroy
      slider.removeAttribute('tabindex')
      slider.removeAttribute('role')
      slider.removeAttribute('aria-label')
      slider.classList.remove('keyboard-focused')
    }
  )

  // Return cleanup function
  return () => cleanupFns.forEach(fn => fn())
}