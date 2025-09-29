export interface BoldSegments {
  before: string
  bold: string
  after: string
}

export interface LineWithBoldSegments {
  lines: Array<{
    before: string
    bold: string
    after: string
    fullLine: string
  }>
  hasBold: boolean
}

/**
 * Split a markdown string that contains a single **bold** segment
 * into before / bold / after pieces.
 *
 * If no bold markers are present, `bold` and `after` will be empty.
 */
export function splitBoldSegments(str: string | null | undefined): BoldSegments {
  // Early return for falsy input
  if (!str || typeof str !== 'string') {
    return { before: '', bold: '', after: '' }
  }

  // Early return if no bold markers
  if (!str.includes('**')) {
    return { before: str, bold: '', after: '' }
  }

  const boldRegex = /\*\*(.*?)\*\*/
  const match = boldRegex.exec(str)

  // Early return if no valid match
  if (!match || !match[1]) {
    return { before: str, bold: '', after: '' }
  }

  const start = str.indexOf('**')
  const end = str.indexOf('**', start + 2)

  // Validate positions
  if (start === -1 || end === -1 || end <= start) {
    return { before: str, bold: '', after: '' }
  }

  return {
    before: str.substring(0, start),
    bold: match[1],
    after: str.substring(end + 2),
  }
}

/**
 * Split a markdown string by line breaks, preserving bold markdown on each line.
 * Each line can have its own **bold** segment.
 *
 * @param str - The input string with potential line breaks and bold markdown
 * @returns An object containing an array of lines with their bold segments parsed
 */
export function splitBoldSegmentsByLine(str: string | null | undefined): LineWithBoldSegments {
  // Early return for falsy input
  if (!str || typeof str !== 'string') {
    return { lines: [], hasBold: false }
  }

  // Early return for single line without line breaks
  if (!str.includes('\n')) {
    const singleLineResult = splitBoldSegments(str)
    return {
      lines: [
        {
          before: singleLineResult.before,
          bold: singleLineResult.bold,
          after: singleLineResult.after,
          fullLine: str.replace(/\*\*(.*?)\*\*/g, '$1'),
        },
      ],
      hasBold: Boolean(singleLineResult.bold),
    }
  }

  // Split by line breaks
  const lines = str.split('\n')
  let hasBold = false

  const parsedLines = lines.map((line) => {
    // Skip empty lines quickly
    if (!line) {
      return {
        before: '',
        bold: '',
        after: '',
        fullLine: '',
      }
    }

    // Check for bold markers
    if (!line.includes('**')) {
      return {
        before: line,
        bold: '',
        after: '',
        fullLine: line,
      }
    }

    const boldRegex = /\*\*(.*?)\*\*/
    const match = boldRegex.exec(line)

    if (match && match[1]) {
      hasBold = true
      const start = line.indexOf('**')
      const end = line.indexOf('**', start + 2)

      return {
        before: line.substring(0, start),
        bold: match[1],
        after: line.substring(end + 2),
        fullLine: line.replace(/\*\*(.*?)\*\*/g, '$1'),
      }
    }

    return {
      before: line,
      bold: '',
      after: '',
      fullLine: line,
    }
  })

  return { lines: parsedLines, hasBold }
}
