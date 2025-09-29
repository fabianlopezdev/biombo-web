/**
 * Slide-up text animation
 * Splits text into lines and animates them with expo easing
 * Can be used on any element with data-slide-up-animation attribute
 */

import { registerScript } from '@/scripts/core/initialization-manager'
import { cleanupRegistry } from '@/scripts/core/cleanup-registry'

interface AnimationOptions {
  duration?: number // Animation duration in ms
  stagger?: number // Delay between lines in ms
  initialDelay?: number // Initial delay before animation starts
  easing?: string // CSS easing function
  splitByLines?: boolean // Whether to split by lines (true) or words (false)
}

class SlideUpTextAnimation {
  private element: HTMLElement
  private originalContent: string
  private originalElement: HTMLElement // Store reference to original element with SVGs
  private options: Required<AnimationOptions>
  private resizeTimeout?: number
  private hasAnimated: boolean = false
  private observer?: IntersectionObserver
  private mutationObserver?: MutationObserver

  constructor(element: HTMLElement, options: AnimationOptions = {}) {
    this.element = element

    console.log('[SlideUpTextAnimation] Constructor - element:', element)
    console.log('[SlideUpTextAnimation] Constructor - element.innerHTML length:', element.innerHTML.length)

    // Store original element WITH SVGs for reconstruction
    this.originalElement = element.cloneNode(true) as HTMLElement
    console.log('[SlideUpTextAnimation] Constructor - originalElement stored, innerHTML length:', this.originalElement.innerHTML.length)

    // IMPORTANT: Clone the element and remove SVG elements before capturing content
    // This prevents the HighlightScribble SVG (8000+ chars) from corrupting the animation
    const contentClone = element.cloneNode(true) as HTMLElement
    const svgs = contentClone.querySelectorAll('svg')
    console.log('[SlideUpTextAnimation] Constructor - SVGs found:', svgs.length)
    svgs.forEach(svg => svg.remove())
    this.originalContent = contentClone.innerHTML
    console.log('[SlideUpTextAnimation] Constructor - originalContent (SVG-less) length:', this.originalContent.length)

    // Check if this element has already been animated
    if (this.element.hasAttribute('data-animation-complete')) {
      console.log('[SlideUpTextAnimation] Constructor - Element already animated, skipping')
      // Element was already animated, don't re-initialize
      return
    }

    // Merge with default options
    this.options = {
      duration: 1500,
      stagger: 200,
      initialDelay: 0, // No delay - start immediately
      easing: 'cubic-bezier(0.19, 1, 0.22, 1)', // expo.out
      splitByLines: true,
      ...options,
    }

    this.init()
  }

