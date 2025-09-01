/**
 * Split text content into lines based on actual rendered line breaks
 * Preserves HTML structure for highlights and other inline elements
 */

export interface LineElement {
  element: HTMLElement
  originalContent: string
}

export function splitIntoLines(container: HTMLElement): LineElement[] {
  if (!container) return []

  // Store original HTML to restore if needed
  const originalHTML = container.innerHTML
  const lines: LineElement[] = []

  // Create a temporary container to measure text
  const tempContainer = container.cloneNode(true) as HTMLElement
  tempContainer.style.position = 'absolute'
  tempContainer.style.visibility = 'hidden'
  tempContainer.style.width = container.offsetWidth + 'px'
  tempContainer.style.whiteSpace = 'normal'
  document.body.appendChild(tempContainer)

  // Get all text nodes and their positions
  const walker = document.createTreeWalker(tempContainer, NodeFilter.SHOW_TEXT, null)

  const textNodes: { node: Text; parent: Node }[] = []
  let node: Text | null

  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent?.trim()) {
      textNodes.push({ node, parent: node.parentNode! })
    }
  }

  if (textNodes.length === 0) {
    document.body.removeChild(tempContainer)
    return []
  }

  // Wrap each word in a span to measure positions
  textNodes.forEach(({ node, parent }) => {
    const words = node.textContent!.split(/(\s+)/)
    const fragment = document.createDocumentFragment()

    words.forEach((word) => {
      if (word.trim()) {
        const span = document.createElement('span')
        span.className = 'word-measure'
        span.textContent = word
        fragment.appendChild(span)
      } else if (word) {
        fragment.appendChild(document.createTextNode(word))
      }
    })

    parent.replaceChild(fragment, node)
  })

  // Group words by their Y position (line)
  const wordSpans = tempContainer.querySelectorAll('.word-measure')
  const lineGroups = new Map<number, Element[]>()

  wordSpans.forEach((span) => {
    const rect = span.getBoundingClientRect()
    const lineY = Math.round(rect.top)

    if (!lineGroups.has(lineY)) {
      lineGroups.set(lineY, [])
    }
    lineGroups.get(lineY)!.push(span)
  })

  // Clean up temp container
  document.body.removeChild(tempContainer)

  // Clear original container
  container.innerHTML = ''

  // Create line wrappers
  const sortedLines = [...lineGroups.entries()].sort(([a], [b]) => a - b)

  sortedLines.forEach(([, wordsInLine], index) => {
    const lineWrapper = document.createElement('span')
    lineWrapper.className = 'hero-line'
    lineWrapper.style.display = 'block'
    lineWrapper.style.overflow = 'hidden'

    const lineInner = document.createElement('span')
    lineInner.className = 'hero-line-inner'
    lineInner.style.display = 'inline-block'
    lineInner.setAttribute('data-line-index', index.toString())

    // Reconstruct the line with original HTML structure
    const tempLine = document.createElement('div')
    tempLine.innerHTML = originalHTML

    // Extract the content for this line
    let lineContent = ''
    wordsInLine.forEach((wordSpan) => {
      const word = wordSpan.textContent || ''
      lineContent += word + ' '
    })

    lineInner.innerHTML = reconstructLineHTML(originalHTML, lineContent.trim())
    lineWrapper.appendChild(lineInner)
    container.appendChild(lineWrapper)

    lines.push({
      element: lineInner,
      originalContent: lineContent.trim(),
    })
  })

  return lines
}

/**
 * Reconstruct HTML for a specific line, preserving formatting
 */
function reconstructLineHTML(originalHTML: string, lineText: string): string {
  // This is a simplified version - in production you might need more robust HTML parsing
  // For now, we'll handle the common case of bold/highlight spans

  // Check if the line text appears in any special formatting
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = originalHTML

  // Try to find and preserve highlight wrapper structure
  const highlightWrapper = tempDiv.querySelector('.highlight-wrapper')
  if (highlightWrapper) {
    const highlightText = highlightWrapper.querySelector('.highlight-text')?.textContent || ''

    if (lineText.indexOf(highlightText) !== -1) {
      // This line contains the highlight
      const beforeHighlight = lineText.substring(0, lineText.indexOf(highlightText))
      const afterHighlight = lineText.substring(
        lineText.indexOf(highlightText) + highlightText.length,
      )

      let result = beforeHighlight
      result += `<span class="highlight-wrapper">${highlightWrapper.innerHTML}</span>`
      result += afterHighlight

      return result
    }
  }

  // Default: return plain text
  return lineText
}

/**
 * Apply animation with staggered delays
 */
export function animateLines(lines: LineElement[], delay: number = 200): void {
  lines.forEach((line, index) => {
    // Set initial state
    line.element.style.transform = 'translateY(100%)'
    line.element.style.transition = 'none'

    // Force reflow
    void line.element.offsetHeight

    // Apply transition with stagger
    setTimeout(
      () => {
        line.element.style.transition = 'transform 1.5s cubic-bezier(0.19, 1, 0.22, 1)'
        line.element.style.transform = 'translateY(0)'
      },
      750 + index * delay,
    ) // 750ms initial delay + stagger
  })
}
