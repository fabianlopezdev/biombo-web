/**
 * Slide-up text animation
 * Splits text into lines and animates them with expo easing
 * Can be used on any element with data-slide-up-animation attribute
 */

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
  private options: Required<AnimationOptions>
  private resizeTimeout?: number
  private hasAnimated: boolean = false
  private observer?: IntersectionObserver

  constructor(element: HTMLElement, options: AnimationOptions = {}) {
    this.element = element
    this.originalContent = element.innerHTML


    // Check if this element has already been animated
    if (this.element.hasAttribute('data-animation-complete')) {
      // Element was already animated, don't re-initialize
      return
    }

    // Merge with default options
    this.options = {
      duration: 1500,
      stagger: 200,
      initialDelay: 750,
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
    const appendTarget = isSafari ? document.body : (this.element.parentElement || document.body)
    
    // Position off-screen if appending to body
    if (appendTarget === document.body) {
      measureClone.style.position = 'fixed'
      measureClone.style.left = '-9999px'
      measureClone.style.top = '0'
    }
    
    appendTarget.appendChild(measureClone)
    
    // Force Safari to calculate layout multiple times
    measureClone.offsetHeight // Force reflow
    void measureClone.offsetWidth // Force another reflow
    

    // Process all text nodes to wrap words for measurement
    const processTextNodes = (element: Element) => {
      const childNodes = [...element.childNodes]

      childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          const words = node.textContent.split(/(\s+)/)
          const fragment = document.createDocumentFragment()

          words.forEach((word) => {
            if (word.trim()) {
              const span = document.createElement('span')
              span.className = 'word-measure'
              span.textContent = word
              // Use inline for Safari to respect container width during layout
              span.style.display = 'inline'
              span.style.whiteSpace = 'nowrap' // Prevent word from wrapping internally
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

    processTextNodes(measureClone)

    // Find all word spans and group by line
    const wordSpans = measureClone.querySelectorAll('.word-measure')
    const lines = new Map<number, { elements: Element[]; content: string }>()

    const wordPositions: any[] = []

    wordSpans.forEach((span, index) => {
      const rect = span.getBoundingClientRect()
      const lineY = Math.round(rect.top / 5) * 5 // Round to nearest 5px to group close elements

      if (!lines.has(lineY)) {
        lines.set(lineY, { elements: [], content: '' })
      }

      const lineData = lines.get(lineY)!
      lineData.elements.push(span)
      lineData.content += span.textContent + ' '
    })

    // Remove measurement clone from where we appended it
    appendTarget.removeChild(measureClone)

    // Sort lines by vertical position
    const sortedLines = [...lines.entries()].sort(([a], [b]) => a - b).map(([, data]) => data)

    // Clear original content
    this.element.innerHTML = ''

    // Create line wrappers with preserved HTML structure
    sortedLines.forEach((lineData, index) => {
      const lineWrapper = document.createElement('span')
      lineWrapper.className = 'slide-up-line'

      const lineInner = document.createElement('span')
      lineInner.className = 'slide-up-line-inner'
      lineInner.style.setProperty('--line-index', index.toString())
      lineInner.style.setProperty('--animation-duration', `${this.options.duration}ms`)
      lineInner.style.setProperty(
        '--animation-delay',
        `${this.options.initialDelay + index * this.options.stagger}ms`,
      )
      lineInner.style.setProperty('--animation-easing', this.options.easing)

      // Reconstruct the line content with original HTML structure
      const lineContent = this.reconstructLineWithHTML(
        this.originalContent,
        lineData.content.trim(),
      )

      lineInner.innerHTML = lineContent
      lineWrapper.appendChild(lineInner)
      this.element.appendChild(lineWrapper)
    })

    return sortedLines.length
  }

  private reconstructLineWithHTML(originalHTML: string, lineText: string): string {
    // Create a temporary element to parse the original HTML
    const temp = document.createElement('div')
    temp.innerHTML = originalHTML

    // Check if this line contains any special elements (preserve them)
    const specialElements = temp.querySelectorAll(
      '.highlight-wrapper, .highlight-text, strong, em, a',
    )

    if (specialElements.length > 0) {
      // For each special element, check if its text is in this line
      for (const element of specialElements) {
        const elementText = element.textContent || ''
        if (lineText.includes(elementText)) {
          // Get the parent wrapper if it exists
          const wrapper = element.closest('.highlight-wrapper')
          if (wrapper) {
            const wrapperHTML = wrapper.outerHTML
            const beforeText = lineText.substring(0, lineText.indexOf(elementText))
            const afterText = lineText.substring(lineText.indexOf(elementText) + elementText.length)
            return beforeText + wrapperHTML + afterText
          } else if (element.tagName) {
            // Recreate the element
            const tag = element.tagName.toLowerCase()
            const classes = element.className
            const beforeText = lineText.substring(0, lineText.indexOf(elementText))
            const afterText = lineText.substring(lineText.indexOf(elementText) + elementText.length)
            return `${beforeText}<${tag}${classes ? ` class="${classes}"` : ''}>${elementText}</${tag}>${afterText}`
          }
        }
      }
    }

    // No special formatting, return plain text
    return lineText
  }

  private animateLines(): void {
    // Simply activate the animation by changing the data attribute
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.element.setAttribute('data-animation', 'active')
        this.hasAnimated = true
        // Mark element as complete to prevent re-animation
        this.element.setAttribute('data-animation-complete', 'true')

        // Disconnect observer after animation to free up resources
        if (this.observer) {
          this.observer.disconnect()
          this.observer = undefined
        }
      })
    })
  }

  private init(): void {
    // Double-check animation hasn't already completed
    if (this.element.hasAttribute('data-animation-complete')) {
      return
    }

    // Set initial state
    this.element.setAttribute('data-animation', 'pending')

    // Detect iOS for special handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    // iOS needs extra time for layout to stabilize
    const measurementDelay = isIOS ? 200 : 0

    // Use requestAnimationFrame for better timing on iOS
    const performSplit = () => {
      // Split text into lines
      const lineCount = this.splitIntoAnimatedLines()

      if (lineCount > 0) {
        // Mark as ready (shows the text with lines hidden)
        this.element.setAttribute('data-animation', 'ready')

        // Check if element should animate immediately (above the fold)
        // or wait for intersection observer
        const shouldAnimateImmediately = this.element.hasAttribute('data-animate-immediate')

        if (shouldAnimateImmediately) {
          // Small delay to ensure everything is rendered
          setTimeout(() => {
            this.animateLines()
          }, 100)
        } else {
          // Use intersection observer for scroll-triggered animation
          this.setupIntersectionObserver()
        }
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
    // Don't handle resize if animation is complete
    if (this.element.hasAttribute('data-animation-complete')) {
      return
    }

    clearTimeout(this.resizeTimeout)
    this.resizeTimeout = window.setTimeout(() => {
      // Reset animation state
      this.element.setAttribute('data-animation', 'pending')
      this.hasAnimated = false

      // Recalculate and re-animate
      this.init()
    }, 250)
  }

  public destroy(): void {
    // Restore original content
    this.element.innerHTML = this.originalContent
    this.element.removeAttribute('data-animation')
    this.element.removeAttribute('data-animation-complete')
    clearTimeout(this.resizeTimeout)
    // Clean up observer if it exists
    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  // Wait for fonts to load before measuring text
  const initializeAnimations = () => {
    // Find all elements with the animation attribute
    const elements = document.querySelectorAll('[data-slide-up-animation]')
    const animations: SlideUpTextAnimation[] = []

    elements.forEach((element) => {
      const htmlElement = element as HTMLElement

      // Skip if already animated
      if (htmlElement.hasAttribute('data-animation-complete')) {
        return
      }

      // Parse options from data attributes
      const options: AnimationOptions = {}

      if (htmlElement.dataset.animationDuration) {
        options.duration = parseInt(htmlElement.dataset.animationDuration, 10)
      }
      if (htmlElement.dataset.animationStagger) {
        options.stagger = parseInt(htmlElement.dataset.animationStagger, 10)
      }
      if (htmlElement.dataset.animationDelay) {
        options.initialDelay = parseInt(htmlElement.dataset.animationDelay, 10)
      }
      if (htmlElement.dataset.animationEasing) {
        options.easing = htmlElement.dataset.animationEasing
      }

      const animation = new SlideUpTextAnimation(htmlElement, options)
      // Only add to animations array if the animation was actually created
      if (animation && !htmlElement.hasAttribute('data-animation-complete')) {
        animations.push(animation)
      }
    })

    // Handle resize for all animations
    if (animations.length > 0) {
      window.addEventListener(
        'resize',
        () => {
          animations.forEach((animation) => animation.handleResize())
        },
        { passive: true },
      )
    }
  }

  // Check if fonts are already loaded
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      // Small delay to ensure layout is stable
      setTimeout(initializeAnimations, 100)
    })
  } else {
    // Fallback for browsers without font loading API
    // Wait a bit longer to ensure fonts are loaded
    setTimeout(initializeAnimations, 300)
  }
})

// Export for manual initialization if needed
export default SlideUpTextAnimation