  private splitIntoAnimatedLines(): number {
    // Reset to original content
    this.element.innerHTML = this.originalContent

    // Force layout calculation on iOS before measuring
    this.element.getBoundingClientRect()

    // Use getBoundingClientRect for more accurate width on iOS
    const elementRect = this.element.getBoundingClientRect()
    const elementWidth = elementRect.width

    // Create a clone to measure text without affecting the original
    const measureClone = this.element.cloneNode(true) as HTMLElement
    measureClone.style.position = 'absolute'
    measureClone.style.visibility = 'hidden'
    measureClone.style.width = elementWidth + 'px'
    measureClone.style.minWidth = elementWidth + 'px' // Force minimum width
    measureClone.style.maxWidth = elementWidth + 'px' // Force maximum width
    measureClone.style.height = 'auto'
    measureClone.style.whiteSpace = 'normal'
    measureClone.style.display = 'block' // Ensure block display
    measureClone.style.boxSizing = 'border-box' // Match box model
    measureClone.style.left = '0'
    measureClone.style.top = '0'

    // Copy computed styles for accurate measurement on iOS
    const computedStyle = window.getComputedStyle(this.element)
    measureClone.style.fontSize = computedStyle.fontSize
    measureClone.style.fontFamily = computedStyle.fontFamily
    measureClone.style.fontWeight = computedStyle.fontWeight
    measureClone.style.lineHeight = computedStyle.lineHeight
    measureClone.style.letterSpacing = computedStyle.letterSpacing
    measureClone.style.padding = computedStyle.padding

    // For Safari, append to body to avoid parent layout issues
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    const appendTarget = isSafari ? document.body : this.element.parentElement || document.body

    // Position off-screen if appending to body
    if (appendTarget === document.body) {
      measureClone.style.position = 'fixed'
      measureClone.style.left = '-9999px'
      measureClone.style.top = '0'
    }

    appendTarget.appendChild(measureClone)

    // Force Safari to calculate layout multiple times
    void measureClone.offsetHeight // Force reflow
    void measureClone.offsetWidth // Force another reflow

    // Process all text nodes to wrap words for measurement
    const processTextNodes = (element: Element) => {
      const childNodes = [...element.childNodes]
      childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || ''
          const words = text.split(/(\s+)/)
          const fragment = document.createDocumentFragment()

          words.forEach((word) => {
            if (word.trim()) {
              const span = document.createElement('span')
              span.className = 'word-measure'
              span.textContent = word
              fragment.appendChild(span)
            } else if (word) {
              // Preserve whitespace
              fragment.appendChild(document.createTextNode(word))
            }
          })

          node.parentNode?.replaceChild(fragment, node)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Recursively process child elements
          processTextNodes(node as Element)
        }
      })
    }

    // Process the clone to wrap words
    processTextNodes(measureClone)

    // Force another reflow after wrapping words
    void measureClone.offsetHeight

    // Now measure line positions with refined approach for iOS
    const words = measureClone.querySelectorAll('.word-measure')
    const lineGroups = new Map<number, Element[]>()

    words.forEach((word) => {
      const rect = word.getBoundingClientRect()
      // Use more precise rounding for iOS Safari
      const lineTop = Math.round(rect.top * 2) / 2

      if (!lineGroups.has(lineTop)) {
        lineGroups.set(lineTop, [])
      }
      lineGroups.get(lineTop)?.push(word)
    })

    // Clean up measurement clone
    appendTarget.removeChild(measureClone)

    // Clear original element
    this.element.innerHTML = ''

    // Sort lines by vertical position
    const sortedLines = Array.from(lineGroups.entries()).sort(([a], [b]) => a - b)

    // Rebuild content with animated lines
    sortedLines.forEach(([, wordsInLine], lineIndex) => {
      const lineWrapper = document.createElement('span')
      lineWrapper.className = 'slide-up-line'

      const lineInner = document.createElement('span')
      lineInner.className = 'slide-up-line-inner'

      // Calculate animation delay for this line
      const delay = this.options.initialDelay + lineIndex * this.options.stagger
      lineInner.style.setProperty('--animation-delay', `${delay}ms`)
      lineInner.style.setProperty('--animation-duration', `${this.options.duration}ms`)
      lineInner.style.setProperty('--animation-easing', this.options.easing)

      // Rebuild line content from original HTML
      const lineText = Array.from(wordsInLine)
        .map((el) => el.textContent)
        .join(' ')
      lineInner.innerHTML = this.reconstructLineContent(lineText)

      lineWrapper.appendChild(lineInner)
      this.element.appendChild(lineWrapper)
    })

    return sortedLines.length
  }

  private reconstructLineContent(lineText: string): string {
    // Try to preserve any special HTML structure from original content
    // This is a simplified approach - in production you might need more robust HTML parsing

    console.log('[reconstructLineContent] START - lineText:', `"${lineText}"`)
    console.log('[reconstructLineContent] originalContent length:', this.originalContent.length)
    console.log('[reconstructLineContent] originalElement.innerHTML length:', this.originalElement.innerHTML.length)

    // Create tempDiv from SVG-less content for text matching
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = this.originalContent

    // Create another div from original element (with SVGs) for cloning
    const originalDiv = document.createElement('div')
    originalDiv.innerHTML = this.originalElement.innerHTML

    // Look for special elements like highlight wrappers
    const specialElements = tempDiv.querySelectorAll('.highlight-wrapper, strong, em, a')
    const originalSpecialElements = originalDiv.querySelectorAll('.highlight-wrapper, strong, em, a')

    console.log('[reconstructLineContent] specialElements count:', specialElements.length)
    console.log('[reconstructLineContent] originalSpecialElements count:', originalSpecialElements.length)

    for (let i = 0; i < specialElements.length; i++) {
      const element = specialElements[i]
      const originalElement = originalSpecialElements[i] // Get corresponding element with SVG
      const elementText = (element.textContent || '').trim()

      console.log(`[reconstructLineContent] Element ${i} - text: "${elementText}", classes:`, element.className)
      console.log(`[reconstructLineContent] Element ${i} - checking if lineText includes elementText:`, lineText.includes(elementText))

      if (lineText.includes(elementText)) {
        console.log('[reconstructLineContent] MATCH FOUND!')
        // Try to reconstruct the element
        if (element.classList.contains('highlight-wrapper')) {
          console.log('[reconstructLineContent] Is highlight-wrapper, cloning from original with SVG')
          // Clone from ORIGINAL element (with SVG intact)
          const wrapper = originalElement.cloneNode(true) as HTMLElement
          console.log('[reconstructLineContent] wrapper cloned, outerHTML length:', wrapper.outerHTML.length)
          const result = lineText.replace(elementText, wrapper.outerHTML)
          console.log('[reconstructLineContent] Returning reconstructed HTML, length:', result.length)
          return result
        } else {
          // Simple element reconstruction
          const tag = element.tagName.toLowerCase()
          const classes = element.className
          const beforeText = lineText.substring(0, lineText.indexOf(elementText))
          const afterText = lineText.substring(lineText.indexOf(elementText) + elementText.length)
          return `${beforeText}<${tag}${classes ? ` class="${classes}"` : ''}>${elementText}</${tag}>${afterText}`
        }
      }
    }

    console.log('[reconstructLineContent] No matches, returning plain text')
    // No special formatting, return plain text
    return lineText
  }

  private animateLines(): void {
    console.log('[SlideUpTextAnimation] animateLines() called')
    console.log('[SlideUpTextAnimation] hasAnimated:', this.hasAnimated)

    // Simply activate the animation by changing the data attribute
    requestAnimationFrame(() => {
      console.log('[SlideUpTextAnimation] First RAF executed')
      requestAnimationFrame(() => {
        console.log('[SlideUpTextAnimation] Second RAF executed - setting data-animation="active"')
        this.element.setAttribute('data-animation', 'active')
        this.hasAnimated = true
        // Mark element as complete to prevent re-animation
        this.element.setAttribute('data-animation-complete', 'true')
        console.log('[SlideUpTextAnimation] Animation attributes set - active & complete')

        // Disconnect observers after animation to free up resources
        if (this.observer) {
          this.observer.disconnect()
          this.observer = undefined
        }
        if (this.mutationObserver) {
          console.log('[SlideUpTextAnimation] Disconnecting MutationObserver')
          this.mutationObserver.disconnect()
          this.mutationObserver = undefined
        }
      })
    })
  }

  private init(): void {
    console.log('[SlideUpTextAnimation] init() called')

    // Double-check animation hasn't already completed
    if (this.element.hasAttribute('data-animation-complete')) {
      console.log('[SlideUpTextAnimation] Element already has data-animation-complete, skipping')
      return
    }

    // Set initial state
    console.log('[SlideUpTextAnimation] Setting data-animation="pending"')
    this.element.setAttribute('data-animation', 'pending')

    // Detect iOS for special handling
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream

    console.log('[SlideUpTextAnimation] isIOS:', isIOS)

    // iOS needs extra time for layout to stabilize
    const measurementDelay = isIOS ? 200 : 0
    console.log('[SlideUpTextAnimation] measurementDelay:', measurementDelay)

    // Use requestAnimationFrame for better timing on iOS
    const performSplit = () => {
      console.log('[SlideUpTextAnimation] performSplit() called')
      // Split text into lines
      const lineCount = this.splitIntoAnimatedLines()
      console.log('[SlideUpTextAnimation] splitIntoAnimatedLines returned lineCount:', lineCount)

      if (lineCount > 0) {
        // Mark as ready (shows the text with lines hidden)
        console.log('[SlideUpTextAnimation] Setting data-animation="ready"')
        this.element.setAttribute('data-animation', 'ready')

        // Check if element should animate immediately (above the fold)
        // or wait for intersection observer
        const shouldAnimateImmediately = this.element.hasAttribute('data-animate-immediate')
        const waitForTrigger = this.element.hasAttribute('data-wait-for-trigger')

        console.log('[SlideUpTextAnimation] shouldAnimateImmediately:', shouldAnimateImmediately)
        console.log('[SlideUpTextAnimation] waitForTrigger:', waitForTrigger)

        if (shouldAnimateImmediately) {
          console.log('[SlideUpTextAnimation] Mode: animate immediately - scheduling animateLines in 100ms')
          // Small delay to ensure everything is rendered
          setTimeout(() => {
            this.animateLines()
          }, 100)
        } else if (waitForTrigger) {
          console.log('[SlideUpTextAnimation] Mode: wait for trigger - setting up MutationObserver')
          // Wait for external trigger (from orchestrator)
          // Use MutationObserver to watch for attribute changes
          this.mutationObserver = new MutationObserver((mutations) => {
            console.log('[SlideUpTextAnimation] MutationObserver detected mutations:', mutations.length)
            mutations.forEach((mutation) => {
              console.log('[SlideUpTextAnimation] Mutation - attributeName:', mutation.attributeName)
              if (mutation.attributeName === 'data-animation-trigger') {
                console.log('[SlideUpTextAnimation] data-animation-trigger detected! Value:', this.element.getAttribute('data-animation-trigger'))
                console.log('[SlideUpTextAnimation] Calling animateLines()')
                this.animateLines()
                this.mutationObserver?.disconnect()
                this.mutationObserver = undefined
              }
            })
          })
          this.mutationObserver.observe(this.element, { attributes: true })
          console.log('[SlideUpTextAnimation] MutationObserver set up successfully')
        } else {
          console.log('[SlideUpTextAnimation] Mode: intersection observer - calling setupIntersectionObserver()')
          // Use intersection observer for scroll-triggered animation
          this.setupIntersectionObserver()
        }
      } else {
        console.error('[SlideUpTextAnimation] lineCount is 0 - no lines to animate!')
      }
    }

    if (measurementDelay > 0) {
      // For iOS, wait and use double RAF for layout stability
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(performSplit)
        })
      }, measurementDelay)
    } else {
      performSplit()
    }
  }

  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              !this.hasAnimated &&
              !this.element.hasAttribute('data-animation-complete')
            ) {
              this.animateLines()
              this.observer?.unobserve(this.element)
            }
          })
        },
        {
          threshold: 0.2,
          rootMargin: '-50px',
        },
      )

      this.observer.observe(this.element)
    } else {
      // Fallback for older browsers
      this.animateLines()
    }
  }

  public handleResize(): void {
    // Early return if animation is complete
    if (this.element.hasAttribute('data-animation-complete')) {
      return
    }

    // Clear existing timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }

    this.resizeTimeout = window.setTimeout(() => {
      // Reset animation state
      this.element.setAttribute('data-animation', 'pending')
      this.hasAnimated = false

      // Recalculate and re-animate
      this.init()
      this.resizeTimeout = undefined
    }, 250)
  }

  public destroy(): void {
    // Clean up timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = undefined
    }

    // Clean up observers
    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = undefined
    }

    // Restore original content
    try {
      this.element.innerHTML = this.originalContent
      this.element.removeAttribute('data-animation')
      this.element.removeAttribute('data-animation-complete')
      this.element.removeAttribute('data-animation-trigger')
      this.element.removeAttribute('data-wait-for-trigger')
    } catch (error) {
      console.error('[SlideUpTextAnimation] Error during cleanup:', error)
    }
  }
}

