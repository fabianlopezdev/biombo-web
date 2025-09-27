/**
 * Shared DOM utilities for consistent initialization and cleanup across all scripts
 */

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, wait)
  }
}

/**
 * Throttle function to ensure a function is called at most once in a specified period
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Safe DOM ready handler that works with both initial load and Astro navigation
 */
export function onDOMReady(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true })
  } else {
    // DOM is already ready, execute callback asynchronously to maintain consistency
    queueMicrotask(callback)
  }
}

/**
 * Initialize a script with proper Astro page navigation support
 * Prevents duplicate initialization and handles cleanup
 */
export function initWithAstro(
  scriptName: string,
  initFn: () => void | (() => void),
  options: { once?: boolean } = {},
): void {
  const { once = false } = options

  // Track initialization to prevent duplicates
  const initKey = `__${scriptName}_initialized`

  function initialize() {
    // If script should only run once and is already initialized, skip
    if (once && window[initKey as keyof Window]) {
      return
    }

    // Clean up previous instance if it exists and returned a cleanup function
    const cleanupKey = `__${scriptName}_cleanup` as keyof Window
    if (typeof window[cleanupKey] === 'function') {
      ;(window[cleanupKey] as () => void)()
      delete window[cleanupKey]
    }

    // Run initialization and store cleanup function if returned
    const cleanup = initFn()
    if (typeof cleanup === 'function') {
      window[cleanupKey] = cleanup as never
    }

    // Mark as initialized
    if (once) {
      window[initKey as keyof Window] = true as never
    }
  }

  // Initialize on DOM ready
  onDOMReady(initialize)

  // Re-initialize on Astro page navigation (unless once=true)
  if (!once) {
    document.addEventListener('astro:page-load', initialize)
  }
}

/**
 * Element cache for frequently accessed DOM elements
 */
class ElementCache {
  private cache = new Map<string, Element | null>()
  private selectors = new Map<string, string>()

  register(key: string, selector: string): void {
    this.selectors.set(key, selector)
    // Don't cache immediately, wait for first access
  }

  get<T extends Element = Element>(key: string): T | null {
    // Check if we have a selector for this key
    const selector = this.selectors.get(key)
    if (!selector) {
      console.warn(`No selector registered for key: ${key}`)
      return null
    }

    // Check cache
    if (!this.cache.has(key)) {
      // Query and cache the element
      const element = document.querySelector<T>(selector)
      this.cache.set(key, element)
      return element
    }

    return this.cache.get(key) as T | null
  }

  // Clear cache (useful on page navigation)
  clear(): void {
    this.cache.clear()
  }

  // Clear specific element from cache
  invalidate(key: string): void {
    this.cache.delete(key)
  }
}

// Global element cache instance
export const elementCache = new ElementCache()

// Register common elements
elementCache.register('header', '.site-header')
elementCache.register('mobileMenu', '#mobile-menu')
elementCache.register('horizontalContainer', '#horizontal-container')

// Clear cache on Astro navigation
document.addEventListener('astro:page-load', () => {
  elementCache.clear()
})

/**
 * Create an AbortController for managing event listeners
 * Returns controller and a helper to add event listeners
 */
export function createEventManager() {
  const controller = new AbortController()

  return {
    controller,
    addEventListener<K extends keyof WindowEventMap>(
      target: EventTarget,
      type: K,
      listener: (ev: WindowEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions,
    ): void {
      const eventOptions: AddEventListenerOptions =
        typeof options === 'object'
          ? { ...options, signal: controller.signal }
          : { signal: controller.signal, capture: options }
      target.addEventListener(type, listener as EventListener, eventOptions)
    },
    destroy(): void {
      controller.abort()
    },
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
