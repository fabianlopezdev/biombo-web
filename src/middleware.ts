// src/middleware.ts
import { sequence } from 'astro/middleware'
import { useAstroI18n } from 'astro-i18n'

// Pass your astro-i18n config.
// If you're using a config file at the root, you can omit this.
// const astroI18n = useAstroI18n(config, formatters)
const astroI18n = useAstroI18n()

export const onRequest = sequence(astroI18n)
