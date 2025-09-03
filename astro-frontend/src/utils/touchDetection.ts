/**
 * Touch device detection utility
 * Detects if the device has touch capabilities using multiple methods
 */

/**
 * Check if the device supports touch input
 * Uses multiple detection methods for better accuracy
 */
export function isTouchDevice(): boolean {
  // Check for touch events support
  const hasTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Check for pointer events with touch support
  const hasPointerTouch = window.matchMedia('(pointer: coarse)').matches
  
  // Check for hover capability (touch devices typically can't hover)
  const cannotHover = window.matchMedia('(hover: none)').matches
  
  // A device is considered touch-enabled if it has touch events AND either:
  // - Has a coarse pointer (typical of touch screens)
  // - Cannot hover
  return hasTouchEvents && (hasPointerTouch || cannotHover)
}

/**
 * Add touch/no-touch classes to document element
 * This allows CSS-based conditional styling
 */
export function initTouchDetection(): void {
  const isTouch = isTouchDevice()
  
  // Add appropriate class to html element
  document.documentElement.classList.add(isTouch ? 'touch-device' : 'no-touch-device')
  
  // Also set a CSS custom property for additional flexibility
  document.documentElement.style.setProperty('--is-touch-device', isTouch ? '1' : '0')
}

/**
 * Get touch detection for server-side rendering
 * Returns neutral state that will be updated client-side
 */
export function getSSRTouchClass(): string {
  // Return empty string for SSR, will be set client-side
  return ''
}