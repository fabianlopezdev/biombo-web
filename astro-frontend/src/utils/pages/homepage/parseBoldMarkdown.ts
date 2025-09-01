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
export function splitBoldSegments(str: string | undefined): BoldSegments {
  if (!str) {
    return { before: '', bold: '', after: '' }
  }

  const boldRegex = /\*\*(.*?)\*\*/
  const match = boldRegex.exec(str)

  if (match && match[1]) {
    const start = str.indexOf('**')
    const end = str.indexOf('**', start + 2)

    return {
      before: str.substring(0, start),
      bold: match[1],
      after: str.substring(end + 2),
    }
  }

  return { before: str, bold: '', after: '' }
}

/**
 * Split a markdown string by line breaks, preserving bold markdown on each line.
 * Each line can have its own **bold** segment.
 *
 * @param str - The input string with potential line breaks and bold markdown
 * @returns An object containing an array of lines with their bold segments parsed
 */
export function splitBoldSegmentsByLine(str: string | undefined): LineWithBoldSegments {
  if (!str) {
    return { lines: [], hasBold: false }
  }

  // Split by line breaks
  const lines = str.split('\n')
  let hasBold = false

  const parsedLines = lines.map((line) => {
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
        fullLine: line.replace(/\*\*(.*?)\*\*/, '$1'),
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
