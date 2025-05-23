export interface BoldSegments {
  before: string
  bold: string
  after: string
}

/**
 * Split a markdown string that contains a single **bold** segment
 * into before / bold / after pieces.
 *
 * If no bold markers are present, `bold` and `after` will be empty.
 */
export function splitBoldSegments(str: string): BoldSegments {
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
