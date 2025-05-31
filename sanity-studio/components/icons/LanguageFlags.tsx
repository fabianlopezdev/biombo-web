
/**
 * Custom SVG component for the Catalan flag (Senyera)
 * The flag consists of nine horizontal stripes alternating between golden yellow and red
 */
export function CatalanFlagIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <rect width="24" height="24" rx="2" fill="#FFD700" />
      {/* 9 stripes of the Senyera */}
      {[...Array(9)].map((_, i) => (
        <rect
          key={i}
          y={i * (24 / 9)}
          width="24"
          height={24 / 9}
          fill={i % 2 === 0 ? '#FFD700' : '#C60B1E'}
        />
      ))}
    </svg>
  )
}

type IconFunction = () => string | JSX.Element

/**
 * Get the appropriate language icon (emoji or SVG component) based on language ID
 */
export function getLanguageIconFn(langId: string): IconFunction {
  const iconMap: Record<string, IconFunction> = {
    ca: () => <CatalanFlagIcon />,
    es: () => '🇪🇸',
    en: () => '🇬🇧',
  }

  return iconMap[langId] || (() => '🌐')
}
