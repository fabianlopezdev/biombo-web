import { toHTML, type PortableTextComponents } from '@portabletext/to-html'
import type { PortableTextBlock } from '@portabletext/types'

/**
 * Converts Portable Text to HTML for use in PageSection component
 * Returns content without wrapper <p> tags since PageSection adds them
 * Used for about pages and services pages
 */
export function portableTextToHtmlForPageSection(content: PortableTextBlock[] | undefined): string {
  if (!content || content.length === 0) return ''

  const components: Partial<PortableTextComponents> = {
    block: {
      normal({ children }): string {
        // Return content with line breaks between blocks
        // PageSection will wrap this in a <p> tag
        return `${children || ''}<br /><br />`
      },
      h1({ children }): string {
        return `<h1>${children || ''}</h1>`
      },
      h2({ children }): string {
        return `<h2>${children || ''}</h2>`
      },
      h3({ children }): string {
        return `<h3>${children || ''}</h3>`
      },
      h4({ children }): string {
        return `<h4>${children || ''}</h4>`
      },
      blockquote({ children }): string {
        return `<blockquote>${children || ''}</blockquote>`
      },
    },
    marks: {
      strong: ({ children }) => `<strong>${children}</strong>`,
      em: ({ children }) => `<em>${children}</em>`,
      underline: ({ children }) => `<u>${children}</u>`,
      code: ({ children }) => `<code>${children}</code>`,
      link: ({
        children,
        value,
      }: {
        children?: string
        value?: { href?: string; blank?: boolean }
      }) => {
        const href = value?.href || '#'
        const target = value?.blank ? 'target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${href}" ${target}>${children}</a>`
      },
    },
    list: {
      bullet: ({ children }) => `<ul>${children}</ul>`,
      number: ({ children }) => `<ol>${children}</ol>`,
    },
    listItem: {
      bullet: ({ children }) => `<li>${children}</li>`,
      number: ({ children }) => `<li>${children}</li>`,
    },
  }

  return toHTML(content, { components }).replace(/<br \/><br \/>$/, '') // Remove trailing line breaks
}

/**
 * Converts Portable Text to HTML for general use
 * Returns content with <p> tags for normal blocks
 * Used for project detail pages and other content
 */
export function portableTextToHtml(content: PortableTextBlock[] | undefined): string {
  if (!content || content.length === 0) return ''

  const components: Partial<PortableTextComponents> = {
    block: {
      normal({ children }): string {
        return `<p>${children || ''}</p>`
      },
      h1({ children }): string {
        return `<h1>${children || ''}</h1>`
      },
      h2({ children }): string {
        return `<h2>${children || ''}</h2>`
      },
      h3({ children }): string {
        return `<h3>${children || ''}</h3>`
      },
      h4({ children }): string {
        return `<h4>${children || ''}</h4>`
      },
      blockquote({ children }): string {
        return `<blockquote>${children || ''}</blockquote>`
      },
    },
    marks: {
      strong: ({ children }) => `<strong>${children}</strong>`,
      em: ({ children }) => `<em>${children}</em>`,
      underline: ({ children }) => `<u>${children}</u>`,
      code: ({ children }) => `<code>${children}</code>`,
      link: ({
        children,
        value,
      }: {
        children?: string
        value?: { href?: string; blank?: boolean }
      }) => {
        const href = value?.href || '#'
        const target = value?.blank ? 'target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${href}" ${target}>${children}</a>`
      },
    },
    list: {
      bullet: ({ children }) => `<ul>${children}</ul>`,
      number: ({ children }) => `<ol>${children}</ol>`,
    },
    listItem: {
      bullet: ({ children }) => `<li>${children}</li>`,
      number: ({ children }) => `<li>${children}</li>`,
    },
  }

  return toHTML(content, { components })
}

/**
 * Converts Portable Text to HTML for legal pages with smart heading detection
 * Detects paragraphs containing only <strong> tags and converts them to headings:
 * - UPPERCASE text → <h2>
 * - lowercase/mixed text → <h3>
 * Used specifically for legal pages where content is pasted with bold formatting
 */
export function portableTextToHtmlForLegalPage(content: PortableTextBlock[] | undefined): string {
  if (!content || content.length === 0) return ''

  // First convert to HTML normally
  let html = portableTextToHtml(content)

  // Regex to find paragraphs containing ONLY a strong tag (with possible whitespace)
  // Pattern: <p> + optional whitespace + <strong>TEXT</strong> + optional whitespace + </p>
  const strongOnlyPattern = /<p>\s*<strong>([^<]+)<\/strong>\s*<\/p>/g

  // Replace each match based on text case
  html = html.replace(strongOnlyPattern, (match, textContent: string) => {
    const trimmedText = textContent.trim()

    // Check if text is all uppercase (ignoring numbers, punctuation, and spaces)
    const lettersOnly = trimmedText.replace(/[^a-zA-ZÀ-ÿ]/g, '')
    const isUppercase = lettersOnly === lettersOnly.toUpperCase() && lettersOnly.length > 0

    if (isUppercase) {
      return `<h2>${trimmedText}</h2>`
    } else {
      return `<h3>${trimmedText}</h3>`
    }
  })

  return html
}

/**
 * Converts Portable Text to plain text (strips all HTML tags)
 * Used for meta descriptions and other places where plain text is needed
 * @param content - The Portable Text content
 * @param maxLength - Optional maximum length (default: 160 for meta descriptions)
 * @returns Plain text string
 */
export function portableTextToPlainText(
  content: PortableTextBlock[] | undefined,
  maxLength = 160,
): string {
  if (!content || content.length === 0) return ''

  // Convert to HTML first
  const html = portableTextToHtml(content)

  // Strip all HTML tags
  const plainText = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()

  // Truncate to maxLength if needed
  if (plainText.length > maxLength) {
    return plainText.substring(0, maxLength - 3) + '...'
  }

  return plainText
}
