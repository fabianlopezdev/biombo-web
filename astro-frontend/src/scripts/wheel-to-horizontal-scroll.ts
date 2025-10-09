/**
 * Initializes scroll-driven horizontal transform animation for the homepage layout.
 * Converts vertical scroll progress into smooth horizontal movement using CSS transforms.
 * Works seamlessly with Lenis smooth scroll.
 */

import { registerScript } from '@/scripts/core/initialization-manager'
import { throttle } from '@/scripts/core/dom-utilities'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'

// Register script with initialization manager
registerScript('horizontalScroll', () => {
  const wrapper = document.querySelector('.horizontal-scroll-wrapper') as HTMLElement
  const container = document.getElementById('horizontal-container')
  const inner = document.getElementById('horizontal-inner') as HTMLElement

  if (!wrapper || !container || !inner) {
    console.warn('[HorizontalScroll] Required elements not found')
    return () => {}
  }

  const MOBILE_BREAKPOINT = 1025

  let wrapperHeight = 0
  let containerHeight = 0
  let innerWidth = 0
  let maxScroll = 0

  // Calculate dimensions
  const calculateDimensions = (): void => {
    if (window.innerWidth < MOBILE_BREAKPOINT) return

    // Get the total width of the inner content
    innerWidth = inner.scrollWidth
    containerHeight = container.offsetHeight

    // Calculate max horizontal scroll distance
    maxScroll = innerWidth - window.innerWidth

    // Set wrapper height to create scroll space
    // Height = max horizontal scroll distance + one viewport height
    wrapperHeight = maxScroll + containerHeight
    wrapper.style.height = `${wrapperHeight}px`
  }

  // Update horizontal position based on scroll
  const updateHorizontalPosition = (): void => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      inner.style.transform = ''
      return
    }

    // Get wrapper's position relative to viewport
    const wrapperRect = wrapper.getBoundingClientRect()
    const wrapperTop = wrapperRect.top

    // Calculate scroll progress through the wrapper
    // Progress goes from 0 (wrapper just entering viewport) to 1 (wrapper leaving viewport)
    const scrollProgress = Math.max(0, Math.min(1, -wrapperTop / (wrapperHeight - containerHeight)))

    // Calculate horizontal translation
    const translateX = -scrollProgress * maxScroll

    // Apply transform
    inner.style.transform = `translate3d(${translateX}px, 0, 0)`
  }

  // Initialize on load
  const init = (): void => {
    calculateDimensions()
    updateHorizontalPosition()
  }

  // Use Lenis scroll event if available, otherwise use window scroll
  const handleScroll = (): void => {
    updateHorizontalPosition()
  }

  // Handle resize with throttle
  const handleResize = throttle(() => {
    calculateDimensions()
    updateHorizontalPosition()
  }, 100)

  // Listen to Lenis scroll event if available
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const lenis = window.lenis
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (lenis && typeof lenis.on === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    lenis.on('scroll', handleScroll)
  } else {
    // Fallback to window scroll
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  window.addEventListener('resize', handleResize, { passive: true })

  // Initialize after a small delay to ensure layout is ready
  setTimeout(init, 100)

  // Register cleanup
  const cleanup = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const lenisInstance = window.lenis
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (lenisInstance && typeof lenisInstance.off === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      lenisInstance.off('scroll', handleScroll)
    } else {
      window.removeEventListener('scroll', handleScroll)
    }
    window.removeEventListener('resize', handleResize)

    // Reset styles
    if (inner) inner.style.transform = ''
    if (wrapper) wrapper.style.height = ''
  }

  cleanupRegistry.register({
    id: 'horizontalScroll',
    cleanup,
  })

  // Return cleanup function for initialization manager
  return cleanup
})