// Register with initialization manager
registerScript('slideUpTextAnimation', () => {
  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    return () => {} // Return empty cleanup
  }

  const animations: SlideUpTextAnimation[] = []

  // Initialize animations
  const initializeAnimations = () => {
    // Find all elements with the animation attribute
    const elements = document.querySelectorAll<HTMLElement>('[data-slide-up-animation]')

    elements.forEach((element) => {
      // Skip if already animated
      if (element.hasAttribute('data-animation-complete')) {
        return
      }

      // Parse options from data attributes
      const options: AnimationOptions = {}

      if (element.dataset.animationDuration) {
        const duration = parseInt(element.dataset.animationDuration, 10)
        if (!isNaN(duration)) options.duration = duration
      }
      if (element.dataset.animationStagger) {
        const stagger = parseInt(element.dataset.animationStagger, 10)
        if (!isNaN(stagger)) options.stagger = stagger
      }
      if (element.dataset.animationDelay) {
        const delay = parseInt(element.dataset.animationDelay, 10)
        if (!isNaN(delay)) options.initialDelay = delay
      }
      if (element.dataset.animationEasing) {
        options.easing = element.dataset.animationEasing
      }

      try {
        const animation = new SlideUpTextAnimation(element, options)
        // Only add to animations array if the animation was actually created
        if (animation && !element.hasAttribute('data-animation-complete')) {
          animations.push(animation)
        }
      } catch (error) {
        console.error('[SlideUpTextAnimation] Error creating animation:', error)
      }
    })
  }

  // Handle resize events
  let resizeTimer: number | undefined
  const handleResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      animations.forEach((anim) => {
        try {
          anim.handleResize()
        } catch (error) {
          console.error('[SlideUpTextAnimation] Error handling resize:', error)
        }
      })
      resizeTimer = undefined
    }, 100)
  }

  // Initialize when fonts are ready
  if (document.fonts && 'ready' in document.fonts) {
    void document.fonts.ready
      .then(() => {
        // Small delay to ensure layout is stable
        setTimeout(initializeAnimations, 100)
      })
      .catch((error) => {
        console.error('[SlideUpTextAnimation] Font loading error:', error)
        initializeAnimations() // Try anyway
      })
  } else {
    // Fallback for browsers that don't support font loading API
    setTimeout(initializeAnimations, 300)
  }

  // Add resize listener
  window.addEventListener('resize', handleResize, { passive: true })

  // Cleanup function
  const cleanup = () => {
    // Clear resize timer
    if (resizeTimer) {
      clearTimeout(resizeTimer)
      resizeTimer = undefined
    }

    // Remove resize listener
    window.removeEventListener('resize', handleResize)

    // Destroy all animations
    animations.forEach((anim) => {
      try {
        anim.destroy()
      } catch (error) {
        console.error('[SlideUpTextAnimation] Error destroying animation:', error)
      }
    })
    animations.length = 0
  }

  // Register with cleanup registry
  cleanupRegistry.register({
    id: 'slideUpTextAnimation',
    cleanup,
  })

  return cleanup
})

// Export class for potential direct usage
export { SlideUpTextAnimation }
export default SlideUpTextAnimation
