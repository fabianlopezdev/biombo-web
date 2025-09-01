/**
 * Hero title line-by-line animation
 * Splits text into lines and animates them with expo easing
 */

document.addEventListener('DOMContentLoaded', () => {
  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const heroTitle = document.getElementById('hero-title') as HTMLElement
  if (!heroTitle) return

  // Store original content structure
  const originalContent = heroTitle.innerHTML

  /**
   * Split text into lines based on actual rendering
   */
  function splitIntoAnimatedLines() {
    // Reset to original content
    heroTitle.innerHTML = originalContent

    // Create a clone to measure text without affecting the original
    const measureClone = heroTitle.cloneNode(true) as HTMLElement
    measureClone.style.position = 'absolute'
    measureClone.style.visibility = 'hidden'
    measureClone.style.width = heroTitle.offsetWidth + 'px'
    measureClone.style.height = 'auto'
    measureClone.style.whiteSpace = 'normal'
    document.body.appendChild(measureClone)

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
              span.style.display = 'inline-block'
              fragment.appendChild(span)
            } else if (word) {
              // Preserve whitespace
              fragment.appendChild(document.createTextNode(word))
            }
          })

          node.parentNode?.replaceChild(fragment, node)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Recursively process child elements (for highlight wrapper, etc.)
          processTextNodes(node as Element)
        }
      })
    }

    processTextNodes(measureClone)

    // Find all word spans and group by line
    const wordSpans = measureClone.querySelectorAll('.word-measure')
    const lines = new Map<number, { elements: Element[]; content: string }>()

    wordSpans.forEach((span) => {
      const rect = span.getBoundingClientRect()
      const lineY = Math.round(rect.top / 5) * 5 // Round to nearest 5px to group close elements

      if (!lines.has(lineY)) {
        lines.set(lineY, { elements: [], content: '' })
      }

      const lineData = lines.get(lineY)!
      lineData.elements.push(span)
      lineData.content += span.textContent + ' '
    })

    // Remove measurement clone
    document.body.removeChild(measureClone)

    // Sort lines by vertical position
    const sortedLines = [...lines.entries()].sort(([a], [b]) => a - b).map(([, data]) => data)

    // Clear original content
    heroTitle.innerHTML = ''

    // Create line wrappers with preserved HTML structure
    sortedLines.forEach((lineData, index) => {
      const lineWrapper = document.createElement('span')
      lineWrapper.className = 'hero-line'

      const lineInner = document.createElement('span')
      lineInner.className = 'hero-line-inner'
      lineInner.style.setProperty('--line-index', index.toString())

      // Reconstruct the line content with original HTML structure
      const lineContent = reconstructLineWithHTML(originalContent, lineData.content.trim())

      lineInner.innerHTML = lineContent
      lineWrapper.appendChild(lineInner)
      heroTitle.appendChild(lineWrapper)
    })

    return sortedLines.length
  }

  /**
   * Reconstruct HTML for a specific line of text
   */
  function reconstructLineWithHTML(originalHTML: string, lineText: string): string {
    // Create a temporary element to parse the original HTML
    const temp = document.createElement('div')
    temp.innerHTML = originalHTML

    // Check if this line contains the highlight
    const highlightWrapper = temp.querySelector('.highlight-wrapper')
    if (highlightWrapper) {
      const highlightText = highlightWrapper.querySelector('.highlight-text')?.textContent || ''

      // Split the line text to see what parts we have
      const words = lineText.split(' ').filter((w) => w.length > 0)
      let result = ''
      let highlightFound = false

      for (const word of words) {
        if (word === highlightText && !highlightFound) {
          // Insert the entire highlight wrapper structure
          result += `<span class="highlight-wrapper">${highlightWrapper.innerHTML}</span> `
          highlightFound = true
        } else if (!highlightFound || word !== highlightText) {
          result += word + ' '
        }
      }

      return result.trim()
    }

    // No special formatting, return plain text
    return lineText
  }

  /**
   * Trigger the animation
   */
  function animateLines() {
    // Simply activate the animation by changing the data attribute
    // CSS will handle the animation based on the --line-index custom property
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroTitle.setAttribute('data-animation', 'active')
      })
    })
  }

  /**
   * Initialize animation
   */
  function init() {
    // Split text into lines
    const lineCount = splitIntoAnimatedLines()

    if (lineCount > 0) {
      // Mark as ready (shows the text with lines hidden)
      heroTitle.setAttribute('data-animation', 'ready')

      // Small delay to ensure everything is rendered
      setTimeout(() => {
        animateLines()
      }, 100)
    }
  }

  /**
   * Handle resize to recalculate lines
   */
  let resizeTimeout: number
  function handleResize() {
    clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
      // Reset animation state
      heroTitle.setAttribute('data-animation', 'pending')

      // Recalculate and re-animate
      init()
    }, 250)
  }

  // Initialize on load
  init()

  // Recalculate on resize
  window.addEventListener('resize', handleResize, { passive: true })
})
